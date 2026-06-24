import os
import json
import base64
import requests
import asyncio
from google import genai
from google.genai import types
from PIL import Image
import io

# Initialize genai client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def validate_issue(image_url: str, description: str = "") -> dict:
    """Validator Agent: Downloads image, encodes it to base64, and verifies it with Gemini 1.5 Flash."""
    print(f"🔍 Validating image: {image_url}")
    
    fallback = {
        "valid": False,
        "reason": "Validation unavailable",
        "confidence": 0.0,
        "detected_elements": []
    }
    
    try:
        # 1. Download image from image_url using requests
        def download_image():
            response = requests.get(image_url, timeout=15)
            response.raise_for_status()
            mime_type = response.headers.get("Content-Type", "image/jpeg")
            return response.content, mime_type
            
        img_bytes, mime_type = await asyncio.to_thread(download_image)
        
        # 2. Convert to base64
        base64_data = base64.b64encode(img_bytes).decode("utf-8")
        
        # 3. Send to Gemini
        prompt = f"""You are a civic issue validator for Jaagruk, an Indian civic reporting platform. Analyze this image and determine if it shows a genuine public infrastructure problem.

Citizen's description: {description or 'None provided'}

ACCEPT (valid=true):
- Potholes, damaged roads, road cracks
- Water leakage, pipe bursts, waterlogging, flooding
- Broken or non-functioning streetlights
- Illegal garbage dumps, overflowing bins
- Damaged footpaths, broken pavements
- Open manholes, uncovered drains
- Fallen trees blocking roads
- Broken public property, damaged benches/signs

REJECT (valid=false):
- Selfies or people photos
- Food, indoor scenes, animals
- Screenshots, memes, text images
- Nature photos with no infrastructure
- Blank, blurry, or unrelated images
- Vehicles without any infrastructure issue

Respond ONLY with valid JSON, no markdown, no explanation:
{{
  "valid": boolean,
  "reason": "one clear sentence",
  "confidence": float between 0.0 and 1.0,
  "detected_elements": ["list", "of", "things", "visible"]
}}"""

        contents = [
            types.Part.from_bytes(
                data=img_bytes,
                mime_type=mime_type
            ),
            types.Part.from_text(text=prompt)
        ]
        
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        # 4. Parse Gemini JSON response
        result = json.loads(response.text.strip())
        print(f"✅ Validation result: {result}")
        return result
    except Exception as e:
        print(f"❌ Validation failed with error: {e}")
        return fallback

# Keep run_validator for compatibility
async def run_validator(image_bytes: bytes, description: str) -> dict:
    """Runs the validator agent with raw image bytes."""
    try:
        from google import genai
        from google.genai import types
        import json
        import os
        
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        
        prompt = f"""You are a civic issue validator for Jaagruk.
Analyze this image. Does it show a genuine public 
infrastructure problem?

Description: {description or 'None'}

ACCEPT: potholes, broken roads, water leakage, flooding,
broken streetlights, garbage dumps, damaged footpaths,
open manholes, fallen trees blocking roads.

REJECT: selfies, food, indoor photos, animals, memes,
blank or blurry images.

Respond ONLY with valid JSON, no markdown:
{{
  "valid": boolean,
  "reason": "one sentence",
  "confidence": float 0.0 to 1.0,
  "detected_elements": ["list", "of", "things", "seen"]
}}"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type="image/jpeg"
                ),
                types.Part.from_text(text=prompt)
            ]
        )
        
        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        result = json.loads(text)
        print(f"✅ run_validator result: {result}")
        return result
        
    except Exception as e:
        print(f"❌ run_validator error: {e}")
        return {
            "valid": False,
            "reason": f"Validation error: {str(e)}",
            "confidence": 0.0,
            "detected_elements": []
        }
