"""Generate custom AI food images for combo menu items using Gemini Nano Banana"""
import asyncio
import os
import base64
import sys
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load env from backend
load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "al_taj_restaurant")
IMAGE_DIR = "/app/frontend/public/menu-images"

# Combo items and their prompts
COMBO_PROMPTS = {
    "Combo 1: Chicken Biryani + Chicken Kabab": 
        "Professional food photography of an Indian restaurant combo meal: a steaming plate of aromatic chicken biryani with saffron rice alongside golden grilled chicken kababs, garnished with fresh mint and lemon wedges, on a premium dark plate, warm restaurant lighting, top-down angle",
    "Combo 2: Egg Biryani + Chicken Kabab": 
        "Professional food photography of an Indian combo meal: fragrant egg biryani with boiled eggs and spiced rice, paired with crispy chicken kababs on a skewer, garnished with fried onions and cilantro, elegant dark plate, warm lighting, top-down angle",
    "Combo 3: Jeera Rice + Chicken Masala": 
        "Professional food photography of an Indian combo meal: fluffy jeera (cumin) rice in a brass bowl alongside rich red chicken masala curry in a traditional handi pot, garnished with fresh coriander, warm restaurant ambiance, premium plating",
    "Combo 4: Veg Biryani + Paneer Butter Masala": 
        "Professional food photography of a vegetarian Indian combo meal: colorful vegetable biryani with mixed veggies and saffron rice alongside creamy paneer butter masala in an orange tomato gravy, garnished with cream swirl and cilantro, premium restaurant plating",
    "Combo 5: Family Pack - 2 Biryani + 2 Kabab": 
        "Professional food photography of a large Indian family feast spread: two generous portions of chicken biryani in brass handis, two plates of assorted grilled kababs, raita, and salad, arranged beautifully on a wooden table, warm overhead lighting, inviting restaurant setting",
}


async def generate_combo_images():
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not found in environment")
        sys.exit(1)

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # Get combo category
    combo_cat = await db.menu_categories.find_one(
        {"name": {"$regex": "combo", "$options": "i"}}, {"_id": 0}
    )
    if not combo_cat:
        print("ERROR: Combo category not found")
        return

    # Get combo items
    combo_items = await db.menu_items.find(
        {"category_id": combo_cat["id"]}, {"_id": 0}
    ).to_list(10)

    print(f"Found {len(combo_items)} combo items")

    for item in combo_items:
        prompt = COMBO_PROMPTS.get(item["name"])
        if not prompt:
            print(f"No prompt for: {item['name']}, skipping")
            continue

        print(f"\nGenerating image for: {item['name']}...")
        
        try:
            chat = LlmChat(
                api_key=api_key,
                session_id=f"combo-img-{item['id']}",
                system_message="You are a professional food photographer creating menu images for Al Taj Restaurant."
            )
            chat.with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])

            msg = UserMessage(text=prompt)
            text, images = await chat.send_message_multimodal_response(msg)

            if images and len(images) > 0:
                img_data = images[0]
                image_bytes = base64.b64decode(img_data["data"])
                
                # Save to public directory
                filename = f"combo_{item['id'][:8]}.png"
                filepath = os.path.join(IMAGE_DIR, filename)
                with open(filepath, "wb") as f:
                    f.write(image_bytes)
                
                # Update DB with relative URL
                image_url = f"/menu-images/{filename}"
                await db.menu_items.update_one(
                    {"id": item["id"]},
                    {"$set": {"image_url": image_url}}
                )
                
                print(f"  Saved: {filename} ({len(image_bytes)} bytes)")
                print(f"  Text response: {text[:100] if text else 'None'}...")
            else:
                print(f"  No image generated for {item['name']}")

        except Exception as e:
            print(f"  ERROR generating image for {item['name']}: {e}")

    client.close()
    print("\nDone! All combo images generated.")


if __name__ == "__main__":
    asyncio.run(generate_combo_images())
