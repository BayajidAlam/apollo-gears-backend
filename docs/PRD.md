# Apollo Gears - Product Requirements Document (PRD)

## Project Overview

**Name:** Apollo Gears Backend  
**Type:** RESTful API for Car Rental Platform  
**Tech Stack:** Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL

---

## Visual Documentation

### JWT Authentication Flow
![JWT Auth DFD](./dfd-jwt-auth.svg)

### Business Logic Flow  
![Business Logic DFD](./dfd-business-logic.svg)

---

## 1. Core Functionality


### 1.1 User Management
- **Registration**: Users can register with email/password
- **Authentication**: JWT-based auth with access & refresh tokens
- **Roles**: `admin`, `user`, `driver`
- **Profile**: Name, email, profile image, rating

### 1.2 Car Management
- **CRUD Operations**: Create, read, update, delete cars
- **Properties**: name, brand, model, image, fuelType, passengerCapacity, color, condition, rating
- **Search & Filter**: By name, brand, model with pagination

### 1.3 Rent System
- **Create Rent**: User creates a rent request for a car
- **Properties**: startingPoint, destination, rentStatus (pending/ongoing/completed)
- **Flow**: User selects car → Creates rent → Receives driver bids

### 1.4 Bidding System
- **Driver Bids**: Drivers bid on rent requests
- **Properties**: bidAmount, bidStatus (pending/accepted/rejected), driverLocation
- **Accept Bid**: When user accepts a bid, rent status changes to "ongoing"

---

## 2. Database Schema (Prisma/PostgreSQL)

```prisma
// Enums
enum UserRole { admin, user, driver }
enum FuelType { Octane, Hybrid, Electric, Diesel, Petrol }
enum CarCondition { New, Used }
enum RentStatus { pending, ongoing, completed }
enum BidStatus { accepted, pending, rejected }

// Models
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String?
  role      UserRole @default(user)
  img       String?
  rating    Float    @default(0)
  rents     Rent[]
  bids      Bid[]    @relation("DriverBids")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("users")
}

model Car {
  id                String       @id @default(uuid())
  name              String
  brand             String
  model             String
  image             String
  rating            Float        @default(0)
  fuelType          FuelType
  passengerCapacity Int
  color             String
  condition         CarCondition
  rents             Rent[]
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  @@map("cars")
}

model Rent {
  id            String     @id @default(uuid())
  rentStatus    RentStatus @default(pending)
  startingPoint String
  destination   String
  userId        String
  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  carId         String
  car           Car        @relation(fields: [carId], references: [id], onDelete: Cascade)
  bids          Bid[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  @@map("rents")
}

model Bid {
  id             String    @id @default(uuid())
  bidAmount      Float
  bidStatus      BidStatus @default(pending)
  driverLocation String
  rentId         String
  rent           Rent      @relation(fields: [rentId], references: [id], onDelete: Cascade)
  driverId       String
  driver         User      @relation("DriverBids", fields: [driverId], references: [id], onDelete: Cascade)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  @@map("bids")
}
```

---

## 3. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users` | Get all users | Admin |
| GET | `/api/v1/users/:id` | Get user by ID | Admin |
| PATCH | `/api/v1/users/:id` | Update user | Admin |
| DELETE | `/api/v1/users/:id` | Delete user | Admin |

### Cars
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/cars` | Create car | Admin |
| GET | `/api/v1/cars` | Get all cars | Public |
| GET | `/api/v1/cars/:id` | Get car by ID | Public |
| PATCH | `/api/v1/cars/:id` | Update car | Admin |
| DELETE | `/api/v1/cars/:id` | Delete car | Admin |

### Rents
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/rents` | Create rent request | User |
| GET | `/api/v1/rents` | Get all rents | User |
| GET | `/api/v1/rents/:id` | Get rent by ID | User |
| PATCH | `/api/v1/rents/:id` | Update rent status | User |
| DELETE | `/api/v1/rents/:id` | Delete rent | User |

### Bids
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/bids` | Place bid on rent | Driver |
| GET | `/api/v1/bids` | Get all bids | User |
| GET | `/api/v1/bids/:id` | Get bid by ID | User |
| PATCH | `/api/v1/bids/:id` | Accept/reject bid | User |
| DELETE | `/api/v1/bids/:id` | Delete bid | Driver |

---

## 4. Project Structure

```
src/
├── config/index.ts           # Environment config
├── lib/prisma.ts             # Prisma client instance
├── errors/
│   ├── AppError.ts           # Custom error class
│   ├── handlePrismaError.ts  # Prisma error handler
│   ├── handlePrismaValidationError.ts
│   └── handleZodError.ts     # Zod validation errors
├── interface/
│   └── error.ts              # Error type definitions
├── middlewares/
│   ├── auth.ts               # JWT auth middleware
│   ├── globalErrorhandler.ts # Global error handler
│   ├── notFound.ts           # 404 handler
│   └── validateRequest.ts    # Zod validation middleware
├── modules/
│   ├── Auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.route.ts
│   │   ├── auth.service.ts
│   │   ├── auth.utils.ts     # JWT helpers
│   │   └── auth.validation.ts
│   ├── User/
│   │   ├── user.constant.ts
│   │   ├── user.controller.ts
│   │   ├── user.route.ts
│   │   ├── user.service.ts
│   │   ├── user.utils.ts
│   │   └── user.validation.ts
│   ├── Car/
│   │   ├── car.constant.ts
│   │   ├── car.controller.ts
│   │   ├── car.interface.ts
│   │   ├── car.route.ts
│   │   ├── car.service.ts
│   │   └── car.validation.ts
│   ├── Rent/
│   │   ├── rent.controller.ts
│   │   ├── rent.route.ts
│   │   ├── rent.service.ts
│   │   └── rent.validation.ts
│   └── Bid/
│       ├── bid.controller.ts
│       ├── bid.route.ts
│       ├── bid.service.ts
│       └── bid.validation.ts
├── routes/index.ts           # Route aggregator
├── utils/
│   ├── catchAsync.ts         # Async error wrapper
│   └── sendResponse.ts       # Response formatter
├── app.ts                    # Express app setup
└── server.ts                 # Server entry point
```

---

## 5. Technical Specifications

### Environment Variables
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_ACCESS_SECRET=secret_key
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUND=12
```

### Dependencies
**Production:**
- express, cors, cookie-parser, dotenv
- @prisma/client, @prisma/adapter-pg, pg
- bcryptjs, jsonwebtoken
- zod, http-status

**Development:**
- typescript, ts-node-dev, prisma
- eslint, prettier, @types/*

---

## 6. Business Logic Rules

1. **User Registration**: Hash password with bcrypt before storing
2. **Login**: Verify password, return access + refresh tokens as cookies
3. **Auth Middleware**: Verify JWT, check user exists, validate role permissions
4. **Create Rent**: User must be authenticated, car must exist
5. **Place Bid**: Only drivers can bid, rent must be in "pending" status
6. **Accept Bid**: When bid accepted, rent status changes to "ongoing"
7. **Pagination**: All list endpoints support `page`, `limit`, `sortBy`, `sortOrder`
8. **Search**: Cars searchable by name, brand, model

---

## 7. Response Format

### Success Response
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "meta": { "page": 1, "limit": 10, "total": 100 },
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errorSources": [
    { "path": "field_name", "message": "Specific error" }
  ],
  "stack": "..." // Only in development
}
```

---

## 8. Deployment Checklist

1. Set `NODE_ENV=production`
2. Configure PostgreSQL (Neon, Supabase, or self-hosted)
3. Run `npx prisma generate && npx prisma migrate deploy`
4. Build: `npm run build`
5. Start: `npm start`
