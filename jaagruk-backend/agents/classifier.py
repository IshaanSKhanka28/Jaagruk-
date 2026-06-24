import os
import json
import requests
import asyncio
from google import genai
from google.genai import types

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

DEPARTMENT_MAP = {
    "POTHOLE": "Public Works Department",
    "DAMAGED_ROAD": "Public Works Department",
    "WATER_LEAKAGE": "Water Supply Board",
    "BROKEN_LIGHT": "Electricity Department",
    "GARBAGE": "Municipal Solid Waste Department",
    "OTHER": "General Municipal Office"
}

PROMPT = """You are a civic issue classifier for Jaagruk, an Indian civic platform.
Analyze this image and classify the infrastructure problem.

Categories:
- POTHOLE: holes or depressions in road surface
- WATER_LEAKAGE: water pipe leaks, flooding, waterlogging
- BROKEN_LIGHT: broken or non-functioning streetlights
- GARBAGE: illegal dumping, overflowing bins
- DAMAGED_ROAD: cracks, broken surface (not a pothole)
- OTHER: any other civic infrastructure issue

Severity (1-5):
1 = Minor, 2 = Noticeable, 3 = Moderate, 4 = Serious, 5 = Critical/dangerous

Respond ONLY with valid JSON, no markdown:
{
  "category": "CATEGORY_NAME",
  "severity": integer 1-5,
  "description": "1-2 sentence AI description",
  "affected_area": "brief location description",
  "confidence": float 0.0-1.0,
  "immediate_risk": boolean
}"""

async def run_classifier(image_bytes: bytes, description: str = "") -> dict:
    try:
        print(f"🏷️ Running classifier with gemini-2.5-flash")
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
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
                result["department"] = DEPARTMENT_MAP.get(result.get("category", "OTHER"), "General Municipal Office")
                print(f"✅ Classifier result: {result}")
                return result
            except Exception as e:
                if "503" in str(e) or "UNAVAILABLE" in str(e):
                    if attempt < 2:
                        print(f"⏳ Gemini busy, retry {attempt+1}/3...")
                        await asyncio.sleep(5)
                        continue
                raise e
    except Exception as e:
        print(f"❌ Classifier error: {e}")
        return {
            "category": "OTHER",
            "severity": 3,
            "priority": "MEDIUM",
            "department": "General Municipal Office",
            "refined_description": f"Classification error: {str(e)}",
            "confidence": 0.0,
            "immediate_risk": False
        }

async def classify_issue(image_url: str, description: str = "") -> dict:
    image_bytes = requests.get(image_url, timeout=15).content
    return await run_classifier(image_bytes, description)