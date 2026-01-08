# 🚀 KahveQR Setup Guide

Complete setup guide for KahveQR with Neon PostgreSQL backend.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or pnpm installed
- Neon PostgreSQL database (already created)

---

## 🔧 Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
DATABASE_URL="postgresql://neondb_owner:npg_9DCbu4eXtvxU@ep-sweet-hat-agz6ixyx-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="kahveqr-super-secret-key-change-in-production"
PORT=3001
NODE_ENV=development
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

### 6. Seed Database with Demo Data

```bash
npm run prisma:seed
```

This will create:
- 11 cafes (Starbucks, Kahve Dünyası, etc.)
- 1 demo user (demo@kahveqr.com)
- Sample memberships and activities

### 7. Start Backend Server

```bash
npm run dev
```

Backend will run on `http://localhost:3001`

Test it: `http://localhost:3001/health`

---

## 🎨 Frontend Setup

### 1. Navigate to Root Directory

```bash
cd ..  # Go back to project root
```

### 2. Install Dependencies (if not already installed)

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Content:

```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or similar)

---

## 🎯 Testing the Setup

### 1. Open Browser

Navigate to `http://localhost:5173`

### 2. Use Demo Mode

The app will work in offline mode by default (using localStorage).

To test **online mode** with real database:

1. Open browser console
2. Run: 
```javascript
// This will be implemented in the UI, but for now you can test via API
fetch('http://localhost:3001/api/auth/demo', { method: 'POST' })
  .then(r => r.json())
  .then(data => {
    localStorage.setItem('kahveqr_auth_token', data.token);
    location.reload();
  });
```

### 3. Test Features

- ✅ View loyalty cards in wallet
- ✅ Click on a cafe card
- ✅ Add stamps (demo button)
- ✅ Redeem rewards when completed
- ✅ View activity history
- ✅ Check QR code page

---

## 📊 Database Management

### Open Prisma Studio (Database GUI)

```bash
cd backend
npm run prisma:studio
```

Opens at `http://localhost:5555`

### Reset Database

```bash
cd backend
npx prisma migrate reset
npm run prisma:seed
```

---

## 🔍 API Endpoints

### Public Endpoints

- `GET /api/cafes` - Get all cafes
- `GET /api/cafes/nearby?lat=41&lng=29` - Get nearby cafes
- `POST /api/auth/demo` - Demo login

### Protected Endpoints (Require Auth Token)

- `GET /api/memberships` - Get user's loyalty cards
- `POST /api/memberships/join` - Join a cafe
- `POST /api/memberships/stamp` - Add stamp
- `POST /api/memberships/redeem` - Redeem reward
- `GET /api/activities` - Get activity history
- `GET /api/users/me` - Get current user

### Test with cURL

```bash
# Get all cafes
curl http://localhost:3001/api/cafes

# Demo login
curl -X POST http://localhost:3001/api/auth/demo

# Get memberships (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/memberships
```

---

## 🐛 Troubleshooting

### Backend won't start

- Check if PostgreSQL connection string is correct
- Ensure Prisma migrations are run: `npm run prisma:migrate`
- Check if port 3001 is available

### Frontend can't connect to backend

- Ensure backend is running on port 3001
- Check CORS settings
- Verify `.env` has correct `VITE_API_URL`

### Database errors

- Reset database: `npx prisma migrate reset`
- Regenerate client: `npm run prisma:generate`
- Re-seed: `npm run prisma:seed`

---

## 📦 Project Structure

```
kahveqr/
├── backend/                    # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed script
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth middleware
│   │   └── config/            # Database config
│   └── package.json
├── src/                        # React frontend
│   ├── app/                   # Pages & components
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   ├── store.ts          # State management (offline)
│   │   ├── storeWithAPI.ts   # State management (online)
│   │   └── types.ts          # TypeScript types
│   └── main.tsx
└── package.json
```

---

## 🚀 Next Steps

1. ✅ Backend and database are ready
2. ⚠️ Frontend still uses offline mode (localStorage)
3. 🔄 To enable online mode, you need to:
   - Update UI to add login/register flow
   - Replace `store.ts` imports with `storeWithAPI.ts`
   - Add authentication state management

Would you like me to:
- Add login/register UI?
- Update all components to use API?
- Add loading states and error handling?

