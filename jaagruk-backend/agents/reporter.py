import os
import json
import logging
import asyncio
from google import genai
from google.genai import types

# Initialize genai client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def run_reporter(issue_data: dict) -> dict:
    """Reporter Agent: Uses Gemini 1.5 Flash to write formal civic grievance complaint text."""
    try:
        prompt = f"""
        Generate a formal, structured grievance complaint letter to be submitted to the municipal department: "{issue_data.get('department')}".
        
        Issue details for submission:
        - Issue ID: {issue_data.get('id', 'N/A')}
        - Category: {issue_data.get('category', 'OTHER')}
        - Location Address: {issue_data.get('address', 'Not Specified')}
        - Severity Index: {issue_data.get('severity', 1)}/5
        - Priority Level: {issue_data.get('priority', 'LOW')}
        - AI Validated Description: {issue_data.get('refined_description', issue_data.get('description', ''))}
        
        Write a professional, assertive, and direct letter requesting urgent administrative resolution.
        - Start with a formal subject line (e.g., "Grievance Redressal: Urgent Road Maintenance Required at ...").
        - Keep the style professional, direct, and actionable. Avoid unnecessary preachy or political statements.
        - Add a placeholder for citizen signature/endorsement at the bottom.
        
        Return your response in strict JSON format matching this schema:
        {{
          "subject": "Clear subject line for the grievance letter",
          "body": "The full body text of the grievance complaint letter. Use linebreaks where appropriate.",
          "recipient": "Designated officer role (e.g. Executive Engineer, Ward Commissioner)"
        }}
        """
        
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        result = json.loads(response.text.strip())
        logging.info(f"Reporter Agent output: {result}")
        return result
    except Exception as e:
        logging.error(f"Error in Reporter Agent: {e}")
        # Default fallback grievance content
        return {
            "subject": f"Grievance Submission: Urgent {issue_data.get('category', 'OTHER')} attention needed",
            "body": (
                f"To the concerned authority at {issue_data.get('department') or 'Municipal Corporation'},\n\n"
                f"This is an official grievance report regarding a serious {issue_data.get('category', 'OTHER')} issue located at {issue_data.get('address', 'Not Specified')}.\n\n"
                f"Description: {issue_data.get('description') or 'No description provided'}.\n\n"
                f"Please register this complaint under ID {issue_data.get('id', 'N/A')} and dispatch a maintenance team for correction at the earliest.\n\n"
                f"Sincerely,\nJaagruk Citizen Representative"
            ),
            "recipient": "Assistant Engineer / Ward Officer"
        }
