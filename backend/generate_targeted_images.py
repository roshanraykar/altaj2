"""Generate AI food images for specific categories + fix veg items with egg issue"""
import asyncio
import os
import base64
import sys
import time
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv("/app/backend/.env")
from emergentintegrations.llm.chat import LlmChat, UserMessage

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "al_taj_restaurant")
IMAGE_DIR = "/app/frontend/public/menu-images"

# Category-specific prompts (detailed and accurate)
CATEGORY_PROMPTS = {
    "gravy": "rich Indian {name}, thick aromatic curry gravy with visible spices, cream swirl on top, served in a traditional Indian copper handi, dark moody restaurant background, warm lighting, top-down food photography",
    "dal": "Indian {name} lentil dish, perfectly tempered with cumin seeds and ghee tadka, garnished with fresh coriander leaves and a pat of butter, served in a copper bowl, dark restaurant background, warm lighting, professional food photography",
    "extras": None,  # Will be per-item
    "raw meat": "fresh raw {name}, clean presentation on a dark wooden cutting board, professional butcher shop style, garnished with fresh herbs rosemary thyme, sprinkle of rock salt and black pepper, dark background, studio lighting, food photography",
    "ready to cook": "marinated {name}, colorful spice-coated meat pieces ready to cook, arranged beautifully on a dark tray with scattered spices and herbs around, pre-preparation style, dark background, warm studio lighting, food photography",
}

# Specific prompts for items that need special attention
ITEM_SPECIFIC_PROMPTS = {
    "Plain Papad": "crispy golden roasted papad (Indian lentil crackers), thin round wafer, slightly bubbled and crispy texture, served on a small plate, dark background, warm lighting, professional food photography",
    "Masala Papad": "masala papad - crispy Indian lentil cracker topped with chopped onions, tomatoes, green chili, coriander and chaat masala, colorful topping on crisp wafer, served on a plate, dark background, food photography",
    "Veg Manchow Soup": "hot steaming bowl of Veg Manchow Soup, dark brown vegetable broth with julienned vegetables, topped with crispy fried noodles, served in a white ceramic bowl, dark background, warm lighting, food photography",
    "Chicken Manchow Soup": "hot steaming bowl of Chicken Manchow Soup, dark aromatic broth with shredded chicken and vegetables, topped with crispy fried noodles, served in a white ceramic bowl, dark background, warm lighting, food photography",
    # Fix veg items - NO eggs
    "Veg Biryani": "fragrant vegetarian biryani rice, layered with colorful mixed vegetables carrots peas beans, saffron-infused basmati rice, fried onions, fresh mint and coriander on top, NO egg, purely vegetarian, served in a traditional brass handi with raita on the side, dark background, warm lighting, professional food photography",
    "Paneer Biryani": "aromatic paneer biryani, layered basmati rice with golden paneer cubes, saffron strands, fried onions, fresh mint and coriander, NO egg, purely vegetarian, served in a traditional brass handi with raita, dark background, warm lighting, professional food photography",
    "Ghee Rice": "fragrant ghee rice, fluffy basmati rice glistening with pure ghee, tempered with whole spices like cardamom cloves cinnamon bay leaf, garnished with fried cashews and raisins, NO egg, purely vegetarian, served in a brass bowl, dark background, warm lighting, professional food photography",
    "Zeera Rice": "aromatic jeera rice (cumin rice), fluffy basmati rice tempered with cumin seeds in ghee, light and fragrant, garnished with fresh coriander, NO egg, purely vegetarian, served in a copper bowl, dark background, warm lighting, professional food photography",
}


def get_prompt(item_name, category_name):
    # Check item-specific first
    if item_name in ITEM_SPECIFIC_PROMPTS:
        return ITEM_SPECIFIC_PROMPTS[item_name]
    
    cat_lower = category_name.lower()
    for key, template in CATEGORY_PROMPTS.items():
        if key in cat_lower and template:
            return template.format(name=item_name)
    
    return f"Professional food photography of {item_name}, Indian restaurant style, premium plating, dark background, warm restaurant lighting, high quality menu photo"


async def main():
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not found")
        sys.exit(1)

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    categories = await db.menu_categories.find({}, {"_id": 0}).to_list(100)
    cat_map = {c["id"]: c["name"] for c in categories}
    cat_name_to_id = {c["name"].lower(): c["id"] for c in categories}

    # Collect target items
    target_items = []

    # 1. Items from target categories (stock images)
    target_cat_names = ["gravy", "dal", "extras", "raw meat", "ready to cook"]
    for cat_name_lower in target_cat_names:
        cat_id = cat_name_to_id.get(cat_name_lower)
        if not cat_id:
            print(f"WARNING: Category '{cat_name_lower}' not found")
            continue
        items = await db.menu_items.find({"category_id": cat_id}, {"_id": 0}).to_list(100)
        for item in items:
            target_items.append(item)

    # 2. Veg items with egg issue (need regeneration)
    veg_fix_names = ["Veg Biryani", "Paneer Biryani", "Ghee Rice", "Zeera Rice"]
    for name in veg_fix_names:
        item = await db.menu_items.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}}, {"_id": 0})
        if item:
            # Avoid duplicates
            if not any(t["id"] == item["id"] for t in target_items):
                target_items.append(item)

    print(f"Total items to generate: {len(target_items)}")
    for item in target_items:
        cat_name = cat_map.get(item["category_id"], "Unknown")
        print(f"  - [{cat_name}] {item['name']}")
    
    print(f"\n{'='*60}")
    
    success = 0
    failed = 0
    total = len(target_items)
    
    for idx, item in enumerate(target_items):
        cat_name = cat_map.get(item["category_id"], "Unknown")
        cat_prefix = cat_name.lower().replace(" ", "_").replace("-", "_")[:10]
        prompt = get_prompt(item["name"], cat_name)
        
        print(f"\n[{idx+1}/{total}] {cat_name} > {item['name']}")
        print(f"  Prompt: {prompt[:100]}...")
        
        retry_count = 0
        max_retries = 3
        
        while retry_count <= max_retries:
            try:
                chat = LlmChat(
                    api_key=api_key,
                    session_id=f"fix-{item['id'][:12]}-{retry_count}",
                    system_message="You are a professional food photographer. Generate a realistic, appetizing food photo for a premium Indian restaurant menu. The image must be photorealistic and accurate to the dish described."
                )
                chat.with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])

                msg = UserMessage(text=prompt)
                text, images = await chat.send_message_multimodal_response(msg)

                if images and len(images) > 0:
                    image_bytes = base64.b64decode(images[0]["data"])
                    filename = f"{cat_prefix}_{item['id'][:8]}.png"
                    filepath = os.path.join(IMAGE_DIR, filename)
                    with open(filepath, "wb") as f:
                        f.write(image_bytes)

                    image_url = f"/menu-images/{filename}"
                    await db.menu_items.update_one(
                        {"id": item["id"]},
                        {"$set": {"image_url": image_url}}
                    )
                    print(f"  OK: {filename} ({len(image_bytes)//1024}KB)")
                    success += 1
                    break
                else:
                    print(f"  WARN: No image returned, retry {retry_count+1}")
                    retry_count += 1

            except Exception as e:
                error_msg = str(e)
                if "Budget has been exceeded" in error_msg or "budget" in error_msg.lower():
                    wait = 30 * (retry_count + 1)
                    print(f"  BUDGET LIMIT - waiting {wait}s...")
                    await asyncio.sleep(wait)
                    retry_count += 1
                elif "429" in error_msg or "rate" in error_msg.lower():
                    wait = 15 * (retry_count + 1)
                    print(f"  RATE LIMIT - waiting {wait}s...")
                    await asyncio.sleep(wait)
                    retry_count += 1
                else:
                    print(f"  ERROR: {error_msg[:150]}")
                    retry_count += 1
        
        if retry_count > max_retries:
            print(f"  FAILED after {max_retries} retries")
            failed += 1
        
        # Small delay between requests
        await asyncio.sleep(2)
    
    client.close()
    print(f"\n{'='*60}")
    print(f"DONE! Success: {success}, Failed: {failed}, Total: {total}")


if __name__ == "__main__":
    asyncio.run(main())
