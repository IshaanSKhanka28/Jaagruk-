import os
import json
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

async def run_router(category: str, address: str) -> dict:
    try:
        print(f"🔀 Running router with gemini-2.0-flash-lite")
        
        department = DEPARTMENT_MAP.get(category, "General Municipal Office")
        
        prompt = f"""You are a civic issue router for Jaagruk, an Indian civic platform.

Issue details:
- Category: {category}
- Location: {address}
- Department: {department}

Determine the routing decision and priority.

Priority rules:
- HIGH: immediate safety risk, blocking roads, no water supply
- MEDIUM: inconvenience, affects daily life
- LOW: minor aesthetic issues

Respond ONLY with valid JSON, no markdown:
{{
  "department": "{department}",
  "priority": "HIGH or MEDIUM or LOW",
  "reasoning": "one sentence explaining why",
  "estimated_resolution_days": integer,
  "escalation_required": boolean
}}"""

        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model="gemini-2.0-flash-lite",
                    contents=[types.Part.from_text(text=prompt)]
                )
                text = response.text.strip().replace("```json","").replace("```","").strip()
                result = json.loads(text)
                print(f"✅ Router result: {result}")
                return result
            except Exception as e:
                if "503" in str(e) or "UNAVAILABLE" in str(e):
                    if attempt < 2:
                        print(f"⏳ Gemini busy, retry {attempt+1}/3...")
                        await asyncio.sleep(5)
                        continue
                raise e
    except Exception as e:
        print(f"❌ Router error: {e}")
        return {
            "department": DEPARTMENT_MAP.get(category, "General Municipal Office"),
            "priority": "MEDIUM",
            "reasoning": f"Auto-routed based on category: {str(e)}",
            "estimated_resolution_days": 7,
            "escalation_required": False
        }