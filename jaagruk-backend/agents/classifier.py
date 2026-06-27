import os
import json
import requests
import asyncio
from google import genai
from google.genai import types

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

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
        print(f"🏷️ Running classifier with gemini-2.5-flash-lite")
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash-lite",
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


ANALYZER_PROMPT = """You are the analysis engine for Jaagruk, an Indian civic issue platform.
Look at this image (and the citizen's note) and perform BOTH validation and classification in a single pass.

STEP 1 - VALIDATE: Is this a genuine public infrastructure problem?
ACCEPT: potholes, broken roads, water leakage, flooding, broken streetlights,
garbage dumps, damaged footpaths, open manholes, fallen trees blocking roads.
REJECT: selfies, food, indoor photos, animals, memes, blank/blurry images, unrelated content.

STEP 2 - If valid, CLASSIFY:
Categories: POTHOLE, WATER_LEAKAGE, BROKEN_LIGHT, GARBAGE, DAMAGED_ROAD, OTHER
Severity (1-5): 1 = Minor, 2 = Noticeable, 3 = Moderate, 4 = Serious, 5 = Critical/dangerous

Respond ONLY with valid JSON, no markdown:
{
  "valid": boolean,
  "reason": "one sentence on the validation decision",
  "category": "CATEGORY_NAME",
  "severity": integer 1-5,
  "description": "1-2 sentence description of the issue",
  "affected_area": "brief area description",
  "confidence": float 0.0-1.0,
  "immediate_risk": boolean,
  "detected_elements": ["things", "seen"]
}
If not valid, still return the JSON with category "OTHER" and severity 1."""


async def run_analyzer(image_bytes: bytes, description: str = "") -> dict:
    """Single Gemini call that validates AND classifies, to minimise quota usage.

    Retries with backoff on transient/quota errors (503, 429). On final failure it
    returns a graceful fallback that accepts the report for manual review instead of
    leaking the raw error into the user-facing issue.
    """
    note = f"\n\nCitizen note: {description}" if description else ""
    try:
        print("🧠 Running analyzer (validate + classify) with gemini-2.5-flash-lite")
        for attempt in range(4):
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash-lite",
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                        types.Part.from_text(text=ANALYZER_PROMPT + note),
                    ],
                )
                text = response.text.strip().replace("```json", "").replace("```", "").strip()
                result = json.loads(text)
                print(f"✅ Analyzer result: {result}")
                return result
            except Exception as e:
                msg = str(e)
                transient = any(t in msg for t in ("503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED"))
                if transient and attempt < 3:
                    delay = 8 * (attempt + 1)  # 8s, 16s, 24s
                    print(f"⏳ Gemini busy/quota, retry {attempt + 1}/3 in {delay}s ({msg[:60]})")
                    await asyncio.sleep(delay)
                    continue
                raise e
    except Exception as e:
        print(f"❌ Analyzer error (graceful fallback): {e}")
        return {
            "valid": True,  # don't reject a genuine report just because AI quota ran out
            "reason": "Auto-accepted; AI analysis unavailable, queued for manual review.",
            "category": "OTHER",
            "severity": 3,
            "description": description or "Civic issue reported by citizen (pending AI analysis).",
            "affected_area": "",
            "confidence": 0.0,
            "immediate_risk": False,
            "detected_elements": [],
            "ai_unavailable": True,
        }