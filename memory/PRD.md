# Al Taj Restaurant - Product Requirements Document

## Original Problem Statement
Build a comprehensive, enterprise-level multi-branch restaurant management platform for "Al Taj Restaurant." Full-stack web application (FastAPI backend, React frontend, MongoDB) that serves as the backend for future native mobile apps.

## Branding & UI
- "Classy yet premium" UI using the brand's red (#b2101f) / gold (#c59433) / white color theme
- Arabic-themed design elements
- Hero video on homepage

## Core Architecture
```
/app/
├── backend/
│   ├── .env (MONGO_URL, DB_NAME, JWT_SECRET, RAZORPAY keys)
│   ├── server.py (Monolithic API - auth, orders, coupons, reviews, menu)
│   ├── seed_data.py
│   └── seed_images.py (New - seeds food images for menu items)
├── frontend/
│   ├── .env (REACT_APP_BACKEND_URL)
│   ├── src/pages/ (Admin, Customer, Kitchen, Delivery dashboards, Landing, Login, Checkout, Order Tracking)
│   └── src/components/ (PWAInstallPrompt, PrintableOrder, ReviewPopup)
└── memory/PRD.md
```

## Authentication
- JWT-based email/password login
- Social logins: EXPLICITLY REMOVED (do not re-implement)
- Roles: admin, customer, kitchen_staff, delivery_partner, branch_manager, waiter

## Test Credentials
- Admin: admin@altaj.com / admin123
- Customer: cust@altaj.com / cust123
- Kitchen (Old Hubli): k1b1@altaj.com / kit123
- Kitchen (Shirur Park): k1b2@altaj.com / kit123
- Delivery (Old Hubli): d1b1@altaj.com / del123
- Delivery (Shirur Park): d1b2@altaj.com / del123

## Key API Endpoints
- `/api/auth/login`, `/api/auth/register`
- `/api/branches`, `/api/nearest-branch?latitude=X&longitude=Y` (auto-detect nearest branch)
- `/api/menu/categories`, `/api/menu/items`
- `/api/menu/items/all` (admin), `/api/menu/items/{id}/image` (PATCH, admin)
- `/api/menu/items/bulk-images` (PATCH, admin)
- `/api/orders/*` (branch_id now optional, auto-assigned via user_latitude/user_longitude)
- `/api/payment/*`
- `/api/coupons/*`, `/api/coupons/apply`
- `/api/reviews/*`, `/api/reviews/public`, `/api/reviews/stats`

## DB Schema (Key Collections)
- **menu_items**: {id, name, description, category_id, base_price, image_url, is_vegetarian, is_available, branch_ids, created_at}
- **menu_categories**: {id, name, display_order}
- **reviews**: {order_id, customer_id, star_rating, review_text, status, admin_response, created_at}
- **coupons**: {code, description, discount_type, value, min_order_value, max_discount, valid_from, valid_until, usage_limit, is_active}

## Implemented Features (Completed)
1. Multi-role authentication (JWT)
2. Branch management (2 branches: Old Hubli, Shirur Park)
3. Full menu system (14 categories, 183 items)
4. **Product Image Management** (Feb 2026) - All 183 items have AI-generated food images
5. Order system (create, track, update status)
6. Cart with GST calculation
7. Razorpay payment integration (LIVE keys)
8. Coupon management system (CRUD + apply)
9. Review & rating system (customer submit, admin moderate, public display)
10. Kitchen dashboard with order printing (58mm thermal receipt)
11. Delivery dashboard
12. Customer dashboard with order history
13. Buzzer/notification sound for new orders
14. Google Maps integration for branch location
15. PWA support with install prompts
16. WhatsApp contact button
17. Accordion-style menu with sticky category navigation
18. Special category styling (Combos, Raw Meat, Ready to Cook)
19. **Auto Branch Assignment** (Feb 22, 2026) - Branch selection hidden from customers. Backend auto-assigns nearest branch using GPS (Haversine formula). New `/api/nearest-branch` endpoint. `OrderCreate.branch_id` optional with `user_latitude`/`user_longitude` fallback.

## Known Issues
- **Buzzer Sound (P1)**: Does not stop immediately when toggled off (recurring, 2x)
- **Custom Domain Sync (P2)**: altajfoods.com may show older version - .gitignore fix applied, needs redeploy
- **.gitignore was corrupted**: Fixed - removed duplicate *.env blocking rules

## Blocked Items
- OTP Login: Awaiting SMS provider credentials
- Push Notifications: Awaiting Firebase credentials
- SMS/WhatsApp Notifications: Awaiting Twilio credentials

## Upcoming Tasks (Prioritized)
- P1: Fix buzzer sound logic reliably
- P1: SMS & WhatsApp notifications (needs Twilio)
- P2: Complete UI/theme consistency across all pages
- P2: Backend refactoring (break server.py into routers/models/services)
- P3: Frontend state management (Zustand)
- P3: Native mobile apps (prompts provided to user)

## 3rd Party Integrations
- Razorpay (Payments) - LIVE keys integrated
- Google Maps - API key integrated
- react-to-print - Kitchen order printing
