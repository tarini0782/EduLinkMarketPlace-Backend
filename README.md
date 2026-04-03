# EduLink — Backend API

> **SLIIT Year 2 Group Project** — Online Student Life Materials Management System

## Project Overview

EduLink is a full-stack web application built for SLIIT university students. This backend provides the REST API that powers the React frontend. It was created by **merging three feature branches** from the shared `DinujaNethmal/EduLink` repository into a single, unified codebase:

| Branch | Developer | Features |
|--------|-----------|----------|
| `feature/dinuja` | Dinuja | Student profiles, study groups, quiz system, admin analytics dashboard, MongoDB Atlas setup |
| `feature/tarini` | Tarini | JWT authentication, marketplace CRUD (products, cart, orders), admin user/product management |
| `feature/sahlaan` | Sahlaan | Payment gateway — credit card and bank transfer processing |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework for REST API |
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Mongoose 9** | MongoDB ODM (Object Data Modeling) |
| **jsonwebtoken** | JWT token creation and verification |
| **bcryptjs** | Password hashing |
| **cors** | Cross-Origin Resource Sharing |
| **morgan** | HTTP request logger |
| **dotenv** | Environment variable management |

---

## Project Structure

```
EduLinkMarketPlace-Backend/
├── server.js                  # Entry point: mounts routes, connects DB, auto-seeds
├── .env                       # Environment variables
├── config/
│   └── db.js                  # MongoDB Atlas connection using MONGO_URI
├── middleware/
│   └── auth.js                # JWT verification (protect) + role check (adminOnly)
├── models/
│   ├── User.js                # Merged: authentication + student profile fields
│   ├── Product.js             # Marketplace product listings
│   ├── Cart.js                # Shopping cart (per user/guest)
│   ├── Order.js               # Orders with payment status tracking
│   ├── Group.js               # Study/project groups
│   ├── JoinRequest.js         # Group join requests
│   ├── Quiz.js                # Quiz definitions
│   └── Result.js              # Quiz results and scores
├── controllers/
│   ├── authController.js      # register, login, getMe, deleteAccount
│   ├── productController.js   # Product CRUD with search & category filter
│   ├── cartController.js      # Add/update/remove/clear cart items
│   ├── orderController.js     # Buy-now, checkout, order history, processPayment
│   ├── adminController.js     # MERGED: Tarini's CRUD + Dinuja's analytics (13 functions)
│   └── userController.js      # Student profile CRUD by email
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── productRoutes.js       # /api/products/*
│   ├── cartRoutes.js          # /api/cart/*
│   ├── orderRoutes.js         # /api/orders/*
│   ├── adminRoutes.js         # /api/admin/* (all routes require JWT + admin role)
│   └── userRoutes.js          # /api/users/*
├── seeds/
│   └── seedProducts.js        # 10 sample SLIIT products + standalone seed script
└── package.json
```

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Make sure .env exists with valid MONGO_URI (ships with repo)

# 3. Start the server
node server.js
# or
npm start

# Server starts on http://localhost:5000
# First run auto-seeds 10 sample products + default admin user
```

### Default Admin Credentials
- **Email:** `admin@sliit.lk`
- **Password:** `admin123`

---

## Environment Variables (`.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@edulink-cluster.qb8qsmb.mongodb.net/edulink?appName=EduLink-Cluster
JWT_SECRET=sliit-marketplace-secret-key
NODE_ENV=development
```

- `MONGO_URI` — MongoDB Atlas connection string (Dinuja's cluster). **Must include the database name** (`/edulink`) to prevent data scattering.
- `JWT_SECRET` — Secret key for signing JWT tokens. Also used as a fallback in `middleware/auth.js`.

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| POST | `/register` | No | Create account (name, email, password) → returns JWT + user object |
| POST | `/login` | No | Login → returns JWT + user object |
| GET | `/me` | Yes | Get current authenticated user |
| DELETE | `/me` | Yes | Delete own account permanently |

**JWT Token:** Returned on register/login. Expires in **7 days**. Must be sent as `Authorization: Bearer <token>` header.

### Products (`/api/products`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| GET | `/` | No | List all available products. Supports query params: `?category=Electronics`, `?search=arduino`, `?sellerId=...` |
| GET | `/:id` | No | Get a single product by ID |
| POST | `/` | Yes | Create a new product listing. `sellerId` and `sellerName` are auto-set from JWT user. |
| PUT | `/:id` | Yes | Update product (owner only) |
| DELETE | `/:id` | Yes | Delete product (owner only) |

### Cart (`/api/cart`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| GET | `/:userId` | No | Get cart for a user (or guest UUID) |
| POST | `/add` | No | Add item to cart `{ userId, productId, quantity }` |
| PUT | `/update` | No | Update item quantity `{ userId, productId, quantity }` |
| DELETE | `/:userId/item/:productId` | No | Remove a specific item |
| DELETE | `/:userId` | No | Clear entire cart |

> **Guest support:** The frontend generates a `guest-<UUID>` ID for anonymous users so they can use the cart without logging in.

### Orders (`/api/orders`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| POST | `/buy-now` | No | Create single-item order `{ userId, productId, quantity }` |
| POST | `/checkout` | No | Convert entire cart to an order `{ userId }` |
| GET | `/:userId` | No | Get all orders for a user |
| GET | `/detail/:orderId` | No | Get a single order's full details |
| POST | `/:orderId/pay` | No | Process payment — updates order status to "Confirmed" / "paid" and deducts stock (Sahlaan) |
| PUT | `/:orderId/cancel` | No | Cancel an unpaid order — sets status to "Cancelled" and paymentStatus to "failed" |

### Admin (`/api/admin`) — All require JWT + admin role

| Method | Endpoint | Source | Description |
|--------|----------|--------|-------------|
| POST | `/login` | Dinuja | Admin-specific login |
| GET | `/stats` | Tarini | User, product, and order count stats |
| GET | `/users` | Tarini | List all registered users |
| DELETE | `/users/:id` | Tarini | Delete a user |
| PUT | `/users/:id/role` | Tarini | Change user role (user ↔ admin) |
| GET | `/products` | Tarini | List all products (including unavailable) |
| DELETE | `/products/:id` | Tarini | Delete any product |
| GET | `/dashboard-summary` | Dinuja | Dashboard summary statistics |
| GET | `/analytics/marketplace` | Dinuja | Marketplace analytics data |
| GET | `/analytics/quizzes` | Dinuja | Quiz performance analytics |
| GET | `/student-progress` | Dinuja | Student progress tracking data |
| GET | `/products/pending` | Dinuja | Products awaiting approval |
| PUT | `/products/:id/approve` | Dinuja | Approve or reject a product |

### User Profiles (`/api/users`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| GET | `/student?email=...` | No | Get student profile by email |
| PUT | `/student` | No | Update student profile fields |

---

## Data Models

### User Model (Merged — `models/User.js`)

This is the key merged model combining authentication fields from Tarini's branch with student profile fields from Dinuja's branch.

**Auth fields (Tarini):**
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required — hashed with bcrypt before save)
- `studentId` (String)
- `role` (String: "user" | "admin", default: "user")

**Profile fields (Dinuja):**
- `campus`, `degreeProgram`, `year`, `semester` (Strings)
- `skills` (Array of Strings)
- `hasGroup` (Boolean), `groupName` (String)
- `bio` (String)
- `profilePhoto` (String — base64 or URL)

### Product Model (`models/Product.js`)

- `name`, `description` (required)
- `price` (Number, required, min: 0)
- `image` (String, default: "")
- `category` (enum: `Textbooks`, `Electronics`, `Stationery`, `Clothing`, `Food & Drinks`, `Services`, `Other`)
- `sellerId`, `sellerName` (required — auto-set from JWT user on creation)
- `condition` (enum: `New`, `Like New`, `Used - Good`, `Used - Fair`)
- `stock` (Number, default: 1)
- `isAvailable` (Boolean, default: true)

### Order Model (`models/Order.js` — Sahlaan)

- `userId` (String, required)
- `items` (Array of `{ productId, name, price, quantity, image }`)
- `totalAmount` (Number)
- `status` (enum: `Awaiting Payment` → `Confirmed` → `Delivered` → `Cancelled`)
- `paymentStatus` (enum: `pending` → `paid` | `failed` | `refunded`)
- `paymentMethod` (enum: `credit-card` | `bank-transfer`)

### Cart Model (`models/Cart.js`)

- `userId` (String, required)
- `items` (Array of `{ productId (ref), name, price, quantity, image }`)
- `totalAmount` (Number)

---

## Authentication Flow (How JWT Works)

1. **Register / Login** → `authController` creates a JWT containing the user's `id`, signed with `JWT_SECRET`, expires in 7 days
2. **Frontend** stores the token in `localStorage` and sends it as `Authorization: Bearer <token>` on every API request
3. **`protect` middleware** extracts the token from the header, verifies it with `jwt.verify()`, looks up the user in MongoDB, and attaches `req.user`
4. **`adminOnly` middleware** checks if `req.user.role === "admin"` — if not, returns 403 Forbidden
5. **Route protection**: Admin routes use `router.use(protect, adminOnly)` as a blanket guard after the public `/login` endpoint

---

## Auto-Seeding Logic (`server.js`)

On every startup, the server checks:

1. **Products** — If no products with `isAvailable: true` exist, it clears the products collection and inserts 10 sample SLIIT-relevant products (textbooks, calculators, Arduino kits, SLIIT hoodies, etc.)
2. **Admin user** — If no user with `role: "admin"` exists, it creates the default admin account (`admin@sliit.lk` / `admin123`)

The seed data is defined in `seeds/seedProducts.js` and can also be run standalone: `node seeds/seedProducts.js`

---

## How the Branch Merge Was Done

### 1. Admin Controller Merge (`controllers/adminController.js`)

The most significant merge. Combines **13 functions** from two branches:

- **Tarini's CRUD operations** (6 functions): `getStats`, `getUsers`, `deleteUser`, `updateUserRole`, `getAllProducts`, `adminDeleteProduct`
- **Dinuja's analytics functions** (7 functions): `adminLogin`, `getDashboardSummary`, `getMarketplaceAnalytics`, `getQuizAnalytics`, `getStudentProgress`, `getPendingProducts`, `approveProduct`

All routes are mounted under `/api/admin` with blanket `protect + adminOnly` middleware.

### 2. User Model Merge (`models/User.js`)

Combined Tarini's authentication schema (name, email, password with bcrypt pre-save hook, studentId, role) with Dinuja's student profile schema (campus, degreeProgram, year, semester, skills, bio, etc.) into a single Mongoose model.

### 3. Payment Integration (`routes/orderRoutes.js`)

Sahlaan's payment processing was added as `POST /api/orders/:orderId/pay`. The `processPayment` controller:
- Validates the order exists and has status "Awaiting Payment"
- Updates `paymentStatus` to "paid" and `status` to "Confirmed"
- Deducts product stock for each item in the order

### 4. Environment Configuration

All branches now use Dinuja's MongoDB Atlas cluster via the shared `.env` file. The `MONGO_URI` includes the database name `/edulink` to ensure all data goes to the same database.

---

## Team Contributions

| Team Member | Contribution |
|-------------|-------------|
| **Dinuja** | Student profile CRUD, study groups system, quiz system, admin analytics dashboard (marketplace analytics, quiz analytics, student progress), MongoDB Atlas cluster setup and configuration |
| **Tarini** | JWT authentication system (register, login, protect middleware), marketplace product CRUD, shopping cart, order management, admin user and product management, sample product seed data |
| **Sahlaan** | Payment gateway — `processPayment` endpoint, credit card and bank transfer processing logic, Order model with payment status tracking |

---

## Health Check

```
GET /api/health → { "status": "ok", "message": "EduLink API is running" }
GET /           → "EduLink API is successfully running on Express!"
```
