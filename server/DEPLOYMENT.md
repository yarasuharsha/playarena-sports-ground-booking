# PlayArena Backend Deployment Guide

This document defines the deployment environment requirements, deployment lifecycle sequence, and environment variable configuration for the PlayArena backend (Express + Prisma + PostgreSQL).

---

## 1. Required Environment Variables (Production)

Set these environment variables in your hosting provider's dashboard (e.g. Render Dashboard -> Environment):

| Variable Name | Required | Example / Expected Value | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@ep-xyz.neon.tech/playarena?sslmode=require` | PostgreSQL connection string. See SSL note below. |
| `JWT_SECRET` | **Yes** | `a_very_long_cryptographically_secure_random_string` | Secret key for signing and verifying authentication JWTs. Must be set in production. |
| `JWT_EXPIRES_IN` | Optional | `7d` | Token lifetime (defaults to `7d` if omitted). |
| `CLIENT_URL` | **Yes** | `https://playarena-sports-ground-booking.vercel.app` | Exact URL of the deployed frontend **with NO trailing slash**. Comma-separated list supported for multiple domains. |
| `NODE_ENV` | **Yes** | `production` | Enforces production security checks, strict CORS allowlist, and mandatory secrets. |
| `APP_TIMEZONE` | **Yes** | `Asia/Kolkata` | Canonical timezone used for operational slot scheduling and date calculations. |
| `PORT` | Optional | `5000` | Port for Express server (automatically injected by Render). |

### SSL / Connection Note for Cloud PostgreSQL (e.g., Neon)
Most managed PostgreSQL hosts (including Neon) require SSL encryption. If you encounter SSL handshake or self-signed certificate errors during connection, append `?sslmode=require` to your `DATABASE_URL`:
```
postgresql://user:password@ep-sample-12345.ap-southeast-1.aws.neon.tech/playarena?sslmode=require
```

---

## 2. Deployment Lifecycle Sequence

For zero-downtime, safe deployments, execute operations in this exact order:

```mermaid
flowchart TD
    A["1. Install Dependencies<br>npm install"] --> B["2. Build & Generate Prisma Client<br>npm run build<br>(prisma generate && prisma migrate deploy)"]
    B --> C["3. Seed Initial Production Data (Once Only)<br>npm run seed"]
    C --> D["4. Start Application<br>npm start<br>(node src/server.js)"]
    D --> E["5. Verify Deployment Health<br>GET /api/v1/health/db"]
```

### Detailed Steps:
1. **Build Step (`npm run build`):**
   - Automatically executes `prisma generate` to compile the Prisma client.
   - Automatically executes `prisma migrate deploy` to apply any pending schema migrations to the database.
2. **One-Time Data Seeding (`npm run seed`):**
   - After the first database migration, run `npm run seed` once (either via Render Shell or locally against the production `DATABASE_URL`).
   - This idempotently creates the 6 sports grounds, the demo admin (`admin@playarena.com`), the demo user (`user@playarena.com`), and upcoming 14-day booking slots.
   - It is 100% idempotent: running it again will not duplicate records or wipe existing bookings.
3. **Start Step (`npm start`):**
   - Runs `node src/server.js`.
4. **Health Verification:**
   - Query `GET /api/v1/health/db`.
   - Returns HTTP 200 with database connection status and live counts:
     ```json
     {
       "success": true,
       "data": {
         "status": "UP",
         "database": "connected",
         "counts": {
           "users": 3,
           "grounds": 6,
           "slots": 672
         }
       }
     }
     ```

---

## 3. Extending Time Slots in Production

To keep future booking dates populated indefinitely, schedule or run:
```bash
npm run slots:extend
```
This script adds the next 14 days of slots for all active grounds idempotently, ensuring players always have open upcoming dates to book.
