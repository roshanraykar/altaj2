# Al Taj Restaurant Management Platform - PRD

## Original Problem Statement
Build a comprehensive, enterprise-level multi-branch restaurant management platform for "Al Taj Restaurant" based in Hubli, Karnataka, India. The system includes a full-stack web application with future native mobile apps.

## User Personas
- **Admin**: Central control for branches, menu, pricing, staff management, and system-wide reporting
- **Branch Manager**: Branch-specific operations and staff oversight
- **Kitchen Staff**: Order queue management and preparation tracking
- **Delivery Partner**: Pickup ready orders and manage delivery status
- **Customer**: Browse menu, place orders (takeaway, delivery), track orders, view order history
- **Waiter**: (Temporarily disabled)

## Brand Colors
- **Primary Red**: #b2101f, #e70825
- **Gold Accent**: #c59433
- **White Background**

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, React Router
- **Backend**: FastAPI, Pydantic
- **Database**: MongoDB (motor async driver)
- **Authentication**: JWT, passlib for password hashing
- **Payments**: Razorpay (LIVE keys)
- **Maps**: Google Maps API for location detection

## Current Implementation Status

### ✅ Completed Features (Feb 19, 2025 - Session 2)

1. **Review/Feedback System (COMPLETE)**
   - **Customer Side:**
     - Auto-popup after delivery (max 3 dismissals per order)
     - "Rate This Order" button in Order History for delivered orders
     - 1-5 star rating with optional text review (500 chars max)
     - Character counter and submission confirmation
   - **Admin Side:**
     - New "Reviews" tab in Admin Dashboard
     - Stats cards: Average rating, Total reviews, Published/Private counts
     - Rating distribution bar chart
     - Filters by status (All/Private/Published) and rating
     - Publish/Unpublish reviews
     - Reply to reviews (300 chars max)
     - Delete reviews with confirmation
   - **Public Display:**
     - "Customer Reviews" section on homepage
     - Shows only published reviews
     - Displays: name, stars, review text, admin reply, date
     - Overall rating summary

2. **Coupon Management System (COMPLETE)**
   - Admin panel "Coupons" tab
   - Create coupons: code, discount type (% or fixed), value, min order, max discount, dates, usage limit
   - Toggle coupon active/inactive
   - Delete coupons
   - Backend validation endpoints ready

3. **Print Order Feature (Kitchen)**
   - "Print Order" button on each order card
   - Formats for 58mm/2-inch thermal receipt printers
   - Shows: Order #, items with quantity, special instructions, timestamp

4. **Google/Facebook Login Removed**
   - Only Email and Mobile OTP login options remain

5. **Buzzer Sound Logic Fixed**
   - Audio stops immediately when toggled off (Kitchen & Delivery dashboards)

6. **UI Improvements:**
   - "Detect Nearest Location" button text
   - Gold-colored "Get App" button (visible on both pages)
   - Floating download button removed from order page

### ✅ Completed Features (Feb 19, 2025 - Session 1)

1. **Homepage Product Images Updated**
   - Chicken Biryani, Butter Chicken, Tandoori Chicken with real food photos
   - Images hosted on customer-assets.emergentagent.com

2. **Homepage Special Sections**
   - **Combos Highlight**: 3 combo cards (Family Feast, Couple Special, Solo Delight) with gradient styling
   - **Raw Meat & Ready to Cook Section**: Cards with icons, tags (Chicken, Mutton, Fish), gradient backgrounds

3. **Order Page Accordion Menu**
   - All menu categories displayed as collapsible accordions
   - Collapsed by default for optimized space
   - Click to expand/collapse each category
   - Menu items shown in grid layout when expanded

4. **Sticky Category Navigation Improved**
   - Flex-wrap layout (no horizontal scrollbar)
   - Special color-coding for categories:
     - **Combos**: Purple theme
     - **Raw Meat**: Red/orange theme
     - **Ready to Cook**: Amber/yellow theme
   - Click scrolls to and expands the target category

5. **Floating Download Button Removed**
   - Removed from bottom-right of order page as requested
   - "Get App" button remains in header

6. **Social Login Integration**
   - **Google Login**: Integrated via Emergent Auth (auth.emergentagent.com)
   - **Facebook Login**: Button present (requires Facebook App ID configuration)
   - Backend endpoints: `/api/auth/google/session`, `/api/auth/facebook`

### ✅ Completed Features (Feb 18, 2025)

1. **Brand Theme Update**
   - Updated to white-red color theme (#b2101f, #e70825, #c59433 gold)
   - Arabic-themed decorative elements (golden lines, diamond patterns)
   - Premium shadows and borders throughout

2. **Google Maps Integration**
   - Auto-detect user's current location
   - Calculate distance to each branch
   - Auto-select nearest branch
   - "Detect Location" button

3. **New Menu Categories**
   - **Combos**: 5 value meal combos with discounts
   - **Raw Meat**: Chicken leg piece, boneless, wings, breast, liver, mutton
   - **Ready to Cook**: Pre-marinated meals for home cooking

4. **Category Navigation**
   - Sticky category sub-menu on order page
   - Click to scroll to category section
   - Back to top button (arrow up)

5. **Buzzer Sound for New Orders**
   - Kitchen Dashboard: Continuous alert until acknowledged
   - "Stop Alert" button for each new order
   - Sound On/Off toggle in header

6. **Discount Coupons System**
   - Admin can create coupons (percentage or fixed discount)
   - Min order value, max discount, usage limits
   - Apply coupon API endpoint

7. **WhatsApp Chat Integration**
   - Floating WhatsApp button on all pages
   - Links to: wa.me/918123884771
   - "Need help? Chat now" hover text

8. **UI Improvements**
   - Removed 24/7 service info
   - Removed info@altajrestaurant.com
   - Get App button visible in header
   - Premium home page with Arabic styling

9. **Waiter & Dine-in Disabled**
   - Waiter module route disabled
   - Dine-in tab removed from order page
   - Only Takeaway and Delivery available

### ⏳ Pending Features

1. **SMS Notifications (Twilio)**
   - User confirmed Twilio for SMS + WhatsApp
   - Awaiting Twilio credentials from user

2. **WhatsApp Notifications (Twilio)**
   - Same Twilio account for WhatsApp Business API
   - Awaiting credentials

3. **Push Notifications (Firebase)**
   - Requires Firebase project setup
   - User needs to provide Firebase config

4. **OTP Login (SMS)**
   - Backend ready but awaiting SMS provider credentials

5. **Coupon Frontend Integration (Checkout)**
   - Apply coupon field on checkout page
   - Backend validation ready

6. **Native Mobile Apps**
   - To be built using Mobile Agent (Expo/React Native)
   - Prompt prepared for user

### 📋 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@altaj.com | admin123 |
| Customer | cust@altaj.com | cust123 |
| Kitchen | kitchen@altaj.com | kit123 |
| Delivery | del@altaj.com | del123 |
| Manager | mgr1@altaj.com | mgr123 |

### 📍 URLs

| Page | Path |
|------|------|
| Home | / |
| Order Menu | /order |
| Login | /login |
| Customer Orders | /my-orders |
| Kitchen Dashboard | /kitchen |
| Delivery Dashboard | /delivery |
| Admin Dashboard | /admin |

### 💰 Cost Summary

| Item | Cost |
|------|------|
| Emergent Deployment | 50 credits/month |
| Google Play Account | $25 one-time |
| Apple Developer | $99/year |
| Petpooja (2 outlets) | ₹10,620/year |
| Razorpay | 2% per transaction |
| SMS (OTP) | ~₹800/month |
| Google Maps | Free tier ($200 credit) |

### 🔗 Key API Endpoints

- `POST /api/auth/google/session` - Exchange Emergent Auth session for JWT
- `POST /api/auth/facebook` - Facebook OAuth login
- `POST /api/coupons` - Create coupon (Admin)
- `GET /api/coupons` - List coupons (Admin)
- `POST /api/coupons/apply` - Validate and apply coupon
- `PUT /api/coupons/{id}` - Enable/disable coupon
- `DELETE /api/coupons/{id}` - Delete coupon

### Architecture

```
/app/
├── backend/
│   ├── server.py (All routes & models including social auth)
│   ├── seed_data.py (Database seeding)
│   └── .env (MONGO_URL, RAZORPAY keys)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── NewLandingPage.js (Home with product images, combos, raw meat sections)
│   │   │   ├── LandingPage.js (Order page with accordion menu)
│   │   │   ├── LoginPage.js (Email, Mobile, Google, Facebook login)
│   │   │   ├── AuthCallback.js (Handles Google OAuth callback)
│   │   │   ├── KitchenDashboard.js (with buzzer)
│   │   │   ├── DeliveryDashboard.js
│   │   │   └── ...
│   │   └── components/
│   │       └── PWAInstallPrompt.js (Get App popup components)
│   └── public/
│       ├── altaj-logo.png
│       ├── hero-video.mp4
│       └── notification.mp3 (buzzer sound)
└── memory/
    └── PRD.md
```
