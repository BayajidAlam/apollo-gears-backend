### 1. `src/middlewares/auth.ts`
**Instruction:** Create an authentication middleware that verifies JWT tokens using `jsonwebtoken` and `config.jwt_access_secret`. It must accept allowed roles as arguments, check if the user exists and if their role matches the allowed `UserRole` (imported from `../../generated/prisma/client`), attach the decoded user payload to `req.user`, and throw `AppError` with status 401 or 403 for any authentication failures.

### 2. `src/errors/handlePrismaValidationError.ts`
**Instruction:** Create a function `handlePrismaValidationError` that takes a `Prisma.PrismaClientValidationError` and returns a `TGenericErrorResponse` object (statusCode: 400, message: 'Validation Error'). It must extract the specific error message (e.g., missing argument, type mismatch) from the Prisma error and populate the `errorSources` array with the path and message.

### 3. `prisma/seed.ts`
**Instruction:** Create a standalone script to seed a Super Admin user. It must initialize a new `PrismaClient` (imported from `../generated/prisma/client`), hash the password 'superadmin' using `bcrypt`, and use `prisma.user.upsert` to ensure a user with email 'admin@admin.com' and role `UserRole.ADMIN` exists in the database. Log the result and disconnect the client upon completion.

### 4. `src/modules/Car`
**Instruction:** Create the `Car` module with CRUD operations. Implement the controller, service, route, and Zod validation. Use `isDeleted` for soft deletes. Only `ADMIN` can modify cars; `GET` endpoints should be public and support filtering (brand, model).

### 5. `src/modules/Rent`
**Instruction:** Create the `Rent` module. Implement `createRent` (User only, status defaults to PENDING) and retrieval logic (Users see own, Admins see all). Validate that the target Car exists.

### 6. `src/modules/Bid`
**Instruction:** Create the `Bid` module. Drivers can create Bids for PENDING rents. Users can Accept a bid, which updates the Bid status to `ACCEPTED`. Do not update Rent status to ONGOING yet (wait for payment).

### 7. `src/modules/Payment` & Configuration Updates
**Instruction:**
1.  **Update `src/config/index.ts`**: Add `stripe_secret_key` from process.env.
2.  **Update `prisma/schema.prisma`**: Add a `Payment` model (attributes: `id`, `transactionId`, `amount`, `status` [PENDING, PAID, FAILED], `rentId`).
3.  **Create Payment Module:** Implement `initiatePayment` (creates Stripe PaymentIntent, returns clientSecret) and `confirmPayment` (verifies Stripe status, updates Payment to PAID, and updates Rent status to ONGOING). Use the `stripe` package.
