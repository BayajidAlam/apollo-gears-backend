import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';

const createPaymentIntent = catchAsync(async (req, res) => {
    const result = await PaymentService.createPaymentIntent(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Payment intent created successfully',
        data: result,
    });
});

const confirmPayment = catchAsync(async (req, res) => {
    const { rentId, transactionId } = req.body;
    const result = await PaymentService.confirmPayment(rentId, transactionId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payment confirmed successfully',
        data: result
    })
})

export const PaymentController = {
    createPaymentIntent,
    confirmPayment
};
