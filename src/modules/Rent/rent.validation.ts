import { z } from 'zod';

export const createRentValidationSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID format'),
    carId: z.string().uuid('Invalid car ID format'),
    startingPoint: z.string(),
    destination: z.string(),
  }),
});

export const updateRentValidationSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID format').optional(),
    carId: z.string().uuid('Invalid car ID format').optional(),
    rentStatus: z.enum(['pending', 'ongoing', 'completed']).optional(),
    startingPoint: z.string().optional(),
    destination: z.string().optional(),
  }),
});

export const RentValidations = {
  createRentValidationSchema,
  updateRentValidationSchema,
};
