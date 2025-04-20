# Keep the existing journal schemas, no changes needed here for now
from pydantic import BaseModel
from typing import List, Dict

class JournalSummaryRequest(BaseModel):
    period: str = "past week" # Could add start_date, end_date later

class JournalSummaryResponse(BaseModel):
    summary: str
    insight: str
    recommendation: str
    highlights: List[Dict] # List of {date: str, entry: str, comment: str}