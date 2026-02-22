"""Generate AI food images for ALL remaining menu items using Gemini Nano Banana"""
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

# Category-specific style hints
CATEGORY_STYLES = {
    "tandoori": "tandoori clay oven grilled, charred edges, smoky, served on a sizzling plate with mint chutney and onion rings",
    "starters": "crispy fried appetizer, golden brown, served as a starter with dipping sauce on an elegant plate",
    "indian dishes - chicken": "rich Indian chicken curry, aromatic spices, served in a traditional handi or kadai, garnished with coriander and cream",
    "indian dishes - mutton": "slow-cooked mutton curry, tender pieces in rich gravy, traditional Indian style in a heavy-bottom pot, garnished with fresh herbs",
    "biryani": "fragrant layered biryani rice dish with saffron, fried onions, boiled egg, raita on the side, served in a brass handi",
    "egg": "Indian egg dish, spiced and flavorful, traditional preparation with curry leaves and spices",
    "veg": "colorful vegetarian Indian dish, fresh vegetables, rich gravy or dry preparation, garnished with coriander",
    "gravy": "rich Indian curry gravy, thick and aromatic, traditional restaurant style with cream swirl on top",
    "dal": "Indian lentil dal, tempered with cumin and ghee, garnished with coriander and a dollop of butter, served in a copper bowl",
    "extras": "Indian restaurant side dish or accompaniment, neatly presented",
    "raw meat": "fresh raw meat cuts, clean butcher shop presentation, on a wooden cutting board with herbs and spices around",
    "ready to cook": "marinated meat ready to cook, colorful spice coating, arranged on a tray with garnishes, pre-preparation style",
}


def get_prompt_for_item(item_name, category_name):
    """Generate a specific prompt based on item name and category"""
    cat_lower = category_name.lower()
    style = ""
    for key, val in CATEGORY_STYLES.items():
        if key in cat_lower:
            style = val
            break
    
    if not style:
        style = "Indian restaurant style, premium plating, warm lighting"
    
    return f"Professional food photography of {item_name}, {style}, dark background, warm restaurant lighting, top-down or 45-degree angle, high quality menu photo"


async def generate_all_remaining():
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not found")
        sys.exit(1)

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # Get all categories
    categories = await db.menu_categories.find({}, {"_id": 0}).to_list(100)
    cat_map = {c["id"]: c["name"] for c in categories}

    # Get items that still have stock URLs (not /menu-images/)
    all_items = await db.menu_items.find({}, {"_id": 0}).to_list(1000)
    remaining = [i for i in all_items if not i.get("image_url", "").startswith("/menu-images/")]
    
    print(f"Total items: {len(all_items)}")
    print(f"Already have AI images: {len(all_items) - len(remaining)}")
    print(f"Remaining to generate: {len(remaining)}")
    
    # Group by category for logging
    by_cat = {}
    for item in remaining:
        cat_name = cat_map.get(item["category_id"], "Unknown")
        by_cat.setdefault(cat_name, []).append(item)
    
    for cat_name, items in by_cat.items():
        print(f"  {cat_name}: {len(items)} items")
    
    print("\n" + "="*60)
    
    success = 0
    failed = 0
    total = len(remaining)
    
    for idx, item in enumerate(remaining):
        cat_name = cat_map.get(item["category_id"], "Unknown")
        cat_prefix = cat_name.lower().replace(" ", "_").replace("-", "_")[:10]
        prompt = get_prompt_for_item(item["name"], cat_name)
        
        print(f"\n[{idx+1}/{total}] {cat_name} > {item['name']}")
        
        retry_count = 0
        max_retries = 2
        
        while retry_count <= max_retries:
            try:
                chat = LlmChat(
                    api_key=api_key,
                    session_id=f"gen-{item['id'][:12]}-{retry_count}",
                    system_message="You are a professional food photographer creating menu images for Al Taj Restaurant, a premium Indian restaurant."
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
                if "Budget has been exceeded" in error_msg:
                    print(f"  BUDGET EXCEEDED - waiting 30s then retrying...")
                    await asyncio.sleep(30)
                    retry_count += 1
                else:
                    print(f"  ERROR: {error_msg[:100]}")
                    retry_count += 1
        
        if retry_count > max_retries:
            print(f"  FAILED after {max_retries} retries")
            failed += 1
    
    client.close()
    print(f"\n{'='*60}")
    print(f"DONE! Success: {success}, Failed: {failed}, Total: {total}")
    print(f"AI images now: {success + (len(all_items) - total)}/{len(all_items)}")


if __name__ == "__main__":
    asyncio.run(generate_all_remaining())
