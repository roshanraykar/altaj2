# Al Taj Restaurant Management Platform - PRD

## Original Problem Statement
Build a comprehensive, enterprise-level multi-branch restaurant management platform for "Al Taj Restaurant" based in Hubli, Karnataka, India. The system includes a full-stack web application with future native mobile apps.

## User Personas
- **Admin**: Central control for branches, menu, pricing, staff management, and system-wide reporting
- **Branch Manager**: Branch-specific operations and staff oversight
- **Waiter**: Table management and order taking
- **Kitchen Staff**: Order queue management and preparation tracking
- **Delivery Partner**: Pickup ready orders and manage delivery status
- **Customer**: Browse menu, place orders (dine-in, takeaway, delivery), track orders, view order history

## Core Requirements
- **Localization**: Indian Rupee (₹), Hubli Karnataka locations
- **Branding**: Official Al Taj logo and authentic menu items with images
- **Authentication**: Email/password and Mobile OTP login
- **Payments**: Razorpay integration (LIVE keys provided)
- **UI/UX**: "Elegant Minimalist" design, professional and clean

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, React Router
- **Backend**: FastAPI, Pydantic
- **Database**: MongoDB (motor async driver)
- **Authentication**: JWT, passlib for password hashing
- **Payments**: Razorpay

## Current Implementation Status

### ✅ Completed (Jan 31, 2025)

1. **Logo & Branding Update**
   - Integrated official Al Taj Restaurant logo
   - Logo displayed on: Landing page, Order page, Login page, Customer Dashboard

2. **Menu Items with Images & Descriptions**
   - 326 menu items with intelligent descriptions
   - Food images from Unsplash categorized by dish type
   - 11 Categories with proper image mapping

3. **Delivery Fleet Management**
   - Delivery partner model with availability status (Available/Busy/Offline)
   - 6 delivery partners seeded (3 per branch)
   - Vehicle type and number tracking

4. **Delivery Dashboard** (`/delivery`)
   - Orders ready for pickup display
   - **Fixed**: Status flow now works: Picked Up → On the Way → Delivered
   - Availability toggle with proper refresh
   - Partner profile with vehicle info

5. **Table Management**
   - Table states: Vacant → Occupied → Cleaning → Vacant
   - Waiter can manage table status after orders

6. **Customer Dashboard** (`/my-orders`) - NEW
   - Order history with Active/History tabs
   - Stats: Total Orders, Active Orders, Completed, Total Spent
   - Order tracking with status progress bar
   - Real-time updates every 10 seconds

7. **Customer Table Selection**
   - Shows available tables for dine-in orders
   - Table linked to order

8. **Delivery Availability Check**
   - Disables delivery when no partners available

### 🔄 In Progress / Pending
1. **OTP Login (BLOCKED)** - Requires Twilio credentials
2. **Razorpay End-to-End Testing** - Payment flow with LIVE keys

### 📋 Backlog
1. **Native Mobile Apps** - React Native for Android & iOS
2. **Backend Refactoring** - Split monolithic server.py

## Test Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Admin** | admin@altaj.com | admin123 | /admin |
| **Customer** | priya.sharma@email.com | customer123 | /my-orders |
| **Kitchen** | kitchen1.familyrestaurant-oldhubli@altaj.com | kitchen123 | /kitchen |
| **Waiter** | waiter1.familyrestaurant-oldhubli@altaj.com | waiter123 | /waiter |
| **Delivery** | delivery1.familyrestaurant-oldhubli@altaj.com | delivery123 | /delivery |

## Test Flow (Multi-Browser Testing)

### Delivery Order Flow:
1. **Customer** → `/order` → Select "Delivery" → Add items → Checkout
2. **Kitchen** → `/kitchen` → See order → Mark "Preparing" → Mark "Ready"
3. **Delivery** → `/delivery` → See order in "Ready for Pickup" → "Pickup Order"
4. **Delivery** → Click "Mark On The Way" → Click "Mark Delivered"
5. **Customer** → `/my-orders` → See order status update in real-time

### Dine-in Order Flow:
1. **Customer** → `/order` → Select "Dine In" → Select Table → Add items → Checkout
2. **Kitchen** → `/kitchen` → See order → Mark "Preparing" → Mark "Ready"
3. **Waiter** → `/waiter` → See table "Occupied" → See order "Ready" → "Mark Served" → "Complete Order"
4. **Waiter** → Table shows "Cleaning" → Click "Mark Vacant"

## Key Files
- `backend/server.py` - All backend logic and API endpoints
- `backend/seed_data.py` - Database seeding
- `frontend/src/pages/CustomerDashboard.js` - Customer order history
- `frontend/src/pages/DeliveryDashboard.js` - Delivery partner dashboard
- `frontend/src/pages/LandingPage.js` - Order page with menu images

## Test Reports
- `/app/test_reports/iteration_1.json` - Initial features test
- `/app/test_reports/iteration_2.json` - Customer Dashboard & Delivery flow test
