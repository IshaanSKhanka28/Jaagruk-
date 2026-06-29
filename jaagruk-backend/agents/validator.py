import os
import json
import base64
import asyncio
import requests
from google import genai
from google.genai import types

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options={"api_version": "v1"}
)

PROMPT = """You are a civic issue validator for Jaagruk.
Analyze this image. Does it show a genuine public 
infrastructure problem?

ACCEPT: potholes, broken roads, water leakage, flooding,
broken streetlights, garbage dumps, damaged footpaths,
open manholes, fallen trees blocking roads.

REJECT: selfies, food, indoor photos, animals, memes,
blank or blurry images, unrelated content.

Respond ONLY with valid JSON, no markdown:
{
  "valid": boolean,
  "reason": "one sentence",
  "confidence": float 0.0 to 1.0,
  "detected_elements": ["list", "of", "things", "seen"]
}"""

async def validate_issue(image_url: str, description: str = "") -> dict:
    image_bytes = requests.get(image_url, timeout=15).content
    return await run_validator(image_bytes, description)

async def run_validator(image_bytes: bytes, description: str = "") -> dict:
    try:
        print(f"🔍 Running validator with gemini-1.5-flash")
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=[
                        types.Part.from_bytes(
                            data=image_bytes,
                            mime_type="image/jpeg"
                        ),
                        types.Part.from_text(text=PROMPT)
                    ]
                )
                text = response.text.strip().replace("```json","").replace("```","").strip()
                result = json.loads(text)
                print(f"✅ Validator result: {result}")
                return result
            except Exception as e:
                if "503" in str(e) or "UNAVAILABLE" in str(e):
                    if attempt < 2:
                        print(f"⏳ Gemini busy, retry {attempt+1}/3...")
                        await asyncio.sleep(5)
                        continue
                raise e
    except Exception as e:
        print(f"❌ Validator error: {e}")
        return {
            "valid": False,
            "reason": f"Error: {str(e)}",
            "confidence": 0.0,
            "detected_elements": []
        }