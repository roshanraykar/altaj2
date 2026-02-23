"""
Auto-seed module: Seeds the database on startup if it's empty.
This ensures production deployments have all necessary data.
"""
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def auto_seed_if_empty(db):
    """Check if database is empty and seed if needed. Also repairs partial seeds."""
    branch_count = await db.branches.count_documents({})
    category_count = await db.menu_categories.count_documents({})
    item_count = await db.menu_items.count_documents({})
    user_count = await db.users.count_documents({})

    if branch_count > 0 and category_count > 0 and item_count > 0 and user_count > 0:
        return False  # Already fully seeded

    print("[AUTO-SEED] Incomplete database detected. Seeding missing data...")

    # 1. Branches
    if branch_count == 0:
        branches = [
            {
                "id": str(uuid.uuid4()),
                "name": "Al Taj Family Restaurant - Old Hubli",
                "address": "CTS No 5049, Vishal Nagar, Gudihal Road, Old Hubli, Hubballi - 580024",
                "phone": "+91-836-2245678",
                "email": "oldhubli@altajrestaurant.com",
                "latitude": 15.3647,
                "longitude": 75.1240,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Al Taj Restaurant & Fast Food - Shirur Park",
                "address": "Shirur Park, JC Nagar, Opposite Chetan College, Vidyanagar, Hubballi - 580021",
                "phone": "+91-836-2356789",
                "email": "shirurpark@altajrestaurant.com",
                "latitude": 15.3486,
                "longitude": 75.1348,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.branches.insert_many(branches)
        print(f"[AUTO-SEED] Created {len(branches)} branches")

    # Get branch IDs for staff assignment
    all_branches = await db.branches.find({}, {"_id": 0, "id": 1}).to_list(10)
    branch_ids = [b["id"] for b in all_branches]

    # 2. Categories
    categories_data = [
        {"name": "Combos", "description": "Value combo meals - Save more!", "display_order": 0},
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
        {"name": "Extras", "description": "Sides and accompaniments", "display_order": 11},
        {"name": "Raw Meat", "description": "Fresh raw meat cuts - Chicken, Mutton", "display_order": 12},
        {"name": "Ready to Cook", "description": "Marinated & ready to cook at home", "display_order": 13},
    ]
    cat_ids = {}

    if category_count == 0:
        cat_docs = []
        for cat in categories_data:
            cid = str(uuid.uuid4())
            cat_ids[cat["name"]] = cid
            cat_docs.append({
                "id": cid,
                "name": cat["name"],
                "description": cat["description"],
                "display_order": cat["display_order"],
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        await db.menu_categories.insert_many(cat_docs)
        print(f"[AUTO-SEED] Created {len(cat_docs)} categories")
    else:
        # Load existing category IDs
        existing_cats = await db.menu_categories.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(100)
        cat_ids = {c["name"]: c["id"] for c in existing_cats}

    # 3. Menu Items
    if item_count == 0 and cat_ids:
    menu_items_raw = [
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
        # Indian Dishes - Chicken
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
        # Combos
        {"name": "Combo 1: Chicken Biryani + Chicken Kabab", "category": "Combos", "price": 299.00, "vegetarian": False, "description": "Full Chicken Biryani + 6 Pcs Chicken Kabab (Save Rs.51)"},
        {"name": "Combo 2: Egg Biryani + Chicken Kabab", "category": "Combos", "price": 249.00, "vegetarian": False, "description": "Full Egg Biryani + 6 Pcs Chicken Kabab (Save Rs.41)"},
        {"name": "Combo 3: Jeera Rice + Chicken Masala", "category": "Combos", "price": 279.00, "vegetarian": False, "description": "Jeera Rice + Chicken Masala Half (Save Rs.31)"},
        {"name": "Combo 4: Veg Biryani + Paneer Butter Masala", "category": "Combos", "price": 269.00, "vegetarian": True, "description": "Veg Biryani + Paneer Butter Masala Half (Save Rs.41)"},
        {"name": "Combo 5: Family Pack - 2 Biryani + 2 Kabab", "category": "Combos", "price": 549.00, "vegetarian": False, "description": "2 Chicken Biryani + 12 Pcs Kabab (Save Rs.111)"},
        # Raw Meat
        {"name": "Chicken Leg Piece (1 Kg)", "category": "Raw Meat", "price": 220.00, "vegetarian": False, "description": "Fresh chicken leg pieces - cleaned and ready"},
        {"name": "Chicken Boneless (1 Kg)", "category": "Raw Meat", "price": 350.00, "vegetarian": False, "description": "Premium boneless chicken cubes"},
        {"name": "Chicken Wings (1 Kg)", "category": "Raw Meat", "price": 280.00, "vegetarian": False, "description": "Fresh chicken wings - party pack"},
        {"name": "Chicken Breast (1 Kg)", "category": "Raw Meat", "price": 320.00, "vegetarian": False, "description": "Lean chicken breast fillets"},
        {"name": "Whole Chicken (1 Pc)", "category": "Raw Meat", "price": 300.00, "vegetarian": False, "description": "Whole dressed chicken approx 1-1.2 Kg"},
        {"name": "Chicken Liver (500g)", "category": "Raw Meat", "price": 120.00, "vegetarian": False, "description": "Fresh chicken liver"},
        {"name": "Mutton (1 Kg)", "category": "Raw Meat", "price": 750.00, "vegetarian": False, "description": "Fresh goat meat with bone"},
        {"name": "Mutton Boneless (1 Kg)", "category": "Raw Meat", "price": 950.00, "vegetarian": False, "description": "Premium boneless mutton cubes"},
        # Ready to Cook
        {"name": "Chicken Gravy Pack (Serves 4)", "category": "Ready to Cook", "price": 280.00, "vegetarian": False, "description": "Marinated chicken with gravy mix - just heat and serve"},
        {"name": "Chicken Masala Pack (Serves 4)", "category": "Ready to Cook", "price": 290.00, "vegetarian": False, "description": "Pre-marinated chicken masala - cook in 15 mins"},
        {"name": "Chicken Kabab Pack (12 Pcs)", "category": "Ready to Cook", "price": 320.00, "vegetarian": False, "description": "Marinated kababs - grill or pan fry"},
        {"name": "Tandoori Chicken Pack (Full)", "category": "Ready to Cook", "price": 350.00, "vegetarian": False, "description": "Tandoori marinated chicken - oven ready"},
        {"name": "Chicken 65 Pack (500g)", "category": "Ready to Cook", "price": 280.00, "vegetarian": False, "description": "Ready to fry chicken 65 - crispy in minutes"},
        {"name": "Biryani Mix Pack (Serves 4)", "category": "Ready to Cook", "price": 350.00, "vegetarian": False, "description": "Marinated chicken + spices + rice - complete biryani kit"},
        {"name": "Butter Chicken Pack (Serves 4)", "category": "Ready to Cook", "price": 320.00, "vegetarian": False, "description": "Creamy butter chicken - microwave ready"},
    ]

    # Image URL mapping (all 183 AI-generated images)
    image_map = {
        "Afghani Kabab": "/menu-images/tandoori_k_034a61ff.png",
        "Alfam (Full)": "/menu-images/tandoori_k_31e012c2.png",
        "Andhra Chicken (Full)": "/menu-images/indian_dis_1663d1fd.png",
        "Andhra Chicken (Half)": "/menu-images/indian_dis_ffd2249f.png",
        "Badami Tikka": "/menu-images/tandoori_k_7092ccae.png",
        "Banjara Kabab": "/menu-images/tandoori_k_d6fd4e63.png",
        "Bhatti Chicken (Full)": "/menu-images/tandoori_k_fa127595.png",
        "Bhatti Chicken (Half)": "/menu-images/tandoori_k_3ac8b05c.png",
        "Biryani Mix Pack (Serves 4)": "/menu-images/ready_to_c_5f637694.png",
        "Boiled Egg": "/menu-images/egg_items_f2975048.png",
        "Butter Chicken (Full)": "/menu-images/indian_dis_aacb7959.png",
        "Butter Chicken (Half)": "/menu-images/indian_dis_60463376.png",
        "Butter Chicken Pack (Serves 4)": "/menu-images/ready_to_c_cfad9829.png",
        "Chatpata Kabab": "/menu-images/tandoori_k_86bd7b5e.png",
        "Chicken 65 (Boneless)": "/menu-images/starters_4d36df5c.png",
        "Chicken 65 Pack (500g)": "/menu-images/ready_to_c_498fd80c.png",
        "Chicken Afghani (Full)": "/menu-images/indian_dis_9a1b33ec.png",
        "Chicken Afghani (Half)": "/menu-images/indian_dis_31a8cf88.png",
        "Chicken Barbeque": "/menu-images/chinese_578d1760.png",
        "Chicken Biryani (Full)": "/menu-images/biryani_&__76f93e2c.png",
        "Chicken Biryani (Half)": "/menu-images/biryani_&__ebae3697.png",
        "Chicken Boneless (1 Kg)": "/menu-images/raw_meat_184e135f.png",
        "Chicken Breast (1 Kg)": "/menu-images/raw_meat_c12d7f9f.png",
        "Chicken Chilly": "/menu-images/chinese_f2516519.png",
        "Chicken Chilly (Boneless)": "/menu-images/chinese_c4e1cf87.png",
        "Chicken Do Pyaza (Full)": "/menu-images/indian_dis_70e98063.png",
        "Chicken Do Pyaza (Half)": "/menu-images/indian_dis_d22994c2.png",
        "Chicken Drum Stick": "/menu-images/chinese_7e7e398f.png",
        "Chicken Fried Rice": "/menu-images/biryani_&__e10550aa.png",
        "Chicken Golkunda (Full)": "/menu-images/indian_dis_51cc359d.png",
        "Chicken Golkunda (Half)": "/menu-images/indian_dis_f98a9a5d.png",
        "Chicken Gravy Pack (Serves 4)": "/menu-images/ready_to_c_89c8767e.png",
        "Chicken Honey Garlic (10 Pcs)": "/menu-images/chinese_64951b48.png",
        "Chicken Hundi (Full)": "/menu-images/indian_dis_6e090e9b.png",
        "Chicken Hundi (Half)": "/menu-images/indian_dis_b4a691d4.png",
        "Chicken Hyderabadi (Full)": "/menu-images/indian_dis_bd2620f4.png",
        "Chicken Hyderabadi (Half)": "/menu-images/indian_dis_7793672e.png",
        "Chicken Kabab (10 Pcs)": "/menu-images/starters_98eaa34e.png",
        "Chicken Kabab Boneless (10 Pcs)": "/menu-images/starters_f906d5ce.png",
        "Chicken Kabab Pack (12 Pcs)": "/menu-images/ready_to_c_ddd01a9c.png",
        "Chicken Kadai (Full)": "/menu-images/indian_dis_c0aee575.png",
        "Chicken Kadai (Half)": "/menu-images/indian_dis_0f1cff16.png",
        "Chicken Kolhapuri (Full)": "/menu-images/indian_dis_bf0a23b5.png",
        "Chicken Kolhapuri (Half)": "/menu-images/indian_dis_fe7aee02.png",
        "Chicken Leg Piece (1 Kg)": "/menu-images/raw_meat_1d58b512.png",
        "Chicken Liver (500g)": "/menu-images/raw_meat_f1953fca.png",
        "Chicken Lollipop (6 Pcs)": "/menu-images/starters_0a5976ef.png",
        "Chicken Maharaja (Full)": "/menu-images/indian_dis_9a14990b.png",
        "Chicken Maharaja (Half)": "/menu-images/indian_dis_3163a468.png",
        "Chicken Makhanwala (Full)": "/menu-images/indian_dis_cf4c6818.png",
        "Chicken Makhanwala (Half)": "/menu-images/indian_dis_ee0b08b7.png",
        "Chicken Malwani (Full)": "/menu-images/indian_dis_1889bd1e.png",
        "Chicken Malwani (Half)": "/menu-images/indian_dis_6926b439.png",
        "Chicken Manchow Soup": "/menu-images/extras_c0af7e4d.png",
        "Chicken Manchuri (Boneless)": "/menu-images/chinese_c24314c9.png",
        "Chicken Masala (Full)": "/menu-images/indian_dis_362b770d.png",
        "Chicken Masala (Half)": "/menu-images/indian_dis_f18a66b7.png",
        "Chicken Masala Pack (Serves 4)": "/menu-images/ready_to_c_81b0e607.png",
        "Chicken Mumtaz (Full)": "/menu-images/indian_dis_9502802d.png",
        "Chicken Mumtaz (Half)": "/menu-images/indian_dis_a8a992f8.png",
        "Chicken Nawabi (Full)": "/menu-images/indian_dis_552e29cc.png",
        "Chicken Nawabi (Half)": "/menu-images/indian_dis_7f0530f0.png",
        "Chicken Peshawari (Full)": "/menu-images/indian_dis_9754e377.png",
        "Chicken Peshawari (Half)": "/menu-images/indian_dis_21117d75.png",
        "Chicken Pondicherry (Full)": "/menu-images/indian_dis_6d858b09.png",
        "Chicken Pondicherry (Half)": "/menu-images/indian_dis_bf49dea9.png",
        "Chicken Rana (Full)": "/menu-images/indian_dis_22bdfe0e.png",
        "Chicken Rana (Half)": "/menu-images/indian_dis_292f920c.png",
        "Chicken Satay (Boneless)": "/menu-images/chinese_3082639c.png",
        "Chicken Shangal (10 Pcs)": "/menu-images/chinese_6f4df4ad.png",
        "Chicken Sizzler": "/menu-images/chinese_590ce9ed.png",
        "Chicken Sultani (Full)": "/menu-images/indian_dis_efeb5d0b.png",
        "Chicken Sultani (Half)": "/menu-images/indian_dis_31c84311.png",
        "Chicken Taj Special (Full)": "/menu-images/indian_dis_2f072602.png",
        "Chicken Taj Special (Half)": "/menu-images/indian_dis_dd493faf.png",
        "Chicken Tikka": "/menu-images/tandoori_k_19fe2ffd.png",
        "Chicken Tikka Kabab (Boneless)": "/menu-images/starters_0d1c3b2c.png",
        "Chicken Tikka Masala (Full)": "/menu-images/indian_dis_721f6481.png",
        "Chicken Tikka Masala (Half)": "/menu-images/indian_dis_cb3510ca.png",
        "Chicken Wings (1 Kg)": "/menu-images/raw_meat_0363467c.png",
        "Combo 1: Chicken Biryani + Chicken Kabab": "/menu-images/combo_88933108.png",
        "Combo 2: Egg Biryani + Chicken Kabab": "/menu-images/combo_f79d4f8a.png",
        "Combo 3: Jeera Rice + Chicken Masala": "/menu-images/combo_95ac9236.png",
        "Combo 4: Veg Biryani + Paneer Butter Masala": "/menu-images/combo_096590bf.png",
        "Combo 5: Family Pack - 2 Biryani + 2 Kabab": "/menu-images/combo_44d0cf51.png",
        "Dal Fry (Half)": "/menu-images/dal_c9fc9a81.png",
        "Dal Kolhapuri (Half)": "/menu-images/dal_9abc2389.png",
        "Dal Tadka (Half)": "/menu-images/dal_ef2affdc.png",
        "Egg Biryani": "/menu-images/biryani_&__a4e9f36c.png",
        "Egg Burji (Half)": "/menu-images/egg_items_1d9adade.png",
        "Egg Chilly (Half)": "/menu-images/egg_items_9aa25fef.png",
        "Egg Fried Rice": "/menu-images/biryani_&__46e41c4a.png",
        "Egg Hyderabadi (Half)": "/menu-images/egg_items_2bbfed17.png",
        "Egg Kolhapuri (Half)": "/menu-images/egg_items_c19d6011.png",
        "Egg Maharaja (Half)": "/menu-images/egg_items_c7089256.png",
        "Egg Makhanwala (Half)": "/menu-images/egg_items_94f6ddd7.png",
        "Egg Manchurian (Half)": "/menu-images/egg_items_06974aff.png",
        "Egg Masala (Half)": "/menu-images/egg_items_81d4b16e.png",
        "Egg Peshawari (Half)": "/menu-images/egg_items_c3ed6d10.png",
        "Egg Pondicherry (Half)": "/menu-images/egg_items_419b3a47.png",
        "Ghee Rice": "/menu-images/biryani_&__76f5a00d.png",
        "Gobi 65 (Half)": "/menu-images/veg_d5d30fee.png",
        "Gobi Chilly (Half)": "/menu-images/veg_02f440c6.png",
        "Gobi Manchuri (Half)": "/menu-images/veg_583b5427.png",
        "Gravy Hyderabadi (Half)": "/menu-images/gravy_aba252f5.png",
        "Gravy Kolhapuri (Half)": "/menu-images/gravy_130ec64a.png",
        "Gravy Maharaja (Half)": "/menu-images/gravy_92682fb6.png",
        "Gravy Makhanwala (Half)": "/menu-images/gravy_83e8a465.png",
        "Gravy Masala (Half)": "/menu-images/gravy_38a16757.png",
        "Gravy Peshawari (Half)": "/menu-images/gravy_9275935e.png",
        "Guntur Chilly (10 Pcs)": "/menu-images/chinese_10943e93.png",
        "Haryali Kabab": "/menu-images/tandoori_k_a028e637.png",
        "Kaju Hyderabadi (Half)": "/menu-images/gravy_96bad095.png",
        "Kaju Kadai (Half)": "/menu-images/gravy_449afd70.png",
        "Kaju Kolhapuri (Half)": "/menu-images/gravy_67071f08.png",
        "Kaju Masala (Half)": "/menu-images/gravy_d9539c32.png",
        "Korean Chicken Wings (10 Pcs)": "/menu-images/chinese_50af9389.png",
        "Kuska": "/menu-images/biryani_&__c7a01c73.png",
        "Lasuni Tikka": "/menu-images/tandoori_k_d2518051.png",
        "Leg Piece (2 Pc)": "/menu-images/tandoori_k_dd7ff0d2.png",
        "Leg Piece Single": "/menu-images/tandoori_k_4c109b95.png",
        "Malai Kabab Boneless": "/menu-images/tandoori_k_6942a71b.png",
        "Masala Papad": "/menu-images/extras_d28b63d6.png",
        "Murg Mussalam (Full)": "/menu-images/indian_dis_8fcec4fd.png",
        "Murg Mussalam (Half)": "/menu-images/indian_dis_7f613de4.png",
        "Mutton (1 Kg)": "/menu-images/raw_meat_1593410f.png",
        "Mutton Andhra (Full)": "/menu-images/indian_dis_506c0c8e.png",
        "Mutton Andhra (Half)": "/menu-images/indian_dis_2d35e2ec.png",
        "Mutton Biryani": "/menu-images/biryani_&__3ca30046.png",
        "Mutton Boneless (1 Kg)": "/menu-images/raw_meat_aa50548b.png",
        "Mutton Chilly (Full)": "/menu-images/indian_dis_cdd7e3d3.png",
        "Mutton Chilly (Half)": "/menu-images/indian_dis_24587fcc.png",
        "Mutton Hundi (Full)": "/menu-images/indian_dis_22b18083.png",
        "Mutton Hundi (Half)": "/menu-images/indian_dis_43ab11cc.png",
        "Mutton Hyderabadi (Full)": "/menu-images/indian_dis_be81ab9b.png",
        "Mutton Hyderabadi (Half)": "/menu-images/indian_dis_8fef2088.png",
        "Mutton Kadai (Full)": "/menu-images/indian_dis_d68f3265.png",
        "Mutton Kadai (Half)": "/menu-images/indian_dis_e18d9655.png",
        "Mutton Kolhapuri (Full)": "/menu-images/indian_dis_13c451a4.png",
        "Mutton Kolhapuri (Half)": "/menu-images/indian_dis_08e6435e.png",
        "Mutton Maharaja (Full)": "/menu-images/indian_dis_4205bcfe.png",
        "Mutton Maharaja (Half)": "/menu-images/indian_dis_b4d60cac.png",
        "Mutton Makhanwala (Full)": "/menu-images/indian_dis_79e977b9.png",
        "Mutton Makhanwala (Half)": "/menu-images/indian_dis_73704005.png",
        "Mutton Malwani (Full)": "/menu-images/indian_dis_d5afb3cb.png",
        "Mutton Malwani (Half)": "/menu-images/indian_dis_635543fc.png",
        "Mutton Masala (Full)": "/menu-images/indian_dis_ad660c44.png",
        "Mutton Masala (Half)": "/menu-images/indian_dis_1b51bd06.png",
        "Mutton Pepper Dry (Full)": "/menu-images/indian_dis_a67cb7fd.png",
        "Mutton Pepper Dry (Half)": "/menu-images/indian_dis_b8b71fc3.png",
        "Mutton Peshawari (Full)": "/menu-images/indian_dis_b12240b9.png",
        "Mutton Peshawari (Half)": "/menu-images/indian_dis_9d6b51eb.png",
        "Mutton Pondicherry (Full)": "/menu-images/indian_dis_fd9df595.png",
        "Mutton Pondicherry (Half)": "/menu-images/indian_dis_19181cc6.png",
        "Mutton Rana (Full)": "/menu-images/indian_dis_f0c7a320.png",
        "Mutton Rana (Half)": "/menu-images/indian_dis_4032511b.png",
        "Mutton Rogan Josh (Full)": "/menu-images/indian_dis_958ffddb.png",
        "Mutton Rogan Josh (Half)": "/menu-images/indian_dis_481bd90d.png",
        "Mutton Taj Special": "/menu-images/indian_dis_562d965d.png",
        "Omelette": "/menu-images/egg_items_03c111b7.png",
        "Paneer Biryani": "/menu-images/biryani_&__f99247cd.png",
        "Pepper Chicken (Boneless)": "/menu-images/starters_32cbec91.png",
        "Plain Papad": "/menu-images/extras_60b6c470.png",
        "Punjabi Chicken (Full)": "/menu-images/indian_dis_ff017cbc.png",
        "Punjabi Chicken (Half)": "/menu-images/indian_dis_4103a74a.png",
        "Reshmi Kabab": "/menu-images/tandoori_k_b2f81dc8.png",
        "Tandoori Chicken (Full)": "/menu-images/tandoori_k_fa5f5e89.png",
        "Tandoori Chicken (Half)": "/menu-images/tandoori_k_ce57b798.png",
        "Tandoori Chicken Pack (Full)": "/menu-images/ready_to_c_d5390d1d.png",
        "Tandoori Kabab (Full) 12 Pc": "/menu-images/tandoori_k_e70a7d07.png",
        "Tandoori Kabab (Half) 6 Pc": "/menu-images/tandoori_k_b079771b.png",
        "Veg Afghani (Half)": "/menu-images/veg_e45e64a0.png",
        "Veg Biryani": "/menu-images/biryani_&__a4894d55.png",
        "Veg Hyderabadi (Half)": "/menu-images/veg_cfba577a.png",
        "Veg Kadai (Half)": "/menu-images/veg_e4517635.png",
        "Veg Kolhapuri (Half)": "/menu-images/veg_c4724063.png",
        "Veg Malwani (Half)": "/menu-images/veg_e2b43b59.png",
        "Veg Manchow Soup": "/menu-images/extras_b12f747f.png",
        "Veg Masala (Half)": "/menu-images/veg_05a1de5b.png",
        "Veg Pondicherry (Half)": "/menu-images/veg_dc604fb0.png",
        "Veg Rana (Half)": "/menu-images/veg_bce33c59.png",
        "Whole Chicken (1 Pc)": "/menu-images/raw_meat_a9650280.png",
        "Zeera Rice": "/menu-images/biryani_&__c53d0b27.png",
    }

    item_docs = []
    now = datetime.now(timezone.utc).isoformat()
    for item in menu_items_raw:
        item_docs.append({
            "id": str(uuid.uuid4()),
            "name": item["name"],
            "description": item.get("description", f"Authentic {item['name']} - a house specialty"),
            "category_id": cat_ids[item["category"]],
            "base_price": item["price"],
            "is_vegetarian": item["vegetarian"],
            "is_available": True,
            "branch_ids": None,
            "image_url": image_map.get(item["name"]),
            "created_at": now
        })
    await db.menu_items.insert_many(item_docs)
    print(f"[AUTO-SEED] Created {len(item_docs)} menu items")

    # 4. Users (admin, customers, staff)
    users = [
        {"email": "admin@altaj.com", "password": "admin123", "name": "Admin Al Taj", "role": "admin", "phone": "+91-836-2245678"},
        {"email": "cust@altaj.com", "password": "cust123", "name": "Test Customer", "role": "customer", "phone": "+91-9876543210"},
        {"email": "rajesh@altaj.com", "password": "cust123", "name": "Rajesh Kumar", "role": "customer", "phone": "+91-9876543211"},
        {"email": "priya@altaj.com", "password": "cust123", "name": "Priya Sharma", "role": "customer", "phone": "+91-9876543212"},
        # Branch 1 staff
        {"email": "kitchen@altaj.com", "password": "kit123", "name": "Test Kitchen", "role": "kitchen_staff", "phone": "+91-836-0000001", "branch_id": branch_ids[0]},
        {"email": "waiter@altaj.com", "password": "wait123", "name": "Test Waiter", "role": "waiter", "phone": "+91-836-0000001", "branch_id": branch_ids[0]},
        {"email": "del@altaj.com", "password": "del123", "name": "Test Delivery", "role": "delivery_partner", "phone": "+91-836-0000001", "branch_id": branch_ids[0]},
        # Managers
        {"email": "mgr1@altaj.com", "password": "mgr123", "name": "Manager - Old Hubli", "role": "branch_manager", "phone": "+91-836-000-0001", "branch_id": branch_ids[0]},
        {"email": "mgr2@altaj.com", "password": "mgr123", "name": "Manager - Shirur Park", "role": "branch_manager", "phone": "+91-836-100-0001", "branch_id": branch_ids[1]},
        # Kitchen staff per branch
        {"email": "k1b1@altaj.com", "password": "kit123", "name": "Chef 1 - Branch 1", "role": "kitchen_staff", "phone": "+91-836-011-0001", "branch_id": branch_ids[0]},
        {"email": "k1b2@altaj.com", "password": "kit123", "name": "Chef 1 - Branch 2", "role": "kitchen_staff", "phone": "+91-836-111-0001", "branch_id": branch_ids[1]},
        # Waiters per branch
        {"email": "w1b1@altaj.com", "password": "wait123", "name": "Waiter 1 - Branch 1", "role": "waiter", "phone": "+91-836-001-0001", "branch_id": branch_ids[0]},
        {"email": "w2b1@altaj.com", "password": "wait123", "name": "Waiter 2 - Branch 1", "role": "waiter", "phone": "+91-836-002-0001", "branch_id": branch_ids[0]},
        {"email": "w1b2@altaj.com", "password": "wait123", "name": "Waiter 1 - Branch 2", "role": "waiter", "phone": "+91-836-101-0001", "branch_id": branch_ids[1]},
        {"email": "w2b2@altaj.com", "password": "wait123", "name": "Waiter 2 - Branch 2", "role": "waiter", "phone": "+91-836-102-0001", "branch_id": branch_ids[1]},
        # Delivery per branch
        {"email": "d1b1@altaj.com", "password": "del123", "name": "Delivery 1 - Branch 1", "role": "delivery_partner", "phone": "+91-836-021-0001", "branch_id": branch_ids[0]},
        {"email": "d2b1@altaj.com", "password": "del123", "name": "Delivery 2 - Branch 1", "role": "delivery_partner", "phone": "+91-836-022-0001", "branch_id": branch_ids[0]},
        {"email": "d1b2@altaj.com", "password": "del123", "name": "Delivery 1 - Branch 2", "role": "delivery_partner", "phone": "+91-836-121-0001", "branch_id": branch_ids[1]},
        {"email": "d2b2@altaj.com", "password": "del123", "name": "Delivery 2 - Branch 2", "role": "delivery_partner", "phone": "+91-836-122-0001", "branch_id": branch_ids[1]},
    ]

    user_docs = []
    delivery_user_ids = {}
    for u in users:
        uid = str(uuid.uuid4())
        doc = {
            "id": uid,
            "email": u["email"],
            "hashed_password": pwd_context.hash(u["password"]),
            "name": u["name"],
            "role": u["role"],
            "phone": u.get("phone", ""),
            "is_active": True,
            "created_at": now,
        }
        if "branch_id" in u:
            doc["branch_id"] = u["branch_id"]
        user_docs.append(doc)
        if u["role"] == "delivery_partner":
            delivery_user_ids[u["email"]] = (uid, u.get("branch_id"))

    await db.users.insert_many(user_docs)
    print(f"[AUTO-SEED] Created {len(user_docs)} users")

    # 5. Delivery partner profiles
    dp_docs = []
    for email, (uid, bid) in delivery_user_ids.items():
        if bid:
            dp_docs.append({
                "id": str(uuid.uuid4()),
                "user_id": uid,
                "branch_id": bid,
                "vehicle_type": "bike",
                "vehicle_number": f"KA-25-{uid[:4]}",
                "is_available": True,
                "created_at": now
            })
    if dp_docs:
        await db.delivery_partners.insert_many(dp_docs)
        print(f"[AUTO-SEED] Created {len(dp_docs)} delivery partner profiles")

    # 6. Tables (10 per branch)
    table_docs = []
    for bid in branch_ids:
        for t in range(1, 11):
            table_docs.append({
                "id": str(uuid.uuid4()),
                "branch_id": bid,
                "table_number": f"T{t:02d}",
                "capacity": 4 if t <= 6 else 6,
                "location": "Main Hall" if t <= 5 else "Window Side",
                "status": "available",
                "created_at": now
            })
    await db.tables.insert_many(table_docs)
    print(f"[AUTO-SEED] Created {len(table_docs)} tables")

    # 7. Sample coupons
    now_dt = datetime.now(timezone.utc)
    coupons = [
        {
            "id": str(uuid.uuid4()),
            "code": "WELCOME20",
            "description": "Welcome offer - 20% off on first order",
            "discount_type": "percentage",
            "value": 20,
            "min_order_value": 300,
            "max_discount": 200,
            "valid_from": now_dt.isoformat(),
            "valid_until": (now_dt + timedelta(days=90)).isoformat(),
            "usage_limit": 1000,
            "used_count": 0,
            "is_active": True,
            "created_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "code": "FLAT100",
            "description": "Flat Rs.100 off on orders above Rs.500",
            "discount_type": "fixed",
            "value": 100,
            "min_order_value": 500,
            "max_discount": 100,
            "valid_from": now_dt.isoformat(),
            "valid_until": (now_dt + timedelta(days=90)).isoformat(),
            "usage_limit": 500,
            "used_count": 0,
            "is_active": True,
            "created_at": now
        }
    ]
    await db.coupons.insert_many(coupons)
    print(f"[AUTO-SEED] Created {len(coupons)} coupons")

    print("[AUTO-SEED] Database seeding complete!")
    return True
