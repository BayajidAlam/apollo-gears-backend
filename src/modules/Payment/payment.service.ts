import Stripe from 'stripe';
import config from '../../config';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TPaymentIntent, TIPaymentResult, TPaymentConfirmation } from './payment.interface';

const stripe = new Stripe(config.stripe_secret_key as string, {
    apiVersion: '2023-10-16' as any,
});

const createPaymentIntent = async (payload: TPaymentIntent): Promise<TIPaymentResult> => {
    const { rentId } = payload;

    const rent = await prisma.rent.findUnique({
        where: { id: rentId },
        include: {
            bids: {
                where: {
                    bidStatus: 'accepted',
                },
            },
            user: true,
        },
    });

    if (!rent) {
        throw new AppError(httpStatus.NOT_FOUND, 'Rent not found');
    }

    if (rent.rentStatus !== 'pending') { // Or check if already paid via Relation
        // We can check if a payment already exists for this rent
        const existingPayment = await prisma.payment.findUnique({
            where: { rentId: rentId }
        });
        if (existingPayment && existingPayment.status === 'succeeded') {
            throw new AppError(httpStatus.BAD_REQUEST, 'Rent is already paid for');
        }
    }

    const acceptedBid = rent.bids[0];
    if (!acceptedBid) {
        throw new AppError(httpStatus.BAD_REQUEST, 'No accepted bid found for this rent');
    }

    const amount = acceptedBid.bidAmount;
    // Stripe expects amount in cents
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
            rentId: rent.id,
            userId: rent.userId
        },
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'always',
        },
    });

    return {
        clientSecret: paymentIntent.client_secret as string,
        amount: amount,
        transactionId: paymentIntent.id
    };
};


const savePaymentRecord = async (payload: TPaymentConfirmation) => {
    // This could be called via webhook or manual confirmation endpoint
    const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
            data: {
                rentId: payload.rentId,
                transactionId: payload.transactionId,
                amount: payload.amount,
                status: payload.status,
                paymentGatewayData: payload.gatewayData
            }
        });

        if (payload.status === 'succeeded') {
            await tx.rent.update({
                where: { id: payload.rentId },
                data: { rentStatus: 'ongoing' } // Or 'confirmed' depending on business logic
            })
        }

        return payment;
    });

    return result;
}

const confirmPayment = async (rentId: string, transactionId: string) => {
    // Verify with stripe
    let paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    if (paymentIntent.status === 'requires_payment_method') {
        // For testing/mocking: confirm with a test card
        paymentIntent = await stripe.paymentIntents.confirm(transactionId, {
            payment_method: 'pm_card_visa',
        });
    }

    if (paymentIntent.status === 'succeeded') {
        const amount = paymentIntent.amount / 100;

        // Check if payment record already exists to avoid duplicates
        const existingPayment = await prisma.payment.findUnique({
            where: { transactionId }
        });

        if (existingPayment) {
            return existingPayment;
        }

        // Save record
        return await savePaymentRecord({
            rentId,
            transactionId,
            amount: amount,
            status: 'succeeded',
            gatewayData: paymentIntent as unknown as Record<string, any>
        });
    } else {
        throw new AppError(httpStatus.BAD_REQUEST, `Payment status is ${paymentIntent.status}`);
    }
}


export const PaymentService = {
    createPaymentIntent,
    confirmPayment
};
