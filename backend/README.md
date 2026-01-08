# KahveQR Backend API

Backend API for KahveQR loyalty wallet app built with Express, Prisma & Neon PostgreSQL.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://neondb_owner:npg_9DCbu4eXtvxU@ep-sweet-hat-agz6ixyx-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with demo data
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/demo` - Demo login (for testing)

### Cafes

- `GET /api/cafes` - Get all cafes
- `GET /api/cafes/nearby?lat=41&lng=29` - Get nearby cafes
- `GET /api/cafes/:id` - Get single cafe

### Memberships (Protected)

- `GET /api/memberships` - Get user's memberships
- `GET /api/memberships/:cafeId` - Get specific membership
- `POST /api/memberships/join` - Join a cafe
- `POST /api/memberships/stamp` - Add stamp
- `POST /api/memberships/redeem` - Redeem reward

### Activities (Protected)

- `GET /api/activities?type=earn&limit=50` - Get user's activities
- `GET /api/activities/stats` - Get activity statistics

### Users (Protected)

- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile

## 🔐 Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 🗄️ Database Schema

- **users** - User accounts
- **cafes** - Coffee shop information
- **memberships** - User-cafe relationships with stamp counts
- **activities** - Transaction history (earn/redeem)

## 🛠️ Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (DB GUI)
- `npm run prisma:seed` - Seed database with demo data

## 📦 Tech Stack

- **Express** - Web framework
- **Prisma** - ORM
- **PostgreSQL** (Neon) - Database
- **JWT** - Authentication
- **Zod** - Validation
- **TypeScript** - Type safety

