import logging
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession # Keep for potential future use
from anthropic import AsyncAnthropic, AnthropicError

from ....core.config import settings
# Import specific schemas directly
from ....schemas.mindspace import MindspaceRecommendationRequest, MindspaceRecommendationResponse, Practice
from ....db.session import get_db_session # Keep for potential future use
# Import User model and dependency getter
from ....models.user import User as UserModel
from ....api import deps

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Anthropic Client (reuse from journal or create new instance if needed)
# Assuming anthropic_client is configured similarly to journal.py
anthropic_client = None
if settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != "YOUR_DEFAULT_ANTHROPIC_KEY":
    try:
        anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        logger.info("Anthropic client configured successfully for Mindspace.")
    except Exception as e:
        logger.error(f"Error initializing Anthropic client for Mindspace: {e}")
else:
    logger.warning("ANTHROPIC_API_KEY not found or is default. Mindspace AI recommendations disabled.")


@router.post("/recommendations", response_model=MindspaceRecommendationResponse)
async def get_mindspace_recommendations(
    request: MindspaceRecommendationRequest,
    # db: AsyncSession = Depends(get_db_session), # Not needed yet, but keep for future
    current_user: UserModel = Depends(deps.get_current_user) # Get current user context
):
    """
    Provides meditation/breathing practice recommendations based on user mood using AI.
    """
    mood = request.mood.lower() # Normalize mood input
    logger.info(f"User '{current_user.username}' requesting Mindspace recommendations for mood: {mood}")

    if not anthropic_client:
        logger.error("Cannot get recommendations: Anthropic client is not configured.")
        # Return predefined defaults if AI is unavailable? Or raise error.
        # For now, raise error.
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AI Service Unavailable: Client not configured.")

    # --- Define the prompt for Claude ---
    system_prompt = """You are an AI assistant for the NeuroNest mental wellness app. Your task is to recommend 2-3 simple meditation, breathing, or mindfulness exercises suitable for a user feeling a specific mood.

    Provide the response ONLY in the following JSON format. Do not include any introductory text, closing remarks, or markdown formatting like ```json ... ```. The output must be a single, valid JSON object representing a list of recommendations.

    JSON Format:
    {
      "recommendations": [
        {
          "id": "unique_practice_id", // e.g., "deep_breathing", "body_scan", "5_senses"
          "title": "Practice Title", // e.g., "Deep Belly Breathing", "Body Scan Meditation"
          "duration_minutes": 5, // Estimated duration in minutes (integer)
          "description": "A brief, clear description of the practice and its benefits for the mood."
        }
      ]
    }

    Keep descriptions concise and encouraging. Ensure the 'id' is a simple snake_case string. Tailor the recommendations appropriately to the provided mood. For 'content', suggest something universally calming like 'Deep Breathing'.
    """

    user_message_content = f"Recommend 2-3 practices for someone feeling: {mood}"

    # --- Call Anthropic API ---
    try:
        logger.info(f"Sending Mindspace recommendation request to Claude for mood: {mood}")
        message = await anthropic_client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=1000, # Should be sufficient for a few recommendations
            temperature=0.6, # Slightly lower temp for more focused suggestions
            system=system_prompt,
            messages=[{"role": "user", "content": user_message_content}]
        )
        logger.info(f"Received Mindspace recommendation response from Claude for mood: {mood}")

        # --- Process the response ---
        if not message.content or not isinstance(message.content, list) or len(message.content) == 0:
             logger.error("Anthropic response content missing/invalid for Mindspace.")
             raise HTTPException(status_code=500, detail="AI service returned unexpected response structure.")
        if message.content[0].type != "text":
              logger.error(f"Anthropic response content type not 'text' for Mindspace, got '{message.content[0].type}'.")
              raise HTTPException(status_code=500, detail="AI service returned non-text content.")

        response_text = message.content[0].text.strip()

        # Attempt to parse the JSON response
        try:
            parsed_response = json.loads(response_text)
            # Basic validation (check if 'recommendations' key exists and is a list)
            if "recommendations" not in parsed_response or not isinstance(parsed_response["recommendations"], list):
                raise ValueError("Invalid structure: 'recommendations' key missing or not a list.")
            # Further validation could check items in the list match the Practice schema

            logger.info(f"Successfully parsed Mindspace recommendations for mood: {mood}")
            # Use Pydantic to validate the structure before returning
            return MindspaceRecommendationResponse(**parsed_response)

        except (json.JSONDecodeError, ValueError, TypeError) as json_error: # Added TypeError for Pydantic validation
            logger.error(f"Failed to parse/validate JSON response from AI for Mindspace: {json_error}")
            logger.error(f"Raw AI response text for Mindspace: {response_text}")
            error_detail = f"AI service returned an invalid format. See logs. Raw start: '{response_text[:100]}...'"
            raise HTTPException(status_code=500, detail=error_detail)

    except AnthropicError as e:
        logger.error(f"Anthropic API error for Mindspace: {e.status_code} - {e.message}", exc_info=True)
        status_code = e.status_code if isinstance(e.status_code, int) and 400 <= e.status_code < 600 else 500
        detail_message = f"AI service error: {e.message}"
        raise HTTPException(status_code=status_code, detail=detail_message)

    except Exception as e:
        logger.error(f"Unexpected error getting Mindspace recommendations: {e}", exc_info=True)
        detail_message = f"An unexpected error occurred: {type(e).__name__}"
        raise HTTPException(status_code=500, detail=detail_message)