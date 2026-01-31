import asyncio
import requests
from datetime import datetime, timezone, timedelta

BASE_URL = "http://localhost:8001/api"

async def update_menu():
    print("🔄 Updating Al Taj Restaurant menu with real data...")
    
    # 1. Get admin token
    print("\n1️⃣ Logging in as admin...")
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@altaj.com",
        "password": "admin123"
    })
    admin_token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}
    print("✅ Admin logged in")
    
    # 2. Create new menu categories
    print("\n2️⃣ Creating menu categories...")
    categories = [
        {"name": "Tandoori Specialties", "description": "Tandoor grilled delicacies", "display_order": 1},
        {"name": "Chinese Starters", "description": "Indo-Chinese fusion starters", "display_order": 2},
        {"name": "Chicken Curries", "description": "Aromatic chicken preparations", "display_order": 3},
        {"name": "Mutton Curries", "description": "Rich mutton delicacies", "display_order": 4},
        {"name": "Biryani & Rice", "description": "Fragrant rice dishes", "display_order": 5},
        {"name": "Egg Dishes", "description": "Egg preparations", "display_order": 6},
        {"name": "Vegetarian", "description": "Pure vegetarian delights", "display_order": 7},
        {"name": "Paneer Specials", "description": "Cottage cheese varieties", "display_order": 8},
        {"name": "Breads", "description": "Freshly baked breads", "display_order": 9},
        {"name": "Dal & Soups", "description": "Lentils and soups", "display_order": 10}
    ]
    
    category_ids = {}
    for cat_data in categories:
        response = requests.post(f"{BASE_URL}/menu/categories", json=cat_data, headers=headers)
        if response.status_code == 200:
            cat_id = response.json()["id"]
            category_ids[cat_data["name"]] = cat_id
            print(f"✅ Created category: {cat_data['name']}")
    
    # 3. Create menu items from Al Taj menu
    print("\n3️⃣ Creating menu items...")
    
    menu_items = [
        # Tandoori Specialties
        {"name": "Tandoori Chicken (Half)", "category": "Tandoori Specialties", "price": 210, "vegetarian": False},
        {"name": "Tandoori Chicken (Full)", "category": "Tandoori Specialties", "price": 410, "vegetarian": False},
        {"name": "Chicken Tikka", "category": "Tandoori Specialties", "price": 260, "vegetarian": False},
        {"name": "Tandoori Kabab (Half)", "category": "Tandoori Specialties", "price": 220, "vegetarian": False},
        {"name": "Tandoori Kabab (Full)", "category": "Tandoori Specialties", "price": 430, "vegetarian": False},
        {"name": "Reshmi Kabab", "category": "Tandoori Specialties", "price": 270, "vegetarian": False},
        {"name": "Malai Kabab", "category": "Tandoori Specialties", "price": 260, "vegetarian": False},
        {"name": "Afgaani Kabab", "category": "Tandoori Specialties", "price": 270, "vegetarian": False},
        {"name": "Bhatti Chicken (Half)", "category": "Tandoori Specialties", "price": 230, "vegetarian": False},
        {"name": "Bhatti Chicken (Full)", "category": "Tandoori Specialties", "price": 450, "vegetarian": False},
        
        # Chinese Starters
        {"name": "Chicken Manchurian", "category": "Chinese Starters", "price": 260, "vegetarian": False},
        {"name": "Chicken Chilly", "category": "Chinese Starters", "price": 220, "vegetarian": False},
        {"name": "Chicken 65", "category": "Chinese Starters", "price": 250, "vegetarian": False},
        {"name": "Chicken Lollipop (6 Pcs)", "category": "Chinese Starters", "price": 250, "vegetarian": False},
        {"name": "Chicken Satay", "category": "Chinese Starters", "price": 310, "vegetarian": False},
        {"name": "Korean Chicken Wings", "category": "Chinese Starters", "price": 270, "vegetarian": False},
        {"name": "Pepper Chicken", "category": "Chinese Starters", "price": 280, "vegetarian": False},
        
        # Chicken Curries (popular ones)
        {"name": "Chicken Masala", "category": "Chicken Curries", "price": 170, "vegetarian": False, "description": "Classic chicken curry"},
        {"name": "Butter Chicken", "category": "Chicken Curries", "price": 200, "vegetarian": False, "description": "Creamy tomato-based curry"},
        {"name": "Chicken Kolhapuri", "category": "Chicken Curries", "price": 190, "vegetarian": False, "description": "Spicy Kolhapuri style"},
        {"name": "Chicken Hyderabadi", "category": "Chicken Curries", "price": 190, "vegetarian": False, "description": "Aromatic Hyderabadi preparation"},
        {"name": "Chicken Kadai", "category": "Chicken Curries", "price": 220, "vegetarian": False, "description": "Wok-tossed with spices"},
        {"name": "Chicken Tikka Masala", "category": "Chicken Curries", "price": 280, "vegetarian": False, "description": "Tikka in rich gravy"},
        {"name": "Chicken Maharaja", "category": "Chicken Curries", "price": 220, "vegetarian": False, "description": "Royal preparation"},
        {"name": "Chicken Peshawari", "category": "Chicken Curries", "price": 260, "vegetarian": False, "description": "North-west frontier style"},
        
        # Mutton Curries
        {"name": "Mutton Masala", "category": "Mutton Curries", "price": 230, "vegetarian": False},
        {"name": "Mutton Kolhapuri", "category": "Mutton Curries", "price": 260, "vegetarian": False},
        {"name": "Mutton Hyderabadi", "category": "Mutton Curries", "price": 260, "vegetarian": False},
        {"name": "Mutton Kadai", "category": "Mutton Curries", "price": 280, "vegetarian": False},
        {"name": "Mutton Rogan Josh", "category": "Mutton Curries", "price": 310, "vegetarian": False},
        
        # Biryani & Rice
        {"name": "Chicken Biryani", "category": "Biryani & Rice", "price": 170, "vegetarian": False, "description": "Aromatic rice with chicken"},
        {"name": "Mutton Biryani", "category": "Biryani & Rice", "price": 240, "vegetarian": False, "description": "Tender mutton with basmati"},
        {"name": "Egg Biryani", "category": "Biryani & Rice", "price": 150, "vegetarian": True, "description": "Egg layered biryani"},
        {"name": "Paneer Biryani", "category": "Biryani & Rice", "price": 190, "vegetarian": True, "description": "Cottage cheese biryani"},
        {"name": "Ghee Rice", "category": "Biryani & Rice", "price": 150, "vegetarian": True},
        {"name": "Chicken Fried Rice", "category": "Biryani & Rice", "price": 180, "vegetarian": False},
        {"name": "Kuska", "category": "Biryani & Rice", "price": 120, "vegetarian": True, "description": "Plain biryani rice"},
        
        # Egg Dishes
        {"name": "Egg Masala", "category": "Egg Dishes", "price": 140, "vegetarian": True},
        {"name": "Egg Kolhapuri", "category": "Egg Dishes", "price": 150, "vegetarian": True},
        {"name": "Egg Chilly", "category": "Egg Dishes", "price": 170, "vegetarian": True},
        {"name": "Egg Burji", "category": "Egg Dishes", "price": 90, "vegetarian": True},
        
        # Vegetarian
        {"name": "Veg Masala", "category": "Vegetarian", "price": 120, "vegetarian": True},
        {"name": "Gobi Manchurian", "category": "Vegetarian", "price": 150, "vegetarian": True},
        {"name": "Gobi Chilly", "category": "Vegetarian", "price": 150, "vegetarian": True},
        {"name": "Gobi 65", "category": "Vegetarian", "price": 150, "vegetarian": True},
        
        # Paneer Specials
        {"name": "Paneer Masala", "category": "Paneer Specials", "price": 170, "vegetarian": True},
        {"name": "Paneer Butter Masala", "category": "Paneer Specials", "price": 240, "vegetarian": True},
        {"name": "Paneer Tikka", "category": "Paneer Specials", "price": 300, "vegetarian": True},
        {"name": "Paneer Tikka Masala", "category": "Paneer Specials", "price": 290, "vegetarian": True},
        {"name": "Paneer Chilly", "category": "Paneer Specials", "price": 260, "vegetarian": True},
        {"name": "Paneer Kadai", "category": "Paneer Specials", "price": 210, "vegetarian": True},
        
        # Breads
        {"name": "Tandoori Roti", "category": "Breads", "price": 25, "vegetarian": True},
        {"name": "Butter Roti", "category": "Breads", "price": 30, "vegetarian": True},
        {"name": "Plain Naan", "category": "Breads", "price": 40, "vegetarian": True},
        {"name": "Butter Naan", "category": "Breads", "price": 50, "vegetarian": True},
        {"name": "Garlic Naan", "category": "Breads", "price": 60, "vegetarian": True},
        
        # Dal & Soups
        {"name": "Dal Fry", "category": "Dal & Soups", "price": 130, "vegetarian": True},
        {"name": "Dal Tadka", "category": "Dal & Soups", "price": 150, "vegetarian": True},
        {"name": "Veg Manchow Soup", "category": "Dal & Soups", "price": 120, "vegetarian": True},
        {"name": "Chicken Manchow Soup", "category": "Dal & Soups", "price": 210, "vegetarian": False}
    ]
    
    count = 0
    for item_data in menu_items:
        menu_item_payload = {
            "name": item_data["name"],
            "description": item_data.get("description", ""),
            "category_id": category_ids[item_data["category"]],
            "base_price": item_data["price"],
            "is_vegetarian": item_data["vegetarian"],
            "is_available": True,
            "branch_ids": None  # Available at all branches
        }
        
        response = requests.post(f"{BASE_URL}/menu/items", json=menu_item_payload, headers=headers)
        if response.status_code == 200:
            count += 1
            if count % 10 == 0:
                print(f"✅ Created {count} items...")
    
    print(f"✅ Total {count} menu items created")
    
    print("\n🎉 Menu update completed successfully!")
    print(f"   - Categories: {len(categories)}")
    print(f"   - Menu Items: {count}")
    print(f"   - Real Al Taj menu loaded!")

if __name__ == "__main__":
    asyncio.run(update_menu())
