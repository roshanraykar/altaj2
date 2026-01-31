# Al Taj Restaurant Management Platform - PRD

## Original Problem Statement
Build a comprehensive, enterprise-level multi-branch restaurant management platform for "Al Taj Restaurant" based in Hubli, Karnataka, India. The system includes a full-stack web application with future native mobile apps.

## User Personas
- **Admin**: Central control for branches, menu, pricing, staff management, and system-wide reporting
- **Branch Manager**: Branch-specific operations and staff oversight
- **Waiter**: Table management and order taking
- **Kitchen Staff**: Order queue management and preparation tracking
- **Delivery Partner**: Pickup ready orders and manage delivery status
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

### ✅ Completed (Jan 31, 2025)

1. **Logo & Branding Update**
   - Integrated official Al Taj Restaurant logo (`/frontend/public/altaj-logo.png`)
   - Logo displayed on: Landing page, Order page, Login page

2. **Menu Items Update**
   - Updated `seed_data.py` with 163 actual menu items from Al Taj Menu Card
   - 11 Categories: Chinese Thrillers, Tandoori Karishma, Starters, Indian Dishes (Chicken & Mutton), Biryani & Rice, Egg Items, Veg, Gravy, Dal, Extras
   - All prices in INR (₹) matching the actual menu card

3. **Delivery Fleet Management** (NEW)
   - Delivery partner model with availability status (Available/Busy/Offline)
   - Admin can create delivery partners from users with delivery_partner role
   - 6 delivery partners seeded (3 per branch)
   - Vehicle type and number tracking

4. **Delivery Dashboard** (NEW)
   - `/delivery` route for delivery partners
   - Shows orders marked "ready" by kitchen
   - Availability toggle (Available/Offline)
   - Order status updates: Picked Up → On the Way → Delivered
   - Partner profile with vehicle info

5. **Table Management Enhancement** (NEW)
   - Table states: Vacant → Occupied → Cleaning → Vacant
   - Waiter can mark table as "cleaning" after order completion
   - Waiter can mark table as "vacant" after cleaning
   - 20 tables seeded (10 per branch)

6. **Customer Dine-in Table Selection** (NEW)
   - Shows available tables when customer selects "Dine-in"
   - Only vacant tables can be selected
   - Table linked to order

7. **Delivery Availability Logic** (NEW)
   - Checks if delivery personnel available before allowing delivery orders
   - Disables delivery option if all personnel busy
   - Shows warning message when delivery unavailable

8. **Order Routing Display** (NEW)
   - Kitchen sees: All orders (all types)
   - Waiter sees: Dine-in orders with table info + serve/complete buttons
   - Delivery sees: Delivery orders after "ready" status

9. **Enhanced Order Status Flow** (NEW)
   - Dine-in: pending → confirmed → preparing → ready → served → completed
   - Takeaway: pending → confirmed → preparing → ready → completed
   - Delivery: pending → confirmed → preparing → ready → picked_up → on_the_way → delivered

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
- `branches`: uuid, name, location, address, phone, email, is_active
- `menu_items`: uuid, name, price, category_id, is_vegetarian, is_available
- `menu_categories`: uuid, name, description, display_order
- `orders`: uuid, order_number, customer_id, branch_id, items, total, status, payment_method, table_id, delivery_partner_id
- `tables`: uuid, branch_id, table_number, capacity, location, status (vacant/occupied/cleaning), current_order_id
- `delivery_partners`: uuid, user_id, branch_id, name, phone, vehicle_type, vehicle_number, status (available/busy/offline), current_order_id

## Test Credentials
- **Admin**: admin@altaj.com / admin123
- **Branch Manager**: manager.familyrestaurant-oldhubli@altaj.com / manager123
- **Waiter**: waiter1.familyrestaurant-oldhubli@altaj.com / waiter123
- **Kitchen**: kitchen1.familyrestaurant-oldhubli@altaj.com / kitchen123
- **Delivery Partner**: delivery1.familyrestaurant-oldhubli@altaj.com / delivery123
- **Customer**: priya.sharma@email.com / customer123

## Key Files
- `backend/server.py` - All backend logic and API endpoints
- `backend/seed_data.py` - Database seeding with actual menu and delivery partners
- `frontend/src/pages/NewLandingPage.js` - Main landing page
- `frontend/src/pages/LandingPage.js` - Order page with table selection
- `frontend/src/pages/LoginPage.js` - Authentication page
- `frontend/src/pages/DeliveryDashboard.js` - Delivery partner dashboard
- `frontend/src/pages/WaiterDashboard.js` - Waiter table & order management
- `frontend/src/pages/KitchenDashboard.js` - Kitchen order queue

## Test Reports
- `/app/test_reports/iteration_1.json` - Full test report (100% pass rate)
- `/app/backend/tests/test_restaurant_features.py` - Pytest test cases
