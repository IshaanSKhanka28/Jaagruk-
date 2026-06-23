import os
import json
import logging
import asyncio
import google.generativeai as genai
from PIL import Image
import io

# Initialize genai
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def run_validator(image_bytes: bytes, description: str) -> dict:
    """Validator Agent: Uses Gemini 1.5 Flash to verify if the uploaded image represents a real civic issue."""
    try:
        # Load image with PIL
        img = Image.open(io.BytesIO(image_bytes))
        
        # Prepare model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Analyze this image and the citizen's notes: "{description or ''}".
        Determine if the image represents a real, actual civic issue in public spaces that needs municipal attention (e.g., potholes, broken roads, garbage overflow, water leakage, broken streetlights, stray wires, open manholes, public damage).
        If it's a selfie, a clean space with no issues, a private indoor room, an unrelated document, or random spam, mark it as invalid.
        Return your response in strict JSON format matching this schema:
        {{
          "valid": true or false,
          "reason": "A concise reason explaining why it is valid or invalid"
        }}
        """
        
        # Call Gemini in a separate thread to keep it async
        response = await asyncio.to_thread(
            model.generate_content,
            contents=[img, prompt],
            generation_config={"response_mime_type": "application/json"}
        )
        
        result = json.loads(response.text.strip())
        logging.info(f"Validator Agent output: {result}")
        return result
    except Exception as e:
        logging.error(f"Error in Validator Agent: {e}")
        # Default fallback to proceed in case of API failure
        return {
            "valid": True,
            "reason": f"Validator Agent processing bypassed due to system error: {str(e)}"
        }
