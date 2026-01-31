# Al Taj Restaurant Management Platform - PRD

## Original Problem Statement
Build a comprehensive, enterprise-level multi-branch restaurant management platform for "Al Taj Restaurant" based in Hubli, Karnataka, India. The system includes a full-stack web application with future native mobile apps.

## User Personas
- **Admin**: Central control for branches, menu, pricing, staff management, and system-wide reporting
- **Branch Manager**: Branch-specific operations and staff oversight
- **Waiter**: Table management and order taking
- **Kitchen Staff**: Order queue management and preparation tracking
- **Customer**: Browse menu, place orders (dine-in, takeaway, delivery), track orders

## Core Requirements
- **Localization**: Indian Rupee (₹), Hubli Karnataka locations
- **Branding**: Official Al Taj logo and authentic menu items
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

### ✅ Completed
1. **Logo & Branding Update (Jan 31, 2025)**
   - Integrated official Al Taj Restaurant logo (`/frontend/public/altaj-logo.png`)
   - Logo displayed on: Landing page, Order page, Login page

2. **Menu Items Update (Jan 31, 2025)**
   - Updated `seed_data.py` with 163 actual menu items from Al Taj Menu Card
   - 11 Categories: Chinese Thrillers, Tandoori Karishma, Starters, Indian Dishes (Chicken & Mutton), Biryani & Rice, Egg Items, Veg, Gravy, Dal, Extras
   - All prices in INR (₹) matching the actual menu card

3. **Backend Setup**
   - FastAPI server with MongoDB connection
   - JWT authentication for multiple roles
   - Admin endpoints for staff management

4. **Frontend Foundation**
   - React app with routing
   - Pages for all user roles
   - Elegant Minimalist landing page

5. **Razorpay Integration**
   - LIVE keys configured
   - Backend endpoints for order creation and verification

### 🔄 In Progress / Pending
1. **OTP Login (BLOCKED)**
   - Backend code exists but requires SMS provider credentials (Twilio)
   - User needs to provide: Account SID, Auth Token, Phone Number

2. **Razorpay Testing**
   - Full end-to-end payment flow needs verification with LIVE keys

3. **UI Redesign**
   - Apply "Elegant Minimalist" design to Admin, Waiter, Kitchen dashboards

### 📋 Backlog
1. **Native Mobile Apps** - React Native for Android & iOS
2. **Backend Refactoring** - Split monolithic server.py into proper structure
3. **Mobile Compatibility Preview** - Screenshots of responsive design

## Database Schema
- `users`: uuid, name, email, phone_number, hashed_password, role, branch_id
- `branches`: uuid, name, location, address, phone, email
- `menu_items`: uuid, name, price, category_id, is_vegetarian, is_available
- `menu_categories`: uuid, name, description, display_order
- `orders`: uuid, order_number, customer_id, branch_id, items, total, status, payment_method
- `tables`: uuid, branch_id, table_number, capacity, location

## Test Credentials
- **Admin**: admin@altaj.com / admin123
- **Customer**: priya.sharma@email.com / customer123

## Key Files
- `backend/server.py` - All backend logic and API endpoints
- `backend/seed_data.py` - Database seeding with actual menu
- `frontend/src/pages/NewLandingPage.js` - Main landing page
- `frontend/src/pages/LandingPage.js` - Order page
- `frontend/src/pages/LoginPage.js` - Authentication page
