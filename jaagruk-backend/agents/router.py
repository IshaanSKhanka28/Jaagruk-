import os
import json
import logging
import asyncio
from google import genai
from google.genai import types

# Initialize genai client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def run_router(category: str, address: str) -> dict:
    """Routing Agent: Uses Gemini 1.5 Flash to determine target department and officer responsibility."""
    try:
        prompt = f"""
        Given a civic issue category: "{category}" and address/location details: "{address or 'Not Provided'}".
        Determine the appropriate municipal department and officer title responsible for fixing this issue in an Indian city context.
        For example:
        - ROADS -> Public Works Department (PWD) / Road Maintenance Division
        - WATER -> Municipal Water Supply and Sewerage Board
        - SANITATION -> Municipal Corporation (Solid Waste Management Department)
        - ELECTRICAL -> State Electricity Board / Streetlight Maintenance Division
        - OTHER -> General Ward Administrative Officer
        Return your response in strict JSON format matching this schema:
        {{
          "department": "Name of the target department",
          "officer_role": "Responsible officer role (e.g., Executive Engineer, Assistant Engineer, Ward Inspector, Health Officer)"
        }}
        """
        
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        result = json.loads(response.text.strip())
        logging.info(f"Router Agent output: {result}")
        return result
    except Exception as e:
        logging.error(f"Error in Routing Agent: {e}")
        # Default fallback based on category
        dept_map = {
            "ROADS": ("Public Works Department (PWD)", "Assistant Engineer (Roads)"),
            "WATER": ("Water Supply & Sewerage Board", "Sub-Divisional Engineer"),
            "SANITATION": ("Municipal Solid Waste Dept", "Sanitary Inspector"),
            "ELECTRICAL": ("Electricity Board (EB)", "Assistant Engineer (Electrical)"),
        }
        dept, role = dept_map.get(category, ("General Municipal Corporation", "Ward Officer"))
        return {
            "department": dept,
            "officer_role": role
        }
