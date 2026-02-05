import asyncio
import requests
from datetime import datetime, timezone, timedelta

BASE_URL = "http://localhost:8001/api"

async def seed_data():
    print("🌱 Starting Al Taj Restaurant data seeding...")
    
    # Check if data already exists
    try:
        existing_branches = requests.get(f"{BASE_URL}/branches").json()
        if len(existing_branches) >= 2:
            print("⚠️ Data already exists! Skipping seed to prevent duplicates.")
            print(f"   Found {len(existing_branches)} branches")
            print("   Run with --force to reseed (will clear existing data)")
            return
    except:
        pass
    
    # 1. Register Admin User
    print("\n1️⃣ Creating admin user...")
    admin_data = {
        "email": "admin@altaj.com",
        "password": "admin123",
        "name": "Admin Al Taj",
        "role": "admin",
        "phone": "+91-836-2245678"
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
    
    # 2. Create Branches (Real Al Taj Locations in Hubli)
    print("\n2️⃣ Creating branches...")
    branches = [
        {
            "name": "Al Taj Family Restaurant - Old Hubli",
            "address": "CTS No 5049, Vishal Nagar, Gudihal Road, Old Hubli, Hubballi - 580024",
            "phone": "+91-836-2245678",
            "email": "oldhubli@altajrestaurant.com",
            "latitude": 15.3647,
            "longitude": 75.1240,
            "is_active": True
        },
        {
            "name": "Al Taj Restaurant & Fast Food - Shirur Park",
            "address": "Shirur Park, JC Nagar, Opposite Chetan College, Vidyanagar, Hubballi - 580021",
            "phone": "+91-836-2356789",
            "email": "shirurpark@altajrestaurant.com",
            "latitude": 15.3486,
            "longitude": 75.1348,
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
    
    # 3. Create Menu Categories (Based on actual Al Taj Menu Card)
    print("\n3️⃣ Creating menu categories...")
    categories = [
        {"name": "Chinese Thrillers", "description": "Indo-Chinese specialties", "display_order": 1},
        {"name": "Tandoori Karishma", "description": "Tandoor grilled delicacies", "display_order": 2},
        {"name": "Starters", "description": "Appetizers to begin your meal", "display_order": 3},
        {"name": "Indian Dishes - Chicken", "description": "Authentic chicken curries", "display_order": 4},
        {"name": "Indian Dishes - Mutton", "description": "Rich mutton preparations", "display_order": 5},
        {"name": "Biryani & Rice", "description": "Aromatic rice dishes", "display_order": 6},
        {"name": "Egg Items", "description": "Egg specialties", "display_order": 7},
        {"name": "Veg", "description": "Vegetarian delights", "display_order": 8},
        {"name": "Gravy", "description": "Rich gravies and curries", "display_order": 9},
        {"name": "Dal", "description": "Lentil preparations", "display_order": 10},
        {"name": "Extras", "description": "Sides and accompaniments", "display_order": 11}
    ]
    
    category_ids = {}
    for cat_data in categories:
        response = requests.post(f"{BASE_URL}/menu/categories", json=cat_data, headers=headers)
        if response.status_code == 200:
            cat_id = response.json()["id"]
            category_ids[cat_data["name"]] = cat_id
            print(f"✅ Created category: {cat_data['name']} (ID: {cat_id})")
    
    # 4. Create Menu Items (Actual Al Taj Menu)
    print("\n4️⃣ Creating menu items...")
    menu_items = [
        # Chinese Thrillers
        {"name": "Chicken Manchuri (Boneless)", "category": "Chinese Thrillers", "price": 260.00, "vegetarian": False},
        {"name": "Chicken Chilly", "category": "Chinese Thrillers", "price": 220.00, "vegetarian": False},
        {"name": "Chicken Chilly (Boneless)", "category": "Chinese Thrillers", "price": 260.00, "vegetarian": False},
        {"name": "Chicken Satay (Boneless)", "category": "Chinese Thrillers", "price": 310.00, "vegetarian": False},
        {"name": "Chicken Drum Stick", "category": "Chinese Thrillers", "price": 290.00, "vegetarian": False},
        {"name": "Chicken Sizzler", "category": "Chinese Thrillers", "price": 320.00, "vegetarian": False},
        {"name": "Chicken Barbeque", "category": "Chinese Thrillers", "price": 320.00, "vegetarian": False},
        {"name": "Chicken Honey Garlic (10 Pcs)", "category": "Chinese Thrillers", "price": 260.00, "vegetarian": False},
        {"name": "Chicken Shangal (10 Pcs)", "category": "Chinese Thrillers", "price": 260.00, "vegetarian": False},
        {"name": "Korean Chicken Wings (10 Pcs)", "category": "Chinese Thrillers", "price": 270.00, "vegetarian": False},
        {"name": "Guntur Chilly (10 Pcs)", "category": "Chinese Thrillers", "price": 240.00, "vegetarian": False},
        
        # Tandoori Karishma
        {"name": "Tandoori Kabab (Half) 6 Pc", "category": "Tandoori Karishma", "price": 220.00, "vegetarian": False},
        {"name": "Tandoori Kabab (Full) 12 Pc", "category": "Tandoori Karishma", "price": 430.00, "vegetarian": False},
        {"name": "Tandoori Chicken (Half)", "category": "Tandoori Karishma", "price": 210.00, "vegetarian": False},
        {"name": "Tandoori Chicken (Full)", "category": "Tandoori Karishma", "price": 410.00, "vegetarian": False},
        {"name": "Alfam (Full)", "category": "Tandoori Karishma", "price": 450.00, "vegetarian": False},
        {"name": "Bhatti Chicken (Half)", "category": "Tandoori Karishma", "price": 230.00, "vegetarian": False},
        {"name": "Bhatti Chicken (Full)", "category": "Tandoori Karishma", "price": 450.00, "vegetarian": False},
        {"name": "Chicken Tikka", "category": "Tandoori Karishma", "price": 260.00, "vegetarian": False},
        {"name": "Reshmi Kabab", "category": "Tandoori Karishma", "price": 270.00, "vegetarian": False},
        {"name": "Malai Kabab Boneless", "category": "Tandoori Karishma", "price": 260.00, "vegetarian": False},
        {"name": "Afghani Kabab", "category": "Tandoori Karishma", "price": 270.00, "vegetarian": False},
        {"name": "Leg Piece Single", "category": "Tandoori Karishma", "price": 100.00, "vegetarian": False},
        {"name": "Leg Piece (2 Pc)", "category": "Tandoori Karishma", "price": 200.00, "vegetarian": False},
        {"name": "Chatpata Kabab", "category": "Tandoori Karishma", "price": 260.00, "vegetarian": False},
        {"name": "Lasuni Tikka", "category": "Tandoori Karishma", "price": 260.00, "vegetarian": False},
        {"name": "Haryali Kabab", "category": "Tandoori Karishma", "price": 250.00, "vegetarian": False},
        {"name": "Banjara Kabab", "category": "Tandoori Karishma", "price": 260.00, "vegetarian": False},
        {"name": "Badami Tikka", "category": "Tandoori Karishma", "price": 260.00, "vegetarian": False},
        
        # Starters
        {"name": "Chicken Kabab (10 Pcs)", "category": "Starters", "price": 190.00, "vegetarian": False},
        {"name": "Chicken Kabab Boneless (10 Pcs)", "category": "Starters", "price": 220.00, "vegetarian": False},
        {"name": "Chicken 65 (Boneless)", "category": "Starters", "price": 250.00, "vegetarian": False},
        {"name": "Pepper Chicken (Boneless)", "category": "Starters", "price": 280.00, "vegetarian": False},
        {"name": "Chicken Tikka Kabab (Boneless)", "category": "Starters", "price": 250.00, "vegetarian": False},
        {"name": "Chicken Lollipop (6 Pcs)", "category": "Starters", "price": 200.00, "vegetarian": False},
        
        # Indian Dishes - Chicken (Half portions)
        {"name": "Chicken Masala (Half)", "category": "Indian Dishes - Chicken", "price": 170.00, "vegetarian": False},
        {"name": "Chicken Masala (Full)", "category": "Indian Dishes - Chicken", "price": 340.00, "vegetarian": False},
        {"name": "Chicken Kolhapuri (Half)", "category": "Indian Dishes - Chicken", "price": 190.00, "vegetarian": False},
        {"name": "Chicken Kolhapuri (Full)", "category": "Indian Dishes - Chicken", "price": 380.00, "vegetarian": False},
        {"name": "Chicken Hyderabadi (Half)", "category": "Indian Dishes - Chicken", "price": 190.00, "vegetarian": False},
        {"name": "Chicken Hyderabadi (Full)", "category": "Indian Dishes - Chicken", "price": 380.00, "vegetarian": False},
        {"name": "Butter Chicken (Half)", "category": "Indian Dishes - Chicken", "price": 200.00, "vegetarian": False},
        {"name": "Butter Chicken (Full)", "category": "Indian Dishes - Chicken", "price": 400.00, "vegetarian": False},
        {"name": "Chicken Maharaja (Half)", "category": "Indian Dishes - Chicken", "price": 220.00, "vegetarian": False},
        {"name": "Chicken Maharaja (Full)", "category": "Indian Dishes - Chicken", "price": 430.00, "vegetarian": False},
        {"name": "Chicken Kadai (Half)", "category": "Indian Dishes - Chicken", "price": 220.00, "vegetarian": False},
        {"name": "Chicken Kadai (Full)", "category": "Indian Dishes - Chicken", "price": 440.00, "vegetarian": False},
        {"name": "Chicken Peshawari (Half)", "category": "Indian Dishes - Chicken", "price": 260.00, "vegetarian": False},
        {"name": "Chicken Peshawari (Full)", "category": "Indian Dishes - Chicken", "price": 510.00, "vegetarian": False},
        {"name": "Chicken Nawabi (Half)", "category": "Indian Dishes - Chicken", "price": 260.00, "vegetarian": False},
        {"name": "Chicken Nawabi (Full)", "category": "Indian Dishes - Chicken", "price": 510.00, "vegetarian": False},
        {"name": "Chicken Afghani (Half)", "category": "Indian Dishes - Chicken", "price": 340.00, "vegetarian": False},
        {"name": "Chicken Afghani (Full)", "category": "Indian Dishes - Chicken", "price": 680.00, "vegetarian": False},
        {"name": "Andhra Chicken (Half)", "category": "Indian Dishes - Chicken", "price": 280.00, "vegetarian": False},
        {"name": "Andhra Chicken (Full)", "category": "Indian Dishes - Chicken", "price": 560.00, "vegetarian": False},
        {"name": "Chicken Do Pyaza (Half)", "category": "Indian Dishes - Chicken", "price": 260.00, "vegetarian": False},
        {"name": "Chicken Do Pyaza (Full)", "category": "Indian Dishes - Chicken", "price": 510.00, "vegetarian": False},
        {"name": "Chicken Makhanwala (Half)", "category": "Indian Dishes - Chicken", "price": 300.00, "vegetarian": False},
        {"name": "Chicken Makhanwala (Full)", "category": "Indian Dishes - Chicken", "price": 600.00, "vegetarian": False},
        {"name": "Chicken Mumtaz (Half)", "category": "Indian Dishes - Chicken", "price": 370.00, "vegetarian": False},
        {"name": "Chicken Mumtaz (Full)", "category": "Indian Dishes - Chicken", "price": 740.00, "vegetarian": False},
        {"name": "Chicken Rana (Half)", "category": "Indian Dishes - Chicken", "price": 260.00, "vegetarian": False},
        {"name": "Chicken Rana (Full)", "category": "Indian Dishes - Chicken", "price": 520.00, "vegetarian": False},
        {"name": "Chicken Malwani (Half)", "category": "Indian Dishes - Chicken", "price": 290.00, "vegetarian": False},
        {"name": "Chicken Malwani (Full)", "category": "Indian Dishes - Chicken", "price": 570.00, "vegetarian": False},
        {"name": "Chicken Pondicherry (Half)", "category": "Indian Dishes - Chicken", "price": 270.00, "vegetarian": False},
        {"name": "Chicken Pondicherry (Full)", "category": "Indian Dishes - Chicken", "price": 540.00, "vegetarian": False},
        {"name": "Chicken Hundi (Half)", "category": "Indian Dishes - Chicken", "price": 260.00, "vegetarian": False},
        {"name": "Chicken Hundi (Full)", "category": "Indian Dishes - Chicken", "price": 510.00, "vegetarian": False},
        {"name": "Chicken Taj Special (Half)", "category": "Indian Dishes - Chicken", "price": 270.00, "vegetarian": False},
        {"name": "Chicken Taj Special (Full)", "category": "Indian Dishes - Chicken", "price": 540.00, "vegetarian": False},
        {"name": "Murg Mussalam (Half)", "category": "Indian Dishes - Chicken", "price": 270.00, "vegetarian": False},
        {"name": "Murg Mussalam (Full)", "category": "Indian Dishes - Chicken", "price": 540.00, "vegetarian": False},
        {"name": "Chicken Tikka Masala (Half)", "category": "Indian Dishes - Chicken", "price": 280.00, "vegetarian": False},
        {"name": "Chicken Tikka Masala (Full)", "category": "Indian Dishes - Chicken", "price": 580.00, "vegetarian": False},
        {"name": "Punjabi Chicken (Half)", "category": "Indian Dishes - Chicken", "price": 270.00, "vegetarian": False},
        {"name": "Punjabi Chicken (Full)", "category": "Indian Dishes - Chicken", "price": 540.00, "vegetarian": False},
        {"name": "Chicken Golkunda (Half)", "category": "Indian Dishes - Chicken", "price": 260.00, "vegetarian": False},
        {"name": "Chicken Golkunda (Full)", "category": "Indian Dishes - Chicken", "price": 520.00, "vegetarian": False},
        {"name": "Chicken Sultani (Half)", "category": "Indian Dishes - Chicken", "price": 260.00, "vegetarian": False},
        {"name": "Chicken Sultani (Full)", "category": "Indian Dishes - Chicken", "price": 520.00, "vegetarian": False},
        
        # Indian Dishes - Mutton
        {"name": "Mutton Masala (Half)", "category": "Indian Dishes - Mutton", "price": 230.00, "vegetarian": False},
        {"name": "Mutton Masala (Full)", "category": "Indian Dishes - Mutton", "price": 460.00, "vegetarian": False},
        {"name": "Mutton Kolhapuri (Half)", "category": "Indian Dishes - Mutton", "price": 260.00, "vegetarian": False},
        {"name": "Mutton Kolhapuri (Full)", "category": "Indian Dishes - Mutton", "price": 520.00, "vegetarian": False},
        {"name": "Mutton Hyderabadi (Half)", "category": "Indian Dishes - Mutton", "price": 260.00, "vegetarian": False},
        {"name": "Mutton Hyderabadi (Full)", "category": "Indian Dishes - Mutton", "price": 520.00, "vegetarian": False},
        {"name": "Mutton Maharaja (Half)", "category": "Indian Dishes - Mutton", "price": 280.00, "vegetarian": False},
        {"name": "Mutton Maharaja (Full)", "category": "Indian Dishes - Mutton", "price": 560.00, "vegetarian": False},
        {"name": "Mutton Kadai (Half)", "category": "Indian Dishes - Mutton", "price": 280.00, "vegetarian": False},
        {"name": "Mutton Kadai (Full)", "category": "Indian Dishes - Mutton", "price": 550.00, "vegetarian": False},
        {"name": "Mutton Peshawari (Half)", "category": "Indian Dishes - Mutton", "price": 290.00, "vegetarian": False},
        {"name": "Mutton Peshawari (Full)", "category": "Indian Dishes - Mutton", "price": 570.00, "vegetarian": False},
        {"name": "Mutton Makhanwala (Half)", "category": "Indian Dishes - Mutton", "price": 340.00, "vegetarian": False},
        {"name": "Mutton Makhanwala (Full)", "category": "Indian Dishes - Mutton", "price": 680.00, "vegetarian": False},
        {"name": "Mutton Rana (Half)", "category": "Indian Dishes - Mutton", "price": 290.00, "vegetarian": False},
        {"name": "Mutton Rana (Full)", "category": "Indian Dishes - Mutton", "price": 570.00, "vegetarian": False},
        {"name": "Mutton Hundi (Half)", "category": "Indian Dishes - Mutton", "price": 290.00, "vegetarian": False},
        {"name": "Mutton Hundi (Full)", "category": "Indian Dishes - Mutton", "price": 570.00, "vegetarian": False},
        {"name": "Mutton Pondicherry (Half)", "category": "Indian Dishes - Mutton", "price": 300.00, "vegetarian": False},
        {"name": "Mutton Pondicherry (Full)", "category": "Indian Dishes - Mutton", "price": 600.00, "vegetarian": False},
        {"name": "Mutton Rogan Josh (Half)", "category": "Indian Dishes - Mutton", "price": 310.00, "vegetarian": False},
        {"name": "Mutton Rogan Josh (Full)", "category": "Indian Dishes - Mutton", "price": 610.00, "vegetarian": False},
        {"name": "Mutton Malwani (Half)", "category": "Indian Dishes - Mutton", "price": 330.00, "vegetarian": False},
        {"name": "Mutton Malwani (Full)", "category": "Indian Dishes - Mutton", "price": 630.00, "vegetarian": False},
        {"name": "Mutton Chilly (Half)", "category": "Indian Dishes - Mutton", "price": 410.00, "vegetarian": False},
        {"name": "Mutton Chilly (Full)", "category": "Indian Dishes - Mutton", "price": 820.00, "vegetarian": False},
        {"name": "Mutton Pepper Dry (Half)", "category": "Indian Dishes - Mutton", "price": 400.00, "vegetarian": False},
        {"name": "Mutton Pepper Dry (Full)", "category": "Indian Dishes - Mutton", "price": 800.00, "vegetarian": False},
        {"name": "Mutton Andhra (Half)", "category": "Indian Dishes - Mutton", "price": 360.00, "vegetarian": False},
        {"name": "Mutton Andhra (Full)", "category": "Indian Dishes - Mutton", "price": 570.00, "vegetarian": False},
        {"name": "Mutton Taj Special", "category": "Indian Dishes - Mutton", "price": 1020.00, "vegetarian": False},
        
        # Biryani & Rice
        {"name": "Chicken Biryani (Half)", "category": "Biryani & Rice", "price": 170.00, "vegetarian": False},
        {"name": "Chicken Biryani (Full)", "category": "Biryani & Rice", "price": 320.00, "vegetarian": False},
        {"name": "Kuska", "category": "Biryani & Rice", "price": 120.00, "vegetarian": True},
        {"name": "Mutton Biryani", "category": "Biryani & Rice", "price": 240.00, "vegetarian": False},
        {"name": "Egg Biryani", "category": "Biryani & Rice", "price": 150.00, "vegetarian": False},
        {"name": "Veg Biryani", "category": "Biryani & Rice", "price": 150.00, "vegetarian": True},
        {"name": "Paneer Biryani", "category": "Biryani & Rice", "price": 190.00, "vegetarian": True},
        {"name": "Ghee Rice", "category": "Biryani & Rice", "price": 150.00, "vegetarian": True},
        {"name": "Zeera Rice", "category": "Biryani & Rice", "price": 140.00, "vegetarian": True},
        {"name": "Chicken Fried Rice", "category": "Biryani & Rice", "price": 180.00, "vegetarian": False},
        {"name": "Egg Fried Rice", "category": "Biryani & Rice", "price": 160.00, "vegetarian": False},
        
        # Egg Items
        {"name": "Egg Masala (Half)", "category": "Egg Items", "price": 140.00, "vegetarian": False},
        {"name": "Egg Kolhapuri (Half)", "category": "Egg Items", "price": 150.00, "vegetarian": False},
        {"name": "Egg Hyderabadi (Half)", "category": "Egg Items", "price": 150.00, "vegetarian": False},
        {"name": "Egg Maharaja (Half)", "category": "Egg Items", "price": 180.00, "vegetarian": False},
        {"name": "Egg Makhanwala (Half)", "category": "Egg Items", "price": 190.00, "vegetarian": False},
        {"name": "Egg Peshawari (Half)", "category": "Egg Items", "price": 200.00, "vegetarian": False},
        {"name": "Egg Pondicherry (Half)", "category": "Egg Items", "price": 200.00, "vegetarian": False},
        {"name": "Egg Chilly (Half)", "category": "Egg Items", "price": 170.00, "vegetarian": False},
        {"name": "Egg Manchurian (Half)", "category": "Egg Items", "price": 180.00, "vegetarian": False},
        {"name": "Egg Burji (Half)", "category": "Egg Items", "price": 90.00, "vegetarian": False},
        {"name": "Boiled Egg", "category": "Egg Items", "price": 10.00, "vegetarian": False},
        {"name": "Omelette", "category": "Egg Items", "price": 70.00, "vegetarian": False},
        
        # Veg
        {"name": "Gobi Manchuri (Half)", "category": "Veg", "price": 150.00, "vegetarian": True},
        {"name": "Gobi Chilly (Half)", "category": "Veg", "price": 150.00, "vegetarian": True},
        {"name": "Gobi 65 (Half)", "category": "Veg", "price": 150.00, "vegetarian": True},
        {"name": "Veg Masala (Half)", "category": "Veg", "price": 150.00, "vegetarian": True},
        {"name": "Veg Kolhapuri (Half)", "category": "Veg", "price": 160.00, "vegetarian": True},
        {"name": "Veg Hyderabadi (Half)", "category": "Veg", "price": 160.00, "vegetarian": True},
        {"name": "Veg Kadai (Half)", "category": "Veg", "price": 180.00, "vegetarian": True},
        {"name": "Veg Malwani (Half)", "category": "Veg", "price": 230.00, "vegetarian": True},
        {"name": "Veg Rana (Half)", "category": "Veg", "price": 180.00, "vegetarian": True},
        {"name": "Veg Afghani (Half)", "category": "Veg", "price": 260.00, "vegetarian": True},
        {"name": "Veg Pondicherry (Half)", "category": "Veg", "price": 200.00, "vegetarian": True},
        
        # Gravy
        {"name": "Gravy Masala (Half)", "category": "Gravy", "price": 120.00, "vegetarian": True},
        {"name": "Gravy Kolhapuri (Half)", "category": "Gravy", "price": 140.00, "vegetarian": True},
        {"name": "Gravy Hyderabadi (Half)", "category": "Gravy", "price": 140.00, "vegetarian": True},
        {"name": "Gravy Maharaja (Half)", "category": "Gravy", "price": 160.00, "vegetarian": True},
        {"name": "Gravy Peshawari (Half)", "category": "Gravy", "price": 170.00, "vegetarian": True},
        {"name": "Gravy Makhanwala (Half)", "category": "Gravy", "price": 170.00, "vegetarian": True},
        {"name": "Kaju Masala (Half)", "category": "Gravy", "price": 210.00, "vegetarian": True},
        {"name": "Kaju Kolhapuri (Half)", "category": "Gravy", "price": 210.00, "vegetarian": True},
        {"name": "Kaju Hyderabadi (Half)", "category": "Gravy", "price": 210.00, "vegetarian": True},
        {"name": "Kaju Kadai (Half)", "category": "Gravy", "price": 240.00, "vegetarian": True},
        
        # Dal
        {"name": "Dal Fry (Half)", "category": "Dal", "price": 130.00, "vegetarian": True},
        {"name": "Dal Kolhapuri (Half)", "category": "Dal", "price": 140.00, "vegetarian": True},
        {"name": "Dal Tadka (Half)", "category": "Dal", "price": 150.00, "vegetarian": True},
        
        # Extras
        {"name": "Plain Papad", "category": "Extras", "price": 25.00, "vegetarian": True},
        {"name": "Masala Papad", "category": "Extras", "price": 50.00, "vegetarian": True},
        {"name": "Veg Manchow Soup", "category": "Extras", "price": 120.00, "vegetarian": True},
        {"name": "Chicken Manchow Soup", "category": "Extras", "price": 210.00, "vegetarian": False},
    ]
    
    for item_data in menu_items:
        menu_item_payload = {
            "name": item_data["name"],
            "description": f"Authentic {item_data['name']} - a house specialty",
            "category_id": category_ids[item_data["category"]],
            "base_price": item_data["price"],
            "is_vegetarian": item_data["vegetarian"],
            "is_available": True,
            "branch_ids": None
        }
        
        response = requests.post(f"{BASE_URL}/menu/items", json=menu_item_payload, headers=headers)
        if response.status_code == 200:
            print(f"✅ Created menu item: {item_data['name']}")
    
    # 5. Create Tables for each branch
    print("\n5️⃣ Creating tables for branches...")
    for idx, branch_id in enumerate(branch_ids):
        branch_name = branches[idx]["name"]
        for table_num in range(1, 11):
            table_data = {
                "branch_id": branch_id,
                "table_number": f"T{table_num:02d}",
                "capacity": 4 if table_num <= 6 else 6,
                "location": "Main Hall" if table_num <= 5 else "Window Side"
            }
            response = requests.post(f"{BASE_URL}/tables", json=table_data, headers=headers)
            if response.status_code == 200:
                if table_num == 1:
                    print(f"✅ Created tables for {branch_name}")
    
    # 6. Create Branch Staff
    print("\n6️⃣ Creating branch staff...")
    
    # Create short-named staff for testing (Old Hubli branch - first branch)
    test_staff = [
        {"email": "kitchen@altaj.com", "password": "kit123", "name": "Test Kitchen", "role": "kitchen_staff", "branch_id": branch_ids[0]},
        {"email": "waiter@altaj.com", "password": "wait123", "name": "Test Waiter", "role": "waiter", "branch_id": branch_ids[0]},
        {"email": "del@altaj.com", "password": "del123", "name": "Test Delivery", "role": "delivery_partner", "branch_id": branch_ids[0]},
    ]
    
    delivery_user_id = None
    for staff in test_staff:
        staff["phone"] = "+91-836-0000001"
        response = requests.post(f"{BASE_URL}/auth/register", json=staff)
        if response.status_code == 200:
            print(f"✅ Created test {staff['role']}: {staff['email']}")
            if staff["role"] == "delivery_partner":
                delivery_user_id = response.json().get("user", {}).get("id")
    
    # Create delivery partner profile for test delivery user
    if delivery_user_id:
        partner_data = {
            "user_id": delivery_user_id,
            "branch_id": branch_ids[0],
            "vehicle_type": "bike",
            "vehicle_number": "KA-25-TEST1"
        }
        requests.post(f"{BASE_URL}/delivery-partners", json=partner_data, headers=headers)
    
    # Create additional staff for all branches
    for idx, branch_id in enumerate(branch_ids):
        branch_name = branches[idx]["name"].replace("Al Taj ", "").lower().replace(" ", "")
        
        manager_data = {
            "email": f"mgr{idx+1}@altaj.com",
            "password": "mgr123",
            "name": f"Manager - {branches[idx]['name']}",
            "role": "branch_manager",
            "phone": f"+91-836-{idx}00-0001",
            "branch_id": branch_id
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=manager_data)
        if response.status_code == 200:
            print(f"✅ Created manager: mgr{idx+1}@altaj.com")
        
        # Additional staff with shorter emails
        for waiter_num in range(1, 3):
            waiter_data = {
                "email": f"w{waiter_num}b{idx+1}@altaj.com",
                "password": "wait123",
                "name": f"Waiter {waiter_num} - Branch {idx+1}",
                "role": "waiter",
                "phone": f"+91-836-{idx}0{waiter_num}-0001",
                "branch_id": branch_id
            }
            requests.post(f"{BASE_URL}/auth/register", json=waiter_data)
        
        for kitchen_num in range(1, 2):
            kitchen_data = {
                "email": f"k{kitchen_num}b{idx+1}@altaj.com",
                "password": "kit123",
                "name": f"Chef {kitchen_num} - Branch {idx+1}",
                "role": "kitchen_staff",
                "phone": f"+91-836-{idx}1{kitchen_num}-0001",
                "branch_id": branch_id
            }
            requests.post(f"{BASE_URL}/auth/register", json=kitchen_data)
        
        # Create delivery partners for each branch
        delivery_user_ids = []
        for delivery_num in range(1, 3):
            delivery_data = {
                "email": f"d{delivery_num}b{idx+1}@altaj.com",
                "password": "del123",
                "name": f"Delivery {delivery_num} - Branch {idx+1}",
                "role": "delivery_partner",
                "phone": f"+91-836-{idx}2{delivery_num}-0001",
                "branch_id": branch_id
            }
            response = requests.post(f"{BASE_URL}/auth/register", json=delivery_data)
            if response.status_code == 200:
                delivery_user_ids.append(response.json().get("user", {}).get("id"))
        
        # Create delivery partner profiles
        for d_idx, user_id in enumerate(delivery_user_ids):
            if user_id:
                partner_data = {
                    "user_id": user_id,
                    "branch_id": branch_id,
                    "vehicle_type": "bike" if d_idx % 2 == 0 else "scooter",
                    "vehicle_number": f"KA-25-{idx}{d_idx}123"
                }
                requests.post(f"{BASE_URL}/delivery-partners", json=partner_data, headers=headers)
    
    print(f"✅ Created staff for all branches (including delivery partners)")
    
    # 7. Create Sample Customers
    print("\n7️⃣ Creating sample customers...")
    customers = [
        {"email": "cust@altaj.com", "password": "cust123", "name": "Test Customer", "phone": "+91-9876543210"},
        {"email": "rajesh@altaj.com", "password": "cust123", "name": "Rajesh Kumar", "phone": "+91-9876543211"},
        {"email": "priya@altaj.com", "password": "cust123", "name": "Priya Sharma", "phone": "+91-9876543212"}
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
    print("\n📋 Test Credentials (Short & Easy):")
    print("   ─────────────────────────────────")
    print("   Admin:     admin@altaj.com / admin123")
    print("   Customer:  cust@altaj.com / cust123")
    print("   Kitchen:   kitchen@altaj.com / kit123")
    print("   Waiter:    waiter@altaj.com / wait123")
    print("   Delivery:  del@altaj.com / del123")
    print("   Manager:   mgr1@altaj.com / mgr123")
    print("   ─────────────────────────────────")
    print(f"\n📊 Data Summary:")
    print(f"   - Branches: {len(branches)}")
    print(f"   - Menu Categories: {len(categories)}")
    print(f"   - Menu Items: {len(menu_items)}")
    print(f"   - Tables per Branch: 10")
    print(f"\n   🇮🇳 Currency: Indian Rupee (₹)")
    print(f"   📍 Location: Hubballi, Karnataka, India")

if __name__ == "__main__":
    asyncio.run(seed_data())
