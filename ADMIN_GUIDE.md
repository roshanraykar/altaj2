# 👨‍💼 Al Taj Restaurant - Admin User Guide

## 🔐 Admin Login

### **Access the Application**
1. Open your browser and navigate to the application URL
2. Click the **"Login / Register"** button in the top right corner

### **Admin Credentials**
```
Email: admin@altaj.com
Password: admin123
```

3. Enter your credentials and click **"Login"**
4. You will be automatically redirected to the **Admin Dashboard**

---

## 📊 Admin Dashboard Overview

After logging in, you'll see **5 main tabs**:

### **1. Dashboard Tab** 📈
- **Overview Statistics:**
  - Total Orders (all time)
  - Today's Revenue
  - Today's Orders
  - Pending Orders

- **Recent Orders:**
  - View the latest 10 orders across all branches
  - See order number, customer details, order type
  - Monitor order status in real-time
  - View total amount and number of items

### **2. Branches Tab** 🏢
- **View All Branches:**
  - See all restaurant locations
  - Branch name, address, phone, email
  - Active/Inactive status indicator

- **Branch Details:**
  - Al Taj Downtown (Sheikh Zayed Road, Downtown Dubai)
  - Al Taj Marina (Dubai Marina Walk, Marina)
  - Al Taj JBR (The Beach, JBR, Dubai)

### **3. Staff Tab** 👥 **[NEW!]**
**This is where you manage all your staff members!**

#### **View All Staff**
- Complete list of all users in the system
- Information displayed:
  - Name
  - Email
  - Phone number
  - Role (Admin, Branch Manager, Waiter, Kitchen Staff, Delivery Partner)
  - Assigned Branch
  - Status (Active/Inactive)

#### **Add New Staff Member** ➕
1. Click the **"Add Staff Member"** button (top right)
2. Fill in the form:
   - **Full Name*** (required)
   - **Email*** (required) - This will be their login username
   - **Phone*** (required)
   - **Password*** (required) - They will use this to login
   - **Role*** (required) - Select from:
     - Branch Manager
     - Waiter
     - Kitchen Staff
     - Delivery Partner
   - **Branch*** (required for all roles except Admin)
     - Select which branch they will work at

3. Click **"Create Staff Member"**
4. The new staff member can now login with their email and password!

#### **Staff Role Descriptions:**

**Branch Manager:**
- Can view branch-specific orders
- Access to branch reports
- Manage branch staff
- Same dashboard access as Admin, but limited to their branch

**Waiter:**
- Access to Waiter Dashboard
- View table layouts
- Manage table status (occupied/available)
- View active dine-in orders
- Track order readiness

**Kitchen Staff:**
- Access to Kitchen Dashboard
- View order queue
- Update order status:
  - Pending → Confirmed
  - Confirmed → Preparing
  - Preparing → Ready
- See special instructions from customers

**Delivery Partner:**
- (Future feature - mobile app)
- Will receive delivery assignments
- Update delivery status

### **4. Orders Tab** 📦
- **View All Orders:**
  - Complete order history
  - Order number, customer details
  - Branch location
  - Order type (Dine-in, Takeaway, Delivery)
  - Order status
  - Total amount
  - Number of items

- **Order Status Tracking:**
  - Pending (just placed)
  - Confirmed (kitchen confirmed)
  - Preparing (being cooked)
  - Ready (ready for pickup/serving)
  - Out for Delivery (delivery only)
  - Completed (fulfilled)
  - Cancelled

### **5. Reports Tab** 📊
- **Branch Performance:**
  - Revenue by branch
  - Total orders by branch
  - Average order value by branch
  - Compare performance across locations

---

## 🎯 Common Admin Tasks

### **Task 1: Create a New Waiter**
1. Login as Admin
2. Go to **"Staff" tab**
3. Click **"Add Staff Member"**
4. Fill in:
   - Name: "Ahmed Hassan"
   - Email: "ahmed.hassan@altaj.com"
   - Phone: "+971-50-123-4567"
   - Password: "waiter123"
   - Role: "Waiter"
   - Branch: "Al Taj Downtown"
5. Click **"Create Staff Member"**
6. ✅ Ahmed can now login and access the Waiter Dashboard!

### **Task 2: Create a Kitchen Staff Member**
1. Login as Admin
2. Go to **"Staff" tab**
3. Click **"Add Staff Member"**
4. Fill in:
   - Name: "Chef Mohammed"
   - Email: "chef.mohammed@altaj.com"
   - Phone: "+971-50-234-5678"
   - Password: "kitchen123"
   - Role: "Kitchen Staff"
   - Branch: "Al Taj Marina"
5. Click **"Create Staff Member"**
6. ✅ Chef Mohammed can now login and manage orders in the Kitchen Dashboard!

### **Task 3: Create a Branch Manager**
1. Login as Admin
2. Go to **"Staff" tab**
3. Click **"Add Staff Member"**
4. Fill in:
   - Name: "Sarah Al Mansoori"
   - Email: "sarah.manager@altaj.com"
   - Phone: "+971-50-345-6789"
   - Password: "manager123"
   - Role: "Branch Manager"
   - Branch: "Al Taj JBR"
5. Click **"Create Staff Member"**
6. ✅ Sarah can now login and manage her branch!

### **Task 4: Monitor Today's Orders**
1. Login as Admin
2. Go to **"Dashboard" tab**
3. View:
   - Today's total revenue
   - Number of orders today
   - Pending orders count
4. Scroll down to see recent orders in real-time

### **Task 5: Check Branch Performance**
1. Login as Admin
2. Go to **"Reports" tab**
3. View performance metrics for each branch:
   - Which branch has the highest revenue?
   - Which branch has the most orders?
   - Average order value per branch
4. Use this data to make business decisions

### **Task 6: View All Orders**
1. Login as Admin
2. Go to **"Orders" tab**
3. See complete order history
4. Check order status
5. Identify any issues or delays

---

## 📝 Important Notes for Admin

### **Email Format for Staff:**
- Use consistent email format: `firstname.lastname@altaj.com`
- Or role-based: `waiter1.downtown@altaj.com`
- Ensures easy identification

### **Password Guidelines:**
- Default passwords: Use role-based passwords for easy setup
  - Waiters: `waiter123`
  - Kitchen: `kitchen123`
  - Managers: `manager123`
- Staff should change password after first login (future feature)

### **Branch Assignment:**
- Every staff member (except Admin) MUST be assigned to a branch
- They can only access data from their assigned branch
- Admin can see all branches

### **Real-Time Updates:**
- Dashboard refreshes orders every 10 seconds
- Kitchen and Waiter dashboards refresh every 5 seconds
- No need to manually refresh the page

### **Current Staff Count:**
Per branch, you currently have:
- 1 Branch Manager
- 3 Waiters
- 2 Kitchen Staff
- **Total: 18 staff members across 3 branches**

---

## 🚨 Troubleshooting

### **Problem: Can't create new staff**
**Solution:**
- Ensure all required fields are filled (marked with *)
- For branch-specific roles, branch must be selected
- Email must be unique (not already registered)
- Check internet connection

### **Problem: Staff member can't login**
**Solution:**
- Verify you created the account successfully
- Check email and password are correct
- Ensure account is marked as "Active"
- Try password reset (future feature)

### **Problem: Can't see certain orders**
**Solution:**
- As Admin, you should see ALL orders
- Check if filters are applied
- Ensure backend service is running
- Refresh the page

### **Problem: Dashboard not updating**
**Solution:**
- Wait 10 seconds for auto-refresh
- Manually refresh browser (F5)
- Check internet connection
- Verify backend service status

---

## 🎓 Best Practices

1. **Create staff before branch opens:**
   - Set up all waiters, kitchen staff before rush hours
   - Test their logins to ensure everything works

2. **Use consistent naming:**
   - Follow naming conventions for emails
   - Makes it easier to manage large teams

3. **Regular monitoring:**
   - Check Dashboard tab daily for overview
   - Review Reports tab weekly for insights
   - Monitor Orders tab during peak hours

4. **Staff training:**
   - Train each role on their specific dashboard
   - Ensure they know their login credentials
   - Explain the order workflow

5. **Security:**
   - Don't share admin credentials
   - Create specific role accounts for staff
   - Regularly review user list for inactive accounts

---

## 📞 Need Help?

If you encounter any issues:
1. Check this guide first
2. Review the main README.md for technical details
3. Check service status: `sudo supervisorctl status`
4. Review logs if services are down

---

## ✅ Quick Checklist - Setting Up a New Branch

When opening a new branch, follow this checklist:

- [ ] Create Branch Manager account
- [ ] Create 3-4 Waiter accounts
- [ ] Create 2-3 Kitchen Staff accounts
- [ ] Create Delivery Partner accounts (if needed)
- [ ] Test all logins
- [ ] Assign tables in system
- [ ] Train staff on their dashboards
- [ ] Do a test order from start to finish
- [ ] Monitor first day operations closely

---

**You're all set! 🎉**

As an Admin, you have complete control over the Al Taj Restaurant Management System. Use the Staff Management feature to build your team and manage operations efficiently across all branches!
