import { Router } from 'express';
// import { USER_ROLE } from './user.constant'; // Assuming we have roles defined
import { PaymentController } from './payment.controller';
// import auth from '../../middlewares/auth'; // Assuming auth middleware exists

const router = Router();

// Define routes
router.post(
    '/create-payment-intent',
    // auth(USER_ROLE.user), // Add auth middleware if needed
    PaymentController.createPaymentIntent
);

router.post(
    '/confirm',
    // auth(USER_ROLE.user),
    PaymentController.confirmPayment
)

export const PaymentRoutes = router;
