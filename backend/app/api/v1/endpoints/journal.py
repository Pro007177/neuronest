import logging
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from anthropic import AsyncAnthropic, AnthropicError
from datetime import datetime, timedelta, timezone

from ....core.config import settings
from ....schemas.journal import JournalSummaryResponse, JournalSummaryRequest
# Import the 'thought' object directly from its source file
from ....crud.crud_thought import thought as crud_thought
from ....db.session import get_db_session
# Import User model and dependency getter
from ....models.user import User as UserModel
from ....api import deps

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Anthropic Client
anthropic_client = None
if settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != "YOUR_DEFAULT_ANTHROPIC_KEY":
    try:
        anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        logger.info("Anthropic client configured successfully.")
    except Exception as e:
        logger.error(f"Error initializing Anthropic client: {e}")
else:
    logger.warning("ANTHROPIC_API_KEY not found or is default. Claude functionality will be disabled.")


@router.post("/summary", response_model=JournalSummaryResponse)
async def generate_journal_summary(
    request: JournalSummaryRequest, # Request body (currently just period)
    db: AsyncSession = Depends(get_db_session), # DB session dependency
    current_user: UserModel = Depends(deps.get_current_user) # Auth dependency
):
    """
    Generates an AI-powered summary for the current authenticated user's
    journal entries (thoughts) for the past week using Anthropic Claude.
    """
    logger.info(f"User '{current_user.username}' (ID: {current_user.id}) generating journal summary for: {request.period}")

    if not anthropic_client:
        logger.error("Cannot generate summary: Anthropic client is not configured.")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AI Service Unavailable: Client not configured.")

    # --- Fetch relevant data for the CURRENT USER ---
    try:
        # Calculate date range (e.g., past 7 days)
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=7)
        logger.info(f"Fetching thoughts for user {current_user.id} from {start_date.isoformat()} to {end_date.isoformat()}")

        # Fetch thoughts using CRUD operation, passing the user_id
        thoughts_data = await crud_thought.get_thoughts_for_period(
            db=db, user_id=current_user.id, start_date=start_date, end_date=end_date, limit=50 # Limit for prompt size
        )

        if not thoughts_data:
            logger.info(f"No thoughts found for user {current_user.id} in the specified period for summary generation.")
            # Return a default "no data" summary (no DB changes, no commit needed)
            return JournalSummaryResponse(
                summary="No journal entries found for the past week to generate a summary.",
                insight="Try adding some thoughts in the Growth Space!",
                recommendation="Start by planting a seed about how you're feeling today.",
                highlights=[]
            )

        # Format thoughts data for the prompt
        formatted_entries = "\n".join(
            [f"- {t.created_at.strftime('%Y-%m-%d')}: [{t.mood.value}] {t.content}" for t in thoughts_data]
        )
        logger.info(f"Formatted {len(thoughts_data)} entries for AI prompt for user {current_user.id}.")

    except Exception as e:
        # Rollback happens in get_db_session exception handler
        logger.error(f"Database error fetching thoughts for user {current_user.id} summary: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching journal data.")

    # --- Define the prompt structure for Claude ---
    system_prompt = """You are an AI assistant for the NeuroNest mental wellness app. Your task is to analyze the user's provided journal entries (thoughts) from the past week and generate a supportive summary.

    The entries are provided in the format: "- YYYY-MM-DD: [mood] Content of the thought"

    Analyze these entries and provide a response ONLY in the following JSON format. Do not include any introductory text, closing remarks, or markdown formatting like ```json ... ```. The output must be a single, valid JSON object.

    JSON Format:
    {
      "summary": "A brief overall summary of the user's week based *specifically* on the provided entries. Mention trends or key themes observed. Use a warm and encouraging tone.",
      "insight": "Identify one key pattern or insight observed *directly* from the provided entries. Focus on strengths, recurring themes (positive or challenging), or shifts in mood.",
      "recommendation": "Suggest one actionable, positive recommendation based on the insight and the content of the entries. Keep it simple and encouraging.",
      "highlights": [
        {
          "date": "The date (YYYY-MM-DD) of a specific significant or representative entry from the provided list.",
          "entry": "The exact content of that significant entry.",
          "comment": "A short, encouraging AI comment on that specific entry, perhaps highlighting a strength, offering gentle perspective, or linking it to the overall insight."
        }
      ]
    }

    Select one or two entries for the 'highlights' section that are most representative or impactful from the provided list. Ensure the date and entry content match the input exactly.

    Make the content encouraging, supportive, and focused on growth and self-compassion, directly reflecting the user's provided thoughts. If entries are sparse or lack detail, acknowledge that gently in the summary.
    """
    user_message_content = f"Here are my journal entries from the past week:\n{formatted_entries}\n\nPlease generate the journal summary based *only* on these entries."


    # --- Call Anthropic API ---
    try:
        logger.info(f"Sending request to Anthropic Claude API for user {current_user.id}...")
        message = await anthropic_client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=2000, # Adjust as needed
            temperature=0.7,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message_content}]
        )
        logger.info(f"Received response from Anthropic Claude API for user {current_user.id}.")

        # --- Process the response ---
        if not message.content or not isinstance(message.content, list) or len(message.content) == 0:
             logger.error(f"Anthropic response content missing/invalid for user {current_user.id}.")
             raise HTTPException(status_code=500, detail="AI service returned an unexpected response structure.")
        if message.content[0].type != "text":
              logger.error(f"Anthropic response content type not 'text' for user {current_user.id}, got '{message.content[0].type}'.")
              raise HTTPException(status_code=500, detail="AI service returned non-text content.")

        response_text = message.content[0].text.strip()

        # Attempt to parse the JSON response
        try:
            parsed_response = json.loads(response_text)
            # Basic validation
            required_keys = ["summary", "insight", "recommendation", "highlights"]
            if not all(k in parsed_response for k in required_keys):
                raise ValueError("Missing required keys in AI response")
            if not isinstance(parsed_response.get("highlights"), list):
                 raise ValueError("Highlights key is not a list")

            logger.info(f"Successfully parsed JSON response from Claude for user {current_user.id}.")
            # No DB changes made in this endpoint, so no commit needed
            return JournalSummaryResponse(**parsed_response)

        except (json.JSONDecodeError, ValueError) as json_error:
            logger.error(f"Failed to parse JSON response from AI for user {current_user.id}: {json_error}")
            logger.error(f"Raw AI response text for user {current_user.id}: {response_text}")
            error_detail = f"AI service returned an invalid format. See logs. Raw start: '{response_text[:100]}...'"
            raise HTTPException(status_code=500, detail=error_detail)

    except AnthropicError as e:
        # Handle Anthropic-specific API errors
        logger.error(f"Anthropic API error for user {current_user.id}: {e.status_code} - {e.message}", exc_info=True)
        status_code = e.status_code if isinstance(e.status_code, int) and 400 <= e.status_code < 600 else 500
        detail_message = f"AI service error: {e.message}"
        # Customize messages based on common Anthropic errors if desired
        if e.status_code == 401: detail_message = "AI Service Error: Authentication failed (Check API Key)."
        elif e.status_code == 429: detail_message = "AI Service Error: Rate limit exceeded."
        elif e.status_code == 400: detail_message = f"AI Service Error: Invalid request ({e.message})."
        raise HTTPException(status_code=status_code, detail=detail_message)

    except Exception as e:
        # Handle other unexpected errors
        logger.error(f"Unexpected error generating summary for user {current_user.id}: {e}", exc_info=True)
        detail_message = f"An unexpected error occurred: {type(e).__name__}"
        raise HTTPException(status_code=500, detail=detail_message)