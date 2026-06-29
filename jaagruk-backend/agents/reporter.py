import os
import json
import asyncio
from google import genai
from google.genai import types
from datetime import datetime

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options={"api_version": "v1"}
)

async def run_reporter(issue_data: dict) -> dict:
    try:
        print(f"📄 Running reporter with gemini-1.5-flash")
        
        prompt = f"""You are an official complaint letter generator 
for Jaagruk, an Indian civic reporting platform.

Generate a formal government complaint letter for this issue:

Issue ID: {issue_data.get('id', 'JGR-001')}
Category: {issue_data.get('category', 'POTHOLE')}
Location: {issue_data.get('address', 'Unknown location')}
Severity: {issue_data.get('severity', 3)}/5
Priority: {issue_data.get('priority', 'MEDIUM')}
Description: {issue_data.get('refined_description', 
              issue_data.get('description', 'Civic issue reported'))}
Department: {issue_data.get('department', 
             'Public Works Department')}
Date: {datetime.now().strftime('%d %B %Y')}

Write a professional, formal complaint letter addressed 
to the department head. Include:
- Subject line
- Formal greeting
- Clear description of the issue
- Location details
- Request for urgent resolution
- Timeline expectation
- Closing

Respond ONLY with valid JSON, no markdown:
{{
  "subject": "Subject line of the complaint",
  "letter": "Full formal complaint letter text",
  "summary": "One sentence summary",
  "urgency": "IMMEDIATE or URGENT or STANDARD",
  "follow_up_days": integer
}}"""

        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=[types.Part.from_text(text=prompt)]
                )
                text = response.text.strip().replace("```json","").replace("```","").strip()
                result = json.loads(text)
                print(f"✅ Reporter result: {result}")
                return result
            except Exception as e:
                if "503" in str(e) or "UNAVAILABLE" in str(e):
                    if attempt < 2:
                        print(f"⏳ Gemini busy, retry {attempt+1}/3...")
                        await asyncio.sleep(5)
                        continue
                raise e
    except Exception as e:
        print(f"❌ Reporter error: {e}")
        return {
            "subject": f"Complaint regarding {issue_data.get('category', 'civic issue')}",
            "letter": f"Formal complaint for issue at {issue_data.get('address', 'reported location')}.",
            "summary": "Auto-generated complaint",
            "urgency": "STANDARD",
            "follow_up_days": 7
        }