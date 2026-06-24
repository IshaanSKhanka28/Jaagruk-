import os
import json
import logging
import asyncio
from google import genai
from google.genai import types
from PIL import Image
import io

# Initialize genai client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def run_classifier(image_bytes: bytes, description: str) -> dict:
    """Classifier Agent: Uses Gemini 1.5 Flash to categorize, score, and describe the civic issue."""
    try:
        # Prepare content and model
        prompt = f"""
        Analyze this image of a civic issue and the citizen's raw notes: "{description or ''}".
        Classify the issue under one of these categories: ROADS, WATER, SANITATION, ELECTRICAL, OTHER.
        Estimate a severity score from 1 (very minor/cosmetic) to 5 (extremely hazardous/dangerous to human life).
        Determine a priority level: LOW, MEDIUM, HIGH, URGENT.
        Write a clean, objective description summarizing the visible issue in English.
        Return your response in strict JSON format matching this schema:
        {{
          "category": "ROADS" or "WATER" or "SANITATION" or "ELECTRICAL" or "OTHER",
          "severity": 1, 2, 3, 4, or 5,
          "priority": "LOW" or "MEDIUM" or "HIGH" or "URGENT",
          "refined_description": "A clean, detailed, and objective description of the issue based on what is visible in the photo and notes."
        }}
        """
        
        contents = [
            types.Part.from_bytes(
                data=image_bytes,
                mime_type="image/jpeg"
            ),
            types.Part.from_text(text=prompt)
        ]
        
        # Call Gemini in a separate thread to keep it async
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        result = json.loads(response.text.strip())
        logging.info(f"Classifier Agent output: {result}")
        return result
    except Exception as e:
        logging.error(f"Error in Classifier Agent: {e}")
        # Default fallback in case of API failure
        return {
            "category": "OTHER",
            "severity": 3,
            "priority": "MEDIUM",
            "refined_description": f"Classification bypassed. Citizen notes: {description or 'None'}"
        }
