# PlayArena – Sports Ground Booking and Management System
### Academic Integrated Micro-Project: Full Stack, Back-End & Advanced Database Systems

> **Academic Project Submission**  
> **Student Name:** Yarasu HarshaVardhan Reddy  
> **Student Email:** `yarasuharshavardhan.reddy.s.113@kalvium.community`  

**Project Links:**
> **GitHub Repository:** `https://github.com/yarasuharsha/playarena-sports-ground-booking`  
> **Live Demo:** `https://playarena-demo.vercel.app` *(Placeholder)*  

**Local Development URLs:**
> **Backend API Base URL:** `http://localhost:5000/api/v1`  
> **Frontend Web App URL:** `http://localhost:5173`  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technologies Used](#2-technologies-used)
3. [Main Features](#3-main-features)
4. [Project Folder Structure](#4-project-folder-structure)
5. [Prerequisites](#5-prerequisites)
6. [Installation and Setup](#6-installation-and-setup)
7. [Running the Application](#7-running-the-application)
8. [Demo Login Credentials](#8-demo-login-credentials)
9. [API Documentation](#9-api-documentation)
10. [Database Design](#10-database-design)
11. [Booking Rules and Validation](#11-booking-rules-and-validation)
12. [Testing and Troubleshooting](#12-testing-and-troubleshooting)
13. [Academic Project Information](#13-academic-project-information)
14. [Future Enhancements](#14-future-enhancements)
15. [Screenshots, Demo, and Repository Links](#15-screenshots-demo-and-repository-links)

---

## 1. Project Overview

### The Problem
Sports enthusiasts who want to play football, cricket, badminton, tennis, or pickleball often face friction when trying to discover local venues, compare transparent hourly pricing, check court amenities, and reserve specific time slots. Traditional booking relies on manual phone calls, disjointed messaging apps, and manual paper ledgers, resulting in:
- **Scheduling collisions & double-bookings:** Two teams arriving at the same venue for the same hour.
- **Lack of real-time visibility:** Players cannot see live slot status or past/ended slots.
- **Manual admin overhead:** Venue operators lack tools to track bookings, manage slot pricing, and monitor revenue utilization.

### The PlayArena Solution
**PlayArena** is a production-grade sports ground booking and management platform designed to completely eliminate double-booking scheduling conflicts. Developed as an **Academic Integrated Micro-Project**, PlayArena bridges three core software engineering disciplines:
1. **Full Stack Web Development:** A responsive, accessible React single-page application (SPA) with optimistic cache management.
2. **Back End Web Development:** A modular, layered Express.js REST API with input validation, authentication, and structured error handling.
3. **Advanced Database Systems:** A normalized PostgreSQL database utilizing Prisma ORM, partial unique indexing, check constraints, and interactive database transactions to ensure ACID compliance and concurrency safety.

### Target Users
- **Players / General Users:** Discover sports arenas, filter by sport and city, view real-time slot availability, reserve slots atomically, and manage personal booking history.
- **Venue Administrators:** View real-time revenue analytics, create and edit sports grounds, batch-generate recurring daily time slots across calendar ranges, and oversee all system bookings.

---

## 2. Technologies Used

| Layer | Technology | Role & Purpose in Project |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** | Component-based UI library providing declarative rendering, custom hooks, and dynamic view composition. |
| **Build Tool** | **Vite 6** | Ultra-fast development server with Hot Module Replacement (HMR) and optimized production bundling. |
| **Routing** | **React Router DOM v6** | Client-side routing with nested routes, dynamic parameters (`/grounds/:id`), and protected route guards (`ProtectedRoute`, `AdminRoute`). |
| **Server State & Cache** | **TanStack React Query v5** | Declarative data fetching, caching, automatic background refetching, and query cache invalidation on mutations. |
| **Forms & Validation** | **React Hook Form** | Performant, uncontrolled form state management with minimal re-renders for login, registration, and filtering. |
| **HTTP Client** | **Axios** | Promise-based HTTP client configured with a base URL, request interceptors for JWT Bearer tokens, and global error handling. |
| **Icons & UI** | **Lucide React** | Consistent, accessible SVG icon set for sport types, navigation, status indicators, and operational metrics. |
| **Styling** | **Vanilla CSS (Design System)** | Custom, maintainable design system with CSS custom properties (tokens), responsive flex/grid layouts, micro-animations, and a sleek Dark Navy & Emerald theme. |
| **Backend Runtime** | **Node.js (v18+ / v24)** | Asynchronous, event-driven JavaScript server runtime. |
| **Web Framework** | **Express.js v4** | Minimalist web framework structured into a clean layered architecture (Routes → Validators → Controllers → Services → Repositories). |
| **Validation** | **express-validator** | Middleware pipeline enforcing strict type checking, format sanitization, and descriptive 400 Bad Request responses. |
| **Database Engine** | **PostgreSQL (v14+ / v18)** | Relational database management system providing robust ACID guarantees, partial unique indexes, and foreign key integrity. |
| **ORM & Migrations** | **Prisma ORM v5.22** | Type-safe query builder, declarative schema modeling (`schema.prisma`), automated SQL migrations, and interactive transaction handling (`prisma.$transaction`). |
| **Authentication** | **JSON Web Tokens (JWT)** | Stateless authentication with signed tokens containing user IDs and roles (`USER`, `ADMIN`), with 7-day expiration. |
| **Password Security** | **bcryptjs** | Adaptive cryptographic password hashing using 10 salt rounds before storing credentials in PostgreSQL. |
| **Logging & Tracking** | **Morgan & UUID** | HTTP request logging with custom UUID tracking (`X-Request-Id`) passed through headers for request tracing. |
| **Testing** | **Jest & Supertest** | Automated test suite verifying authentication, ground operations, booking lifecycles, and concurrent race-condition safety. |

---

## 3. Main Features

### 1. Ground Discovery & Browsing
- Explore sports facilities across major cities (Bangalore, Hyderabad, Mumbai).
- Verified facility badges displaying court surfaces (FIFA artificial turf, Red clay, Hard court, Synthetic wooden floor), floodlights, locker rooms, and pricing.
- Resilient image rendering with automatic fallback graphics if external image URLs become unreachable.

### 2. Search, Filtering, Sorting & Pagination
- **Keyword Search:** Real-time search across ground names, locations, and sports.
- **Sport Filtering:** Quick-select pills for *All Sports, Football, Cricket, Badminton, Tennis, Basketball, and Pickleball*.
- **City Filtering:** Dedicated location dropdown for Bangalore, Hyderabad, and Mumbai.
- **Sorting:** Sort grounds by *Price: Low to High*, *Price: High to Low*, or *Highest Rated*.
- **Pagination:** Controlled pagination displaying 6 grounds per page with active page indicators and next/previous controls.

### 3. Interactive Slot Selection Matrix
- Date navigation selector defaulting to today's local date, with quick pills for *Today, Tomorrow*, and upcoming dates.
- Clear 1-hour time slot cards with real-time status badges:
  - 🟢 **`OPEN`**: Available future time slot, ready for reservation.
  - 🔴 **`BOOKED`**: Reserved by an active confirmed booking.
  - ⚪ **`ENDED`**: Past date or elapsed time slot on the current day (disabled from booking).
- Guarantees each time slot appears **exactly once** without duplicates or conflicting statuses.

### 4. Atomic Booking & Instant Confirmation
- One-click booking with automatic generation of a unique booking reference code (`PA-YYYYMMDD-XXXX`).
- Trusted backend price calculation: the total amount is computed strictly on the server from the slot's database price, ignoring any client-side tampering.
- Instant feedback modal displaying venue details, booking reference, time range, and total price.

### 5. Booking Cancellation & Slot Restoration
- Players can view their active reservations in the **My Bookings** dashboard.
- 1-click cancellation with an optional cancellation reason.
- Cancelling an active booking automatically flips its status to `CANCELLED` and atomically restores the time slot's availability back to `isAvailable = true` in PostgreSQL.

### 6. Strict Booking Validation & Concurrency Protection
- **Past-Time Restriction:** Rejects any booking request for past calendar dates or time slots that have already started on the current day (enforced using local timezone `Asia/Kolkata`).
- **Anti-Double Booking Guarantee:** Built-in PostgreSQL partial unique constraint (`unique_active_booking_per_slot`) and Prisma interactive transactions guarantee that even under simultaneous concurrent requests for the exact same slot, only one reservation succeeds; competing requests are safely rejected with `409 Conflict`.

### 7. Administrative Management Portal
- **Dashboard Metrics:** Real-time metrics for Total Revenue (₹), Confirmed Bookings count, Slot Utilization %, and Active Grounds count.
- **Ground Management (`/admin/grounds`):** Create new sports grounds, update existing details, or deactivate venues.
- **Batch Slot Generator (`/admin/slots`):** Automatically generate recurring 1-hour daily slots across calendar date ranges for any ground.
- **System-Wide Bookings (`/admin/bookings`):** View, search, and administratively cancel reservations across all users.

### 8. Authentication & Role-Based Access Control (RBAC)
- Secure user registration and login issuing JWT Bearer tokens.
- Role-based authorization distinguishing regular players (`USER`) from venue operators (`ADMIN`).
- Route guards on both frontend and backend preventing unauthorized access to administrative endpoints.

---

## 4. Project Folder Structure

```
Fullstack_microproject/
├── client/                               # Frontend Single Page Application (React + Vite)
│   ├── public/                           # Static public assets and favicon
│   ├── src/
│   │   ├── api/                          # Axios instance and resource endpoints
│   │   │   ├── axios.js                  # Base Axios client with JWT interceptors
│   │   │   └── endpoints.js              # Auth, grounds, slots, bookings, analytics APIs
│   │   ├── components/
│   │   │   └── common/                   # Shared reusable UI components
│   │   │       ├── AdminRoute.jsx        # Admin-only route guard
│   │   │       ├── ErrorBoundary.jsx     # Graceful error catch boundary
│   │   │       ├── Footer.jsx            # Application footer
│   │   │       ├── GroundImage.jsx       # Fallback-protected image loader
│   │   │       ├── LoadingSpinner.jsx    # Accessible loading indicator
│   │   │       ├── Modal.jsx             # Reusable modal dialog
│   │   │       ├── Navbar.jsx            # Header navigation with role awareness
│   │   │       ├── Pagination.jsx        # Numbered pagination component
│   │   │       └── ProtectedRoute.jsx    # Authenticated player route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Global authentication and session state
│   │   ├── pages/                        # Page-level route views
│   │   │   ├── admin/                    # Dedicated administrator management pages
│   │   │   │   ├── AdminBookingsPage.jsx # Admin all-bookings management
│   │   │   │   ├── AdminDashboardPage.jsx# Admin revenue and utilization metrics
│   │   │   │   ├── AdminGroundsPage.jsx  # Admin ground creation and editing
│   │   │   │   └── AdminSlotsPage.jsx    # Admin recurring slot batch generator
│   │   │   ├── GroundDetailsPage.jsx     # Venue details & interactive slot booking
│   │   │   ├── GroundsPage.jsx           # Grounds catalog with search & filters
│   │   │   ├── HomePage.jsx              # Landing page with hero & sport categories
│   │   │   ├── LoginPage.jsx             # Sign-in with quick-fill demo buttons
│   │   │   ├── MyBookingsPage.jsx        # Player personal booking history
│   │   │   ├── NotFoundPage.jsx          # 404 error page
│   │   │   └── RegisterPage.jsx          # New player account registration
│   │   ├── App.jsx                       # Route configuration and providers
│   │   ├── index.css                     # Design system tokens and styles
│   │   └── main.jsx                      # React application entry point
│   ├── index.html                        # HTML5 document template
│   ├── package.json                      # Client dependencies and build scripts
│   ├── vite.config.js                    # Vite configuration with React plugin
│   └── .env.example                      # Client environment template
├── server/                               # Backend REST API (Node.js + Express + Prisma)
│   ├── prisma/                           # Database ORM modeling and migrations
│   │   ├── migrations/                   # Version-controlled SQL migration history
│   │   │   ├── 20261024172746_init/      # Initial normalized schema migration
│   │   │   └── 20261024172805_add_concurrency_and_constraints/ # Partial index & checks
│   │   ├── schema.prisma                 # Prisma schema definition (PostgreSQL)
│   │   └── seed.js                       # Comprehensive database seed script
│   ├── src/
│   │   ├── config/                       # Configuration modules
│   │   │   ├── index.js                  # Validated environment configuration
│   │   │   └── prisma.js                 # Shared Prisma Client instance
│   │   ├── controllers/                  # Express request/response handlers
│   │   │   ├── analytics.controller.js   # Admin metrics aggregation handler
│   │   │   ├── auth.controller.js        # Register, login, profile handlers
│   │   │   ├── booking.controller.js     # Booking creation, listing, cancellation
│   │   │   ├── ground.controller.js      # Ground CRUD handlers
│   │   │   └── slot.controller.js        # Slot queries and batch generation
│   │   ├── errors/                       # Custom application error classes
│   │   │   └── index.js                  # AppError, ConflictError, NotFoundError, etc.
│   │   ├── middleware/                   # Express middleware
│   │   │   ├── auth.js                   # JWT authentication and RBAC authorization
│   │   │   ├── errorHandler.js           # Centralized JSON error response handler
│   │   │   ├── notFound.js               # 404 route-not-found middleware
│   │   │   ├── requestId.js              # Unique request UUID generator
│   │   │   ├── requestLogger.js          # HTTP Morgan logging configuration
│   │   │   └── validate.js               # express-validator result handler
│   │   ├── repositories/                 # Data access layer (Prisma queries)
│   │   │   ├── booking.repository.js     # Booking queries and count operations
│   │   │   ├── ground.repository.js      # Ground queries and filter builders
│   │   │   ├── slot.repository.js        # Slot queries and batch insertions
│   │   │   └── user.repository.js        # User database operations
│   │   ├── routes/                       # RESTful API route definitions
│   │   │   ├── analytics.routes.js       # Admin analytics routes
│   │   │   ├── auth.routes.js            # Authentication routes
│   │   │   ├── booking.routes.js         # Booking lifecycle routes
│   │   │   ├── ground.routes.js          # Ground catalog routes
│   │   │   ├── index.js                  # Master /api/v1 router & /health endpoint
│   │   │   └── slot.routes.js            # Slot generation routes
│   │   ├── services/                     # Business logic and transaction boundaries
│   │   │   ├── analytics.service.js      # Revenue and utilization calculations
│   │   │   ├── auth.service.js           # Password verification and token generation
│   │   │   ├── booking.service.js        # Atomic booking and cancellation transactions
│   │   │   ├── ground.service.js         # Ground catalog and filtering business logic
│   │   │   └── slot.service.js           # Slot availability and status calculations
│   │   ├── utils/                        # Utility helper functions
│   │   │   ├── dateTime.js               # Date normalization and timezone calculations
│   │   │   ├── jwt.js                    # JWT signing and verification
│   │   │   ├── password.js               # bcrypt hashing and comparison
│   │   │   └── response.js               # Standardized JSON response formatting
│   │   ├── app.js                        # Express app setup and middleware pipeline
│   │   └── server.js                     # Server entry point with graceful shutdown
│   ├── tests/                            # Automated Jest & Supertest integration tests
│   │   ├── auth.test.js                  # 7 authentication and profile tests
│   │   ├── booking.test.js               # 7 booking lifecycle & validation tests
│   │   ├── concurrency.test.js           # 5 race condition & conflict tests
│   │   └── grounds.test.js               # 8 ground catalog and RBAC tests
│   ├── package.json                      # Backend dependencies and test scripts
│   └── .env.example                      # Backend environment template
├── docs/                                 # Project documentation and submission artifacts
│   ├── reports/                          # Subject micro-project reports (MD + PDF)
│   │   ├── AdvancedDatabaseSystems_Report.md
│   │   ├── AdvancedDatabaseSystems_Report.pdf
│   │   ├── BackEndWebDevelopment_Report.md
│   │   ├── BackEndWebDevelopment_Report.pdf
│   │   ├── FullStackWebDevelopment_Report.md
│   │   └── FullStackWebDevelopment_Report.pdf
│   ├── screenshots/                      # Real application UI screenshots
│   │   ├── playarena_admin.jpg           # Admin dashboard screenshot
│   │   ├── playarena_details.jpg         # Ground details & slot booking screenshot
│   │   └── playarena_home.jpg            # Home page & ground catalog screenshot
│   ├── database_explain_analyze.sql      # SQL query analysis scripts
│   └── postman_collection.json           # Postman API test collection
├── submission/                           # Packaged submission ZIP archives
├── README.md                             # Comprehensive project documentation
└── .gitignore                            # Git exclusion rules
```

---

## 5. Prerequisites

Before installing and running PlayArena, ensure the following software is installed on your Windows system:

1. **Node.js:** Version `18.0.0` or later (tested on Node `v24.21.0`).  
   Verify installation in PowerShell:
   ```powershell
   node -v
   ```
2. **npm:** Version `9.0.0` or later.  
   Verify installation:
   ```powershell
   npm -v
   ```
3. **PostgreSQL:** Version `14.0` or later (tested on PostgreSQL `18.6`).  
   Ensure the PostgreSQL service is running locally on default port `5432`.
4. **Git:** (Optional) For cloning and version control.

---

## 6. Installation and Setup

Follow these step-by-step instructions in **Windows PowerShell** to configure the project from scratch.

### Step 1: Open Project Directory
```powershell
cd "C:\Users\yaras\OneDrive\Desktop\Fullstack_microproject"
```

### Step 2: Install Backend Dependencies
```powershell
cd server
npm install
cd ..
```

### Step 3: Install Frontend Dependencies
```powershell
cd client
npm install
cd ..
```

### Step 4: Configure Backend Environment Variables (`server/.env`)
Create a `.env` file in the `server` directory.

> [!IMPORTANT]
> The `.env` file contains sensitive database credentials and JWT signing keys. **Never commit real `.env` files to GitHub.**

Create `server/.env` with the following template, replacing `YOUR_POSTGRES_PASSWORD` with your local PostgreSQL password:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
APP_TIMEZONE=Asia/Kolkata

# PostgreSQL Connection String (Prisma format)
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/playarena_db?schema=public"

# JWT Authentication
JWT_SECRET="playarena_super_secret_jwt_key_2026_educational_dev"
JWT_EXPIRES_IN="7d"
```

### Step 5: Configure Frontend Environment Variables (`client/.env`)
Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Step 6: Create the PostgreSQL Database
Open PowerShell and create the database using PostgreSQL's `createdb` command (or through pgAdmin / psql):

```powershell
createdb -U postgres playarena_db
```
*(Enter your PostgreSQL password when prompted).*

### Step 7: Generate Prisma Client & Apply Migrations
Navigate to the `server` directory to generate the Prisma Client and apply the existing database schema migrations:

```powershell
cd server
npx prisma generate
npx prisma migrate deploy
```

> [!TIP]
> `npx prisma migrate deploy` applies the existing version-controlled migrations (including the schema tables, domain check constraints, and the PostgreSQL partial unique index) safely without prompting for database resets.

### Step 8: Database Seeding

The seed script (`server/prisma/seed.js`) is **safe and idempotent**. It uses upserts and non-destructive inserts (`skipDuplicates: true`) so it can be run safely against development and production databases without wiping existing users or booking records. (Destructive wipe is strictly opt-in via `SEED_RESET=true` in non-production environments).

To initialize the demo accounts, venues, and booking slots:

```powershell
cd server
npm run seed
```

This populates:
- **3 User accounts:** 1 Admin (`admin@playarena.com`), 2 Regular Players (`user@playarena.com`, `aditi@playarena.com`)
- **6 Sports venues:** Premium arenas across Bangalore, Hyderabad, and Mumbai
- **Hourly time slots:** Configurable via `SEED_SLOT_DAYS` (default: 14 days × 8 daily slots = 112 slots per venue, 672 slots total)
- **Demonstration bookings:** Initial sample reservations (created only if no bookings exist)

After seeding, return to the project root:
```powershell
cd ..
```

---

## 7. Running the Application

To run the application locally, open **two separate PowerShell terminals**.

### Terminal 1: Start Backend Server
```powershell
cd "C:\Users\yaras\OneDrive\Desktop\Fullstack_microproject\server"
npm run dev
```
- The backend will start with `nodemon`.
- Server runs on: **`http://localhost:5000`**
- API Base URL: **`http://localhost:5000/api/v1`**

**Verify Backend:** Open your web browser or run `curl http://localhost:5000/api/v1/health`. You should receive:
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "service": "PlayArena API",
    "uptimeSeconds": 12
  }
}
```

### Terminal 2: Start Frontend Application
```powershell
cd "C:\Users\yaras\OneDrive\Desktop\Fullstack_microproject\client"
npm run dev
```
- The Vite development server will start instantly.
- Open your web browser and navigate to: **`http://localhost:5173`**

---

## 8. Demo Login Credentials

For academic demonstration, evaluator testing, and mentor grading, pre-configured demo credentials are provided.

> [!NOTE]
> These credentials work with the pre-seeded local database. Quick-fill buttons (`Fill User Demo` and `Fill Admin Demo`) are also conveniently placed on the `/login` screen.

| Role | Email | Password | Intended Use & Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@playarena.com` | `AdminPass123!` | Test the **Admin Portal** (`/admin/dashboard`), create/edit grounds, batch-generate recurring slots, and manage system-wide bookings. |
| **Regular Player** | `user@playarena.com` | `Password123!` | Test ground discovery, slot booking, viewing **My Bookings** (`/my-bookings`), and cancelling personal reservations. |
| **Player 2 (Aditi)** | `aditi@playarena.com` | `Password123!` | Used for multi-user authorization and concurrent booking collision testing. |

---

## 9. API Documentation

All REST API endpoints are prefixed with `/api/v1`. Express controllers return standardized JSON responses:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional descriptive status message"
}
```

### Endpoint Reference Table

| Method | Endpoint | Description | Access Requirement |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/health` | System health check, uptime, and status | Public |
| **POST** | `/api/v1/auth/register` | Register a new regular player account | Public |
| **POST** | `/api/v1/auth/login` | Authenticate player or admin and issue JWT | Public |
| **GET** | `/api/v1/auth/me` | Fetch authenticated user profile | Authenticated (JWT) |
| **PATCH** | `/api/v1/auth/profile` | Update profile name or phone number | Authenticated (JWT) |
| **GET** | `/api/v1/grounds` | List grounds with search, filter, sort, pagination | Public |
| **GET** | `/api/v1/grounds/:id` | Get details and facilities of a single ground | Public |
| **GET** | `/api/v1/grounds/:id/slots` | Get slots for ground on `?date=YYYY-MM-DD` | Public |
| **POST** | `/api/v1/grounds` | Create a new sports ground venue | Admin Only |
| **PATCH** | `/api/v1/grounds/:id` | Update sports ground details | Admin Only |
| **DELETE** | `/api/v1/grounds/:id` | Deactivate/delete a sports ground | Admin Only |
| **POST** | `/api/v1/slots` | Create a single custom time slot | Admin Only |
| **POST** | `/api/v1/slots/batch` | Batch-generate recurring slots across date range | Admin Only |
| **DELETE** | `/api/v1/slots/:id` | Delete an unbooked time slot | Admin Only |
| **POST** | `/api/v1/bookings` | Atomically book an available time slot | Authenticated (JWT) |
| **GET** | `/api/v1/bookings` | List user's bookings (or filtered list) | Authenticated (JWT) |
| **GET** | `/api/v1/bookings/admin/all` | List all system bookings with filters | Admin Only |
| **GET** | `/api/v1/bookings/:id` | Get single booking receipt details | Owner or Admin |
| **PATCH** | `/api/v1/bookings/:id/cancel` | Cancel booking and release time slot | Owner or Admin |
| **GET** | `/api/v1/analytics/dashboard` | Aggregated revenue and slot utilization metrics | Admin Only |

*(A complete Postman test collection is provided in [`docs/postman_collection.json`](file:///c:/Users/yaras/OneDrive/Desktop/Fullstack_microproject/docs/postman_collection.json)).*

---

## 10. Database Design

The database schema is modeled in **Third Normal Form (3NF)** in [`server/prisma/schema.prisma`](file:///c:/Users/yaras/OneDrive/Desktop/Fullstack_microproject/server/prisma/schema.prisma) and deployed to PostgreSQL.

### Entity Relationship Overview

```
 +-----------------+          1:N          +-----------------+
 |      User       |---------------------->|     Booking     |
 | (Player / Admin)|                       | (CONFIRMED etc) |
 +-----------------+                       +-----------------+
                                                    |
                                                    | N:1
                                                    v
 +-----------------+          1:N          +-----------------+
 |     Ground      |---------------------->|      Slot       |
 | (Venues/Turfs)  |                       | (1-Hour Ranges) |
 +-----------------+                       +-----------------+
         |                                          ^
         +------------------------------------------+
                           1:N
```

### Models & Schema Specifications

#### 1. `users`
- `id` (Int, Primary Key, Autoincrement)
- `email` (String, Unique)
- `password` (String, bcrypt hash)
- `name` (String), `phone` (String, Optional)
- `role` (Enum: `USER`, `ADMIN`, Default: `USER`)
- `createdAt`, `updatedAt` (Timestamps)

#### 2. `grounds`
- `id` (Int, Primary Key, Autoincrement)
- `name` (String), `sportType` (String), `description` (Text)
- `location` (String), `city` (String)
- `hourlyPrice` (Decimal 10,2) – *Protected by `CHECK ("hourlyPrice" > 0)`*
- `imageUrl` (Text), `facilities` (String Array), `isActive` (Boolean, Default: `true`)
- `rating` (Float, Default: `4.8`)
- Indexes: `[sportType, city, isActive]`, `[city]`

#### 3. `slots`
- `id` (Int, Primary Key, Autoincrement)
- `groundId` (Int, Foreign Key → `grounds.id`, `onDelete: Cascade`)
- `date` (Date `@db.Date`)
- `startTime` (String, e.g., `"17:00"`), `endTime` (String, e.g., `"18:00"`)
- `price` (Decimal 10,2) – *Protected by `CHECK ("price" >= 0)`*
- `isAvailable` (Boolean, Default: `true`)
- **Composite Unique Constraint:** `@@unique([groundId, date, startTime])`
- Indexes: `[groundId, date]`, `[date, isAvailable]`

#### 4. `bookings`
- `id` (Int, Primary Key, Autoincrement)
- `bookingReference` (String, Unique, e.g., `"PA-20261025-ABCD"`)
- `userId` (Int, Foreign Key → `users.id`, `onDelete: Restrict`)
- `groundId` (Int, Foreign Key → `grounds.id`, `onDelete: Restrict`)
- `slotId` (Int, Foreign Key → `slots.id`, `onDelete: Restrict`)
- `totalAmount` (Decimal 10,2) – *Protected by `CHECK ("totalAmount" >= 0)`*
- `status` (Enum: `HELD`, `CONFIRMED`, `CANCELLED`, Default: `CONFIRMED`)
- `notes` (String, Optional)
- Indexes: `[userId, status]`, `[groundId, createdAt]`, `[status]`

### Advanced Database Constraints
1. **PostgreSQL Partial Unique Index (`unique_active_booking_per_slot`):**
   ```sql
   CREATE UNIQUE INDEX unique_active_booking_per_slot 
   ON "bookings" ("slotId") 
   WHERE "status" IN ('HELD', 'CONFIRMED');
   ```
   *Guarantees at the database engine level that no two concurrent transactions can book the same slot.*
2. **Referential Integrity:** Grounds deletion cascades to slots (`onDelete: Cascade`), but is restricted if active bookings reference the ground or slot (`onDelete: Restrict`).

---

## 11. Booking Rules and Validation

1. **Past Date and Time Restriction:**
   - Evaluated against the server/ground local timezone (`Asia/Kolkata`).
   - If `slot.date < currentDate` or (`slot.date === currentDate` and `slot.startTime <= currentTime`), the slot is marked as `ENDED` (`isPast: true`).
   - Booking attempts for ended slots are rejected by the backend with `400 Bad Request`.
2. **Trusted Backend Price Calculation:**
   - The booking total is calculated strictly from `slot.price` stored in PostgreSQL. Client-supplied price payloads are completely ignored.
3. **Atomic Concurrency Control:**
   - Bookings are executed inside an interactive Prisma transaction (`prisma.$transaction`).
   - The transaction re-fetches the slot with a lock, validates availability, creates the booking record, and updates `isAvailable: false`.
   - If two requests collide simultaneously, the PostgreSQL partial unique index throws code `P2002`, which our centralized error handler translates into a clean `409 Conflict` ("This time slot is no longer available").
4. **Cancellation Lifecycle:**
   - Only the booking owner or an administrator can cancel a booking.
   - When cancelled, `status` becomes `CANCELLED`, and the slot's `isAvailable` flag is atomically reset to `true`.

---

## 12. Testing and Troubleshooting

### Automated Testing
The project includes an automated integration test suite built with **Jest** and **Supertest** located in `server/tests/`.

To run all automated tests:
```powershell
cd server
npm test
```

### Verified Test Results
```
 PASS  tests/grounds.test.js
 PASS  tests/auth.test.js
 PASS  tests/booking.test.js
 PASS  tests/concurrency.test.js

Test Suites: 4 passed, 4 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        2.541 s
```
- `auth.test.js` (7 tests): Registration, login, profile retrieval, duplicate email rejection.
- `grounds.test.js` (8 tests): Public listing, multi-sport filtering, city filtering, slot retrieval, admin-only protection.
- `booking.test.js` (7 tests): Slot booking lifecycle, cancellation, past-date rejection, owner authorization.
- `concurrency.test.js` (5 tests): Concurrency collision test using `Promise.all` simulating simultaneous competing requests.

To verify the frontend production build:
```powershell
cd client
npm run build
# vite v6.x building for production...
# ✓ 1707 modules transformed.
# ✓ built in 3.12s
```

### Common Troubleshooting Steps

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`ECONNREFUSED 127.0.0.1:5432`** | PostgreSQL service is stopped. | Open Windows Services (`services.msc`), find **postgresql-x64-XX**, and click **Start**. |
| **`PrismaClientInitializationError` / Authentication failed** | Incorrect password in `server/.env`. | Update `DATABASE_URL` in `server/.env` with your correct PostgreSQL password. |
| **`database "playarena_db" does not exist`** | Database has not been created yet. | Run `createdb -U postgres playarena_db` in PowerShell. |
| **`Cannot find module '@prisma/client'`** | Prisma Client has not been generated. | In `server`, run `npx prisma generate`. |
| **Port 5000 or 5173 in use** | A dangling Node process is occupying the port. | In PowerShell: `Get-Process node \| Stop-Process -Force`, then restart the server. |
| **CORS Error in Browser Console** | `CLIENT_URL` in `server/.env` does not match Vite port. | Ensure `CLIENT_URL=http://localhost:5173` in `server/.env`. |
| **Demo credentials fail to login (`401 Invalid credentials`)** | Database has not been seeded with demo users. | Run `npm run seed` in `server`. |

---

## 13. Academic Project Information

This project was built to satisfy the integrated requirements of three computer science curriculum tracks:

### 1. Full Stack Web Development
- Implementation of a clean Single Page Application (SPA) architecture in React 18.
- Integration of TanStack Query for server-state synchronization and cache invalidation.
- Responsive, accessible Vanilla CSS design system avoiding heavy utility frameworks.
- Client-side route protection (`ProtectedRoute`, `AdminRoute`) and JWT token management.

### 2. Back End Web Development
- Modular layered architecture (Routes → Validators → Controllers → Services → Repositories).
- Strict validation middleware using `express-validator`.
- Centralized operational error handling with distinct status codes (`400`, `401`, `403`, `404`, `409`, `500`).
- Comprehensive integration testing using Jest and Supertest.

### 3. Advanced Database Systems
- Relational schema normalized to Third Normal Form (3NF).
- Declarative schema modeling, migrations, and relationship handling via Prisma ORM.
- Concurrency management through PostgreSQL partial unique indexing and interactive transactions.
- Performance optimization with targeted B-tree indexes and domain check constraints.

---

## 14. Future Enhancements

The following features represent realistic planned extensions for future iterations:
- **Payment Gateway Integration:** Direct payment checkout using Razorpay or Stripe webhooks.
- **SMS & WhatsApp Alerts:** Automated reservation reminders and receipt links via Twilio.
- **Turf Partner Portal:** Multi-tenant dashboard allowing individual venue owners to register and manage their own venues.
- **Multi-Slot Selection:** Allowing users to select and book consecutive 2–3 hour time blocks in a single transaction.
- **Dynamic Weather Widget:** Live weather forecast integration for open-air turf bookings.

---

## 15. Screenshots, Demo, and Repository Links

### Application Screenshots

#### 1. Home Page & Ground Catalog
![PlayArena Home Page](docs/screenshots/playarena_home.jpg)
*Browsing sports arenas with keyword search, multi-sport filtering, and transparent hourly rates.*

#### 2. Ground Details & Slot Selection
![PlayArena Slot Booking](docs/screenshots/playarena_details.jpg)
*Real-time slot matrix showing OPEN, BOOKED, and ENDED statuses with anti-double booking protection.*

#### 3. Administrative Portal & Operations Dashboard
![PlayArena Admin Portal](docs/screenshots/playarena_admin.jpg)
*Operational revenue metrics, slot utilization rates, ground management, and batch slot generation.*

### Project Links
- **GitHub Repository:** `https://github.com/yarasuharsha/playarena-sports-ground-booking`
- **Live Deployment:** `https://playarena-demo.vercel.app` *(Placeholder)*
- **Documentation & Reports:** Located in [`docs/reports/`](file:///c:/Users/yaras/OneDrive/Desktop/Fullstack_microproject/docs/reports)
