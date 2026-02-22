"""Generate custom AI food images for Chinese Thrillers menu items using Gemini Nano Banana"""
import asyncio
import os
import base64
import sys
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "al_taj_restaurant")
IMAGE_DIR = "/app/frontend/public/menu-images"

CHINESE_PROMPTS = {
    "Chicken Manchuri (Boneless)":
        "Professional food photography of Indo-Chinese chicken manchurian dry boneless, golden fried chicken pieces tossed in spicy manchurian sauce with bell peppers and spring onions, served on a white plate, dark background, warm restaurant lighting",
    "Chicken Chilly":
        "Professional food photography of spicy Indo-Chinese chicken chilli with bone pieces, tossed with green chillies, onions and bell peppers in a spicy red sauce, served in a black bowl, dramatic lighting",
    "Chicken Chilly (Boneless)":
        "Professional food photography of boneless chicken chilli Indo-Chinese style, crispy chicken cubes in tangy chilli sauce with capsicum and onion strips, garnished with spring onions, elegant plating on dark plate",
    "Chicken Satay (Boneless)":
        "Professional food photography of chicken satay skewers, golden grilled boneless chicken pieces on bamboo skewers with peanut dipping sauce, garnished with cucumber and lime, Southeast Asian style presentation",
    "Chicken Drum Stick":
        "Professional food photography of crispy fried chicken drumsticks Indo-Chinese style, golden brown with spicy glaze, served with green chutney and lemon wedges on a rustic plate, warm lighting",
    "Chicken Sizzler":
        "Professional food photography of a sizzling chicken platter, grilled chicken pieces on a hot iron plate with sauteed vegetables, noodles and sauces, steam rising, dramatic restaurant presentation",
    "Chicken Barbeque":
        "Professional food photography of Indian style chicken barbeque, chargrilled chicken pieces with smoky flavor, red spice coating, served with onion rings and mint chutney on a wooden board",
    "Chicken Honey Garlic (10 Pcs)":
        "Professional food photography of honey garlic chicken pieces, glossy caramelized chicken bites coated in sweet honey garlic sauce, garnished with sesame seeds and spring onions, served on a dark plate",
    "Chicken Shangal (10 Pcs)":
        "Professional food photography of chicken shangal - crispy spiced chicken fritters, golden brown deep-fried chicken pieces with a crunchy coating, served with spicy red sauce on the side, elegant presentation",
    "Korean Chicken Wings (10 Pcs)":
        "Professional food photography of Korean style fried chicken wings, crispy double-fried wings coated in gochujang sauce, garnished with sesame seeds and sliced green onions, served in a stylish bowl",
    "Guntur Chilly (10 Pcs)":
        "Professional food photography of Guntur chilli chicken, fiery red spicy chicken pieces tossed with dried red chillies and curry leaves, Andhra style, served on a dark plate with dramatic lighting",
}


async def generate_chinese_images():
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not found")
        sys.exit(1)

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    chinese_cat = await db.menu_categories.find_one(
        {"name": {"$regex": "chinese", "$options": "i"}}, {"_id": 0}
    )
    if not chinese_cat:
        print("ERROR: Chinese Thrillers category not found")
        return

    items = await db.menu_items.find(
        {"category_id": chinese_cat["id"]}, {"_id": 0}
    ).to_list(20)

    print(f"Found {len(items)} Chinese Thrillers items")

    for item in items:
        prompt = CHINESE_PROMPTS.get(item["name"])
        if not prompt:
            print(f"No prompt for: {item['name']}, skipping")
            continue

        print(f"\nGenerating image for: {item['name']}...")

        try:
            chat = LlmChat(
                api_key=api_key,
                session_id=f"chinese-img-{item['id']}",
                system_message="You are a professional food photographer creating menu images for Al Taj Restaurant, an Indian restaurant."
            )
            chat.with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])

            msg = UserMessage(text=prompt)
            text, images = await chat.send_message_multimodal_response(msg)

            if images and len(images) > 0:
                image_bytes = base64.b64decode(images[0]["data"])
                filename = f"chinese_{item['id'][:8]}.png"
                filepath = os.path.join(IMAGE_DIR, filename)
                with open(filepath, "wb") as f:
                    f.write(image_bytes)

                image_url = f"/menu-images/{filename}"
                await db.menu_items.update_one(
                    {"id": item["id"]},
                    {"$set": {"image_url": image_url}}
                )
                print(f"  Saved: {filename} ({len(image_bytes)} bytes)")
            else:
                print(f"  No image generated")

        except Exception as e:
            print(f"  ERROR: {e}")

    client.close()
    print("\nDone! All Chinese Thrillers images generated.")


if __name__ == "__main__":
    asyncio.run(generate_chinese_images())
