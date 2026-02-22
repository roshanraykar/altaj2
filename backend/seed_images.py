"""Seed menu items with food images by category"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "altaj_restaurant")

# Image URLs mapped by category name patterns
CATEGORY_IMAGES = {
    "combo": [
        "https://images.pexels.com/photos/25440306/pexels-photo-25440306.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/17223838/pexels-photo-17223838.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "chinese": [
        "https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/34170982/pexels-photo-34170982.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "tandoori": [
        "https://images.pexels.com/photos/30749027/pexels-photo-30749027.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/29173119/pexels-photo-29173119.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "starters": [
        "https://images.pexels.com/photos/20535805/pexels-photo-20535805.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/29631422/pexels-photo-29631422.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "indian dishes - chicken": [
        "https://images.unsplash.com/photo-1716535232842-d10da4eb33d5?w=600",
        "https://images.unsplash.com/photo-1728542575492-47e02eb3305c?w=600",
        "https://images.unsplash.com/photo-1640542509430-f529fdfce835?w=600",
        "https://images.unsplash.com/photo-1586981114766-708f09a71e20?w=600",
    ],
    "indian dishes - mutton": [
        "https://images.pexels.com/photos/35287423/pexels-photo-35287423.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/34217294/pexels-photo-34217294.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "biryani": [
        "https://images.pexels.com/photos/29631417/pexels-photo-29631417.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/10219670/pexels-photo-10219670.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "egg": [
        "https://images.pexels.com/photos/34217294/pexels-photo-34217294.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/8625813/pexels-photo-8625813.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "veg": [
        "https://images.pexels.com/photos/35993886/pexels-photo-35993886.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/11188417/pexels-photo-11188417.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/35071824/pexels-photo-35071824.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "gravy": [
        "https://images.unsplash.com/photo-1716535232842-d10da4eb33d5?w=600",
        "https://images.unsplash.com/photo-1728542575492-47e02eb3305c?w=600",
    ],
    "dal": [
        "https://images.pexels.com/photos/30203314/pexels-photo-30203314.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/28674561/pexels-photo-28674561.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "extras": [
        "https://images.pexels.com/photos/34347890/pexels-photo-34347890.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/35375003/pexels-photo-35375003.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "raw meat": [
        "https://images.pexels.com/photos/8251004/pexels-photo-8251004.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/13524831/pexels-photo-13524831.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    "ready to cook": [
        "https://images.pexels.com/photos/23876843/pexels-photo-23876843.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/144432/pexels-photo-144432.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.unsplash.com/photo-1627799370307-9b2a689bb94f?w=600",
    ],
}


def get_image_for_category(category_name, index):
    """Match category name to image list and rotate through images"""
    name_lower = category_name.lower()
    for key, images in CATEGORY_IMAGES.items():
        if key in name_lower:
            return images[index % len(images)]
    # Fallback
    return "https://images.pexels.com/photos/29631417/pexels-photo-29631417.jpeg?auto=compress&cs=tinysrgb&w=600"


async def seed_images():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # Get all categories
    categories = await db.menu_categories.find({}, {"_id": 0}).to_list(100)
    cat_map = {c["id"]: c["name"] for c in categories}

    # Get all menu items
    items = await db.menu_items.find({}, {"_id": 0, "id": 1, "name": 1, "category_id": 1, "image_url": 1}).to_list(1000)

    updated = 0
    for item in items:
        cat_name = cat_map.get(item["category_id"], "")
        # Get rotating image based on item index within its category
        cat_items = [i for i in items if i["category_id"] == item["category_id"]]
        idx = cat_items.index(item)
        image_url = get_image_for_category(cat_name, idx)

        await db.menu_items.update_one(
            {"id": item["id"]},
            {"$set": {"image_url": image_url}}
        )
        updated += 1

    print(f"Updated {updated} menu items with images")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_images())
