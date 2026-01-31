import asyncio
import requests
from datetime import datetime, timezone, timedelta

BASE_URL = "http://localhost:8001/api"

async def seed_data():
    print("🌱 Starting Al Taj Restaurant data seeding...")
    
    # 1. Register Admin User
    print("\n1️⃣ Creating admin user...")
    admin_data = {
        "email": "admin@altaj.com",
        "password": "admin123",
        "name": "Admin Al Taj",
        "role": "admin",
        "phone": "+971-50-123-4567"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=admin_data)
    if response.status_code == 200:
        admin_token = response.json()["access_token"]
        print("✅ Admin user created successfully")
    else:
        print(f"ℹ️ Admin might already exist: {response.json()}")
        # Try to login
        login_response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "admin@altaj.com",
            "password": "admin123"
        })
        admin_token = login_response.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2. Create Branches
    print("\n2️⃣ Creating branches...")
    branches = [
        {
            "name": "Al Taj Dharwad Road",
            "address": "Shop No. 45-46, Dharwad Road, Near HDFC Bank, Hubli - 580029",
            "phone": "+91-836-2245678",
            "email": "dharwadroad@altaj.com",
            "latitude": 15.3647,
            "longitude": 75.1240,
            "is_active": True
        },
        {
            "name": "Al Taj Unkal",
            "address": "Unkal Lake Road, Opp. Unkal Park, Hubli - 580031",
            "phone": "+91-836-2356789",
            "email": "unkal@altaj.com",
            "latitude": 15.3486,
            "longitude": 75.1348,
            "is_active": True
        },
        {
            "name": "Al Taj Gokul Road",
            "address": "Gokul Road, Near Old Bus Stand, Hubli - 580030",
            "phone": "+91-836-2467890",
            "email": "gokulroad@altaj.com",
            "latitude": 15.3573,
            "longitude": 75.1379,
            "is_active": True
        }
    ]
    
    branch_ids = []
    for branch_data in branches:
        response = requests.post(f"{BASE_URL}/branches", json=branch_data, headers=headers)
        if response.status_code == 200:
            branch_id = response.json()["id"]
            branch_ids.append(branch_id)
            print(f"✅ Created branch: {branch_data['name']} (ID: {branch_id})")
        else:
            print(f"❌ Failed to create branch: {response.json()}")
    
    # 3. Create Menu Categories
    print("\n3️⃣ Creating menu categories...")
    categories = [
        {"name": "Appetizers", "description": "Start your meal right", "display_order": 1},
        {"name": "Main Course", "description": "Hearty and delicious", "display_order": 2},
        {"name": "Biryani", "description": "Aromatic rice dishes", "display_order": 3},
        {"name": "Breads", "description": "Freshly baked", "display_order": 4},
        {"name": "Beverages", "description": "Refresh yourself", "display_order": 5},
        {"name": "Desserts", "description": "Sweet endings", "display_order": 6}
    ]
    
    category_ids = {}
    for cat_data in categories:
        response = requests.post(f"{BASE_URL}/menu/categories", json=cat_data, headers=headers)
        if response.status_code == 200:
            cat_id = response.json()["id"]
            category_ids[cat_data["name"]] = cat_id
            print(f"✅ Created category: {cat_data['name']} (ID: {cat_id})")
    
    # 4. Create Menu Items
    print("\n4️⃣ Creating menu items...")
    menu_items = [
        # Appetizers
        {"name": "Chicken Tikka", "description": "Marinated chicken grilled to perfection", "category": "Appetizers", "price": 180.00, "vegetarian": False},
        {"name": "Samosa (Veg)", "description": "Crispy pastry filled with spiced vegetables", "category": "Appetizers", "price": 40.00, "vegetarian": True},
        {"name": "Paneer Tikka", "description": "Cottage cheese marinated in spices", "category": "Appetizers", "price": 160.00, "vegetarian": True},
        
        # Main Course
        {"name": "Butter Chicken", "description": "Creamy tomato-based curry with tender chicken", "category": "Main Course", "price": 280.00, "vegetarian": False},
        {"name": "Lamb Rogan Josh", "description": "Aromatic lamb curry with Kashmiri spices", "category": "Main Course", "price": 340.00, "vegetarian": False},
        {"name": "Paneer Butter Masala", "description": "Cottage cheese in rich tomato gravy", "category": "Main Course", "price": 230.00, "vegetarian": True},
        {"name": "Dal Makhani", "description": "Black lentils cooked overnight with butter", "category": "Main Course", "price": 190.00, "vegetarian": True},
        
        # Biryani
        {"name": "Chicken Biryani", "description": "Fragrant basmati rice with succulent chicken", "category": "Biryani", "price": 260.00, "vegetarian": False},
        {"name": "Mutton Biryani", "description": "Tender mutton layered with aromatic rice", "category": "Biryani", "price": 320.00, "vegetarian": False},
        {"name": "Vegetable Biryani", "description": "Mixed vegetables with saffron rice", "category": "Biryani", "price": 210.00, "vegetarian": True},
        
        # Breads
        {"name": "Naan", "description": "Soft leavened flatbread", "category": "Breads", "price": 40.00, "vegetarian": True},
        {"name": "Garlic Naan", "description": "Naan topped with garlic and butter", "category": "Breads", "price": 50.00, "vegetarian": True},
        {"name": "Tandoori Roti", "description": "Whole wheat flatbread from tandoor", "category": "Breads", "price": 35.00, "vegetarian": True},
        
        # Beverages
        {"name": "Mango Lassi", "description": "Sweet yogurt drink with mango", "category": "Beverages", "price": 80.00, "vegetarian": True},
        {"name": "Masala Chai", "description": "Spiced Indian tea", "category": "Beverages", "price": 30.00, "vegetarian": True},
        {"name": "Fresh Lime Soda", "description": "Refreshing lime with soda", "category": "Beverages", "price": 60.00, "vegetarian": True},
        
        # Desserts
        {"name": "Gulab Jamun", "description": "Sweet milk balls in sugar syrup", "category": "Desserts", "price": 100.00, "vegetarian": True},
        {"name": "Ras Malai", "description": "Cottage cheese dumplings in sweet milk", "category": "Desserts", "price": 120.00, "vegetarian": True}
    ]
    
    for item_data in menu_items:
        menu_item_payload = {
            "name": item_data["name"],
            "description": item_data["description"],
            "category_id": category_ids[item_data["category"]],
            "base_price": item_data["price"],
            "is_vegetarian": item_data["vegetarian"],
            "is_available": True,
            "branch_ids": None  # Available at all branches
        }
        
        response = requests.post(f"{BASE_URL}/menu/items", json=menu_item_payload, headers=headers)
        if response.status_code == 200:
            print(f"✅ Created menu item: {item_data['name']}")
    
    # 5. Create Tables for each branch
    print("\n5️⃣ Creating tables for branches...")
    for idx, branch_id in enumerate(branch_ids):
        branch_name = branches[idx]["name"]
        # Create 10 tables per branch
        for table_num in range(1, 11):
            table_data = {
                "branch_id": branch_id,
                "table_number": f"T{table_num:02d}",
                "capacity": 4 if table_num <= 6 else 6,  # Tables 1-6 for 4 people, 7-10 for 6 people
                "location": "Main Hall" if table_num <= 5 else "Window Side"
            }
            response = requests.post(f"{BASE_URL}/tables", json=table_data, headers=headers)
            if response.status_code == 200:
                if table_num == 1:
                    print(f"✅ Created tables for {branch_name}")
    
    # 6. Create Branch Staff
    print("\n6️⃣ Creating branch staff...")
    for idx, branch_id in enumerate(branch_ids):
        branch_name = branches[idx]["name"].replace("Al Taj ", "").lower().replace(" ", "")
        
        # Branch Manager
        manager_data = {
            "email": f"manager.{branch_name}@altaj.com",
            "password": "manager123",
            "name": f"{branches[idx]['name']} Manager",
            "role": "branch_manager",
            "phone": f"+91-836-{idx}00-0001",
            "branch_id": branch_id
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=manager_data)
        if response.status_code == 200:
            print(f"✅ Created manager for {branches[idx]['name']}")
        
        # Waiters
        for waiter_num in range(1, 4):
            waiter_data = {
                "email": f"waiter{waiter_num}.{branch_name}@altaj.com",
                "password": "waiter123",
                "name": f"Waiter {waiter_num} - {branches[idx]['name']}",
                "role": "waiter",
                "phone": f"+91-836-{idx}0{waiter_num}-0001",
                "branch_id": branch_id
            }
            response = requests.post(f"{BASE_URL}/auth/register", json=waiter_data)
        
        # Kitchen Staff
        for kitchen_num in range(1, 3):
            kitchen_data = {
                "email": f"kitchen{kitchen_num}.{branch_name}@altaj.com",
                "password": "kitchen123",
                "name": f"Chef {kitchen_num} - {branches[idx]['name']}",
                "role": "kitchen_staff",
                "phone": f"+91-836-{idx}1{kitchen_num}-0001",
                "branch_id": branch_id
            }
            response = requests.post(f"{BASE_URL}/auth/register", json=kitchen_data)
    
    print(f"✅ Created staff for all branches")
    
    # 7. Create Sample Customers
    print("\n7️⃣ Creating sample customers...")
    customers = [
        {"email": "rajesh.kumar@email.com", "password": "customer123", "name": "Rajesh Kumar", "phone": "+91-9876543210"},
        {"email": "priya.sharma@email.com", "password": "customer123", "name": "Priya Sharma", "phone": "+91-9876543211"},
        {"email": "amit.patil@email.com", "password": "customer123", "name": "Amit Patil", "phone": "+91-9876543212"}
    ]
    
    for customer in customers:
        customer["role"] = "customer"
        response = requests.post(f"{BASE_URL}/auth/register", json=customer)
        if response.status_code == 200:
            print(f"✅ Created customer: {customer['name']}")
    
    # 8. Create Active Offers
    print("\n8️⃣ Creating promotional offers...")
    now = datetime.now(timezone.utc)
    offers = [
        {
            "title": "Weekend Special - 20% Off",
            "description": "Get 20% off on all orders above ₹500 during weekends",
            "discount_type": "percentage",
            "discount_value": 20,
            "min_order_value": 500,
            "valid_from": now.isoformat(),
            "valid_until": (now + timedelta(days=30)).isoformat(),
            "branch_ids": None
        },
        {
            "title": "Lunch Combo Deal",
            "description": "Flat ₹100 off on lunch orders between 12 PM - 3 PM",
            "discount_type": "fixed",
            "discount_value": 100,
            "min_order_value": 350,
            "valid_from": now.isoformat(),
            "valid_until": (now + timedelta(days=30)).isoformat(),
            "branch_ids": None
        }
    ]
    
    for offer_data in offers:
        response = requests.post(f"{BASE_URL}/offers", json=offer_data, headers=headers)
        if response.status_code == 200:
            print(f"✅ Created offer: {offer_data['title']}")
    
    print("\n🎉 Data seeding completed successfully!")
    print("\n📋 Summary:")
    print(f"   - Admin User: admin@altaj.com (password: admin123)")
    print(f"   - Branches: {len(branches)}")
    print(f"   - Menu Categories: {len(categories)}")
    print(f"   - Menu Items: {len(menu_items)}")
    print(f"   - Tables per Branch: 10")
    print(f"   - Staff per Branch: 1 Manager, 3 Waiters, 2 Kitchen Staff")
    print(f"   - Sample Customers: {len(customers)}")
    print(f"   - Active Offers: {len(offers)}")

if __name__ == "__main__":
    asyncio.run(seed_data())
