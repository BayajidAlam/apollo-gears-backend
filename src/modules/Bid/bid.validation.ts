import { z } from 'zod';

export const createBidValidationSchema = z.object({
  body: z.object({
    rentId: z.string().uuid('Invalid rent ID format'),
    driverId: z.string().uuid('Invalid driver ID format'),
    bidAmount: z.number().positive('Bid amount must be positive'),
    driverLocation: z.string(),
  }),
});

export const updateBidValidationSchema = z.object({
  body: z.object({
    bidAmount: z.number().positive('Bid amount must be positive').optional(),
    bidStatus: z.enum(['accepted', 'pending', 'rejected']).optional(),
    driverLocation: z.string().optional(),
  }),
});

export const BidValidations = {
  createBidValidationSchema,
  updateBidValidationSchema,
};
