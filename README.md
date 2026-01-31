# Al Taj Restaurant Multi-Branch Management System

A comprehensive restaurant management platform designed for multi-branch operations with centralized control, real-time order tracking, and role-based access for different staff members.

## 🌟 Features

### **Central Admin System**
- Single dashboard for managing all branches
- Real-time order monitoring across all locations
- Branch-wise and consolidated sales reports
- Menu, pricing, and offers management
- Role-based access control
- Performance analytics per branch

### **Multi-Branch Operations**
- Independent branch configuration
- Automatic order routing to correct branch
- Branch-specific dashboards
- Nearest branch selection for customers

### **Customer Ordering**
- Browse menu by category
- Place orders (dine-in, takeaway, delivery)
- Real-time order tracking
- Shopping cart functionality
- Guest checkout supported

### **Kitchen Dashboard**
- Real-time order queue management
- Order status workflow (Pending → Confirmed → Preparing → Ready)
- Visual separation by order type (dine-in, takeaway, delivery)
- Special instructions display
- Live updates every 5 seconds

### **Waiter Interface**
- Table layout visualization
- Table status management (occupied/available)
- Active dine-in orders view
- Ready-to-serve alerts

### **Delivery Management**
- Order dispatch tracking
- Delivery status updates
- Branch-wise delivery overview

## 🏗️ Tech Stack

### **Backend**
- FastAPI (Python)
- MongoDB (Database)
- Motor (Async MongoDB driver)
- JWT Authentication
- Pydantic for data validation

### **Frontend**
- React 19
- React Router DOM
- Axios
- Shadcn UI Components
- Tailwind CSS
- Lucide Icons

## 📦 Installation & Setup

### **Prerequisites**
- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn

### **Backend Setup**
```bash
cd /app/backend
pip install -r requirements.txt
python seed_data.py  # Seed initial data
```

### **Frontend Setup**
```bash
cd /app/frontend
yarn install
```

### **Start Services**
```bash
sudo supervisorctl restart all
```

## 🔐 Demo Credentials

### **Admin Access**
- Email: `admin@altaj.com`
- Password: `admin123`
- Role: Full system access

### **Branch Manager (Downtown)**
- Email: `manager.downtown@altaj.com`
- Password: `manager123`
- Role: Branch-level management

### **Waiter (Downtown)**
- Email: `waiter1.downtown@altaj.com`
- Password: `waiter123`
- Role: Table and dine-in order management

### **Kitchen Staff (Downtown)**
- Email: `kitchen1.downtown@altaj.com`
- Password: `kitchen123`
- Role: Order preparation and status updates

### **Customer**
- Email: `john.doe@email.com`
- Password: `customer123`
- Role: Place and track orders

## 🎯 User Roles & Permissions

### **Admin**
- Manage all branches
- Create and update menu items and categories
- View consolidated reports
- Manage promotional offers
- Full system access

### **Branch Manager**
- View branch-specific orders and performance
- Manage branch tables
- Access to branch reports

### **Waiter**
- View table layouts
- Manage table status
- View dine-in orders
- Track order readiness

### **Kitchen Staff**
- View order queue
- Update order status (confirm, preparing, ready)
- See order details and special instructions

### **Customer**
- Browse menu
- Place orders
- Track orders in real-time
- View order history

## 📊 Initial Data

The system comes pre-loaded with:

- **3 Branches:**
  - Al Taj Downtown (Sheikh Zayed Road)
  - Al Taj Marina (Dubai Marina Walk)
  - Al Taj JBR (The Beach, JBR)

- **6 Menu Categories:**
  - Appetizers
  - Main Course
  - Biryani
  - Breads
  - Beverages
  - Desserts

- **18 Menu Items:** Authentic Indian/Pakistani cuisine
- **10 Tables per Branch:** Various capacities
- **Staff Members:** 1 Manager, 3 Waiters, 2 Kitchen Staff per branch
- **2 Active Offers:** Weekend Special & Lunch Combo Deal

## 🔄 Order Workflow

### **Order Status Progression**

1. **Pending** - Order placed, awaiting confirmation
2. **Confirmed** - Order confirmed by kitchen
3. **Preparing** - Food being prepared
4. **Ready** - Food ready for pickup/serving
5. **Out for Delivery** - (Delivery orders only) Driver dispatched
6. **Completed** - Order fulfilled
7. **Cancelled** - Order cancelled

### **Order Types**

- **Dine-in**: Assigned to specific table, served by waiters
- **Takeaway**: Prepared for customer pickup
- **Delivery**: Includes delivery address and driver assignment

## 🌐 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### **Branches**
- `GET /api/branches` - List all branches
- `POST /api/branches` - Create branch (Admin only)
- `GET /api/branches/{id}` - Get branch details
- `PUT /api/branches/{id}` - Update branch (Admin only)

### **Menu**
- `GET /api/menu/categories` - List categories
- `POST /api/menu/categories` - Create category (Admin only)
- `GET /api/menu/items` - List menu items
- `POST /api/menu/items` - Create menu item (Admin only)
- `PUT /api/menu/items/{id}` - Update menu item (Admin only)

### **Orders**
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (with filters)
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status

### **Tables**
- `GET /api/tables` - List tables (by branch)
- `POST /api/tables` - Create table (Admin/Manager)
- `PUT /api/tables/{id}/status` - Update table status

### **Reports**
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/branch-performance` - Branch performance
- `GET /api/dashboard/stats` - Dashboard statistics

### **Offers**
- `GET /api/offers` - List active offers
- `POST /api/offers` - Create offer (Admin only)

## 🎨 Frontend Routes

- `/` - Landing page (Customer menu browsing)
- `/login` - Login/Registration
- `/checkout` - Order checkout
- `/order-tracking` - Real-time order tracking
- `/admin` - Admin dashboard (Admin only)
- `/branch-manager` - Branch manager dashboard
- `/waiter` - Waiter interface
- `/kitchen` - Kitchen dashboard

## 📈 Key Features Implementation

### **Real-time Updates**
- Orders refresh every 5-10 seconds using polling
- Kitchen dashboard updates live
- Order tracking shows current status

### **Role-Based Access**
- JWT-based authentication
- Protected routes with role validation
- Frontend route guards based on user role

### **Multi-Branch Support**
- Branch selection on landing page
- Automatic branch filtering for staff
- Branch-specific performance reports

### **Order Management**
- Cart functionality with quantity updates
- Guest checkout support
- Order history tracking
- Status workflow management

## 🚀 Deployment

### **Environment Variables**

#### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=al_taj_restaurant
CORS_ORIGINS=*
JWT_SECRET_KEY=your-secret-key-here
```

#### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

### **Service Management**
```bash
# Restart all services
sudo supervisorctl restart all

# Restart individual services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# Check service status
sudo supervisorctl status
```

## 📝 Notes

- **Tax Calculation**: 5% tax applied on all orders
- **Order Numbers**: Auto-generated in format ALT000001, ALT000002, etc.
- **Guest Orders**: Customers can place orders without registration
- **Branch Availability**: Menu items can be configured per branch
- **Offers**: Time-based promotional offers with branch filtering

## 🔧 Troubleshooting

### Backend Issues
```bash
# Check backend logs
tail -f /var/log/supervisor/backend.*.log

# Restart backend
sudo supervisorctl restart backend
```

### Frontend Issues
```bash
# Check frontend logs
tail -f /var/log/supervisor/frontend.*.log

# Clear cache and restart
cd /app/frontend
rm -rf node_modules/.cache
sudo supervisorctl restart frontend
```

### Database Issues
```bash
# Check MongoDB status
sudo supervisorctl status mongodb

# View MongoDB logs
tail -f /var/log/supervisor/mongodb.*.log
```

## 📞 Support

For issues or questions about the Al Taj Restaurant Management System, please refer to the API documentation or check the logs for detailed error messages.

## 🎉 Getting Started

1. **Access the application**: Navigate to the frontend URL
2. **Login as Admin**: Use `admin@altaj.com` / `admin123`
3. **Explore**: Check branches, menu items, and create test orders
4. **Test different roles**: Login as waiter, kitchen staff, or customer
5. **Place an order**: Select items, checkout, and track in real-time
6. **Kitchen workflow**: Login as kitchen staff to process orders
7. **View reports**: Check branch performance and sales analytics

---

**Built with ❤️ for efficient multi-branch restaurant management**
