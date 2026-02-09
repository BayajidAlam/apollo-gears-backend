# Apollo Gears Backend

A car rental platform backend built with **Express.js**, **Prisma ORM**, and **PostgreSQL**.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: Zod

---

## 📦 Installation

### Prerequisites

- Node.js >= 18.x
- PostgreSQL database (local or cloud like [Neon](https://neon.tech))
- npm or yarn

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/apollo-gears-backend.git
cd apollo-gears-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Generate Prisma Client
npx prisma generate

# 5. Run database migrations
npx prisma migrate dev --name init

# 6. Start development server
npm run dev
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/apollo_gears"
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUND=12
```

---

## 🏗️ Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (Database GUI)
npx prisma studio
```

---

## 📊 Entity-Relationship Diagram (ERD)

![ERD Diagram](./docs/erd-diagram.svg)

**Relationships:**
- **User** (1) → (Many) **Rent**: A user can create multiple rent requests
- **Car** (1) → (Many) **Rent**: A car can be involved in multiple rentals
- **Rent** (1) → (Many) **Bid**: A rent request can receive multiple bids
- **User** (1) → (Many) **Bid**: A driver can place multiple bids

---

## 🔄 Data Flow Diagram

![Data Flow Diagram](./docs/data-flow-diagram.svg)

**Request Lifecycle:**
1. **Client** sends HTTP request
2. **Express Routes** receive and route the request
3. **Auth Middleware** verifies JWT token
4. **Zod Validation** validates request body
5. **Controller** handles the request logic
6. **Service** executes business logic
7. **Prisma ORM** queries PostgreSQL database
8. **Response** flows back as JSON

---

## 📁 Project Structure

```
src/
├── config/          # Environment configuration
├── errors/          # Error handlers (Prisma, Zod, App)
├── interface/       # TypeScript interfaces
├── lib/             # Prisma client instance
├── middlewares/     # Auth, validation, error handlers
├── modules/         # Feature modules
│   ├── Auth/        # Authentication
│   ├── User/        # User management
│   ├── Car/         # Car management
│   ├── Rent/        # Rental management
│   └── Bid/         # Bidding system
├── routes/          # Route definitions
├── utils/           # Utility functions
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

---

## 📮 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | User login | ❌ |
| POST | `/api/v1/auth/register` | User registration | ❌ |
| GET | `/api/v1/cars` | Get all cars | ❌ |
| POST | `/api/v1/cars` | Create car | Admin |
| GET | `/api/v1/users` | Get all users | Admin |
| POST | `/api/v1/rents` | Create rent request | User |
| POST | `/api/v1/bids` | Place bid on rent | Driver |
| PATCH | `/api/v1/bids/:id` | Accept/reject bid | User |

---

## 📄 Postman Collection

Download the [Postman Collection](./apollo%20gears.postman_collection.json) and import it to test all API endpoints.

---

## 📝 License

MIT License
