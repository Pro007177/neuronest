// Define the Mood enum matching the backend
export enum Mood {
    Positive = "positive",
    Neutral = "neutral",
    Negative = "negative", // Or "challenging" if you prefer that term frontend-side
}

// Represents a Thought object received from the API
export interface Thought {
    id: number;
    content: string;
    mood: Mood;
    growth_stage: number; // 0-3
    created_at: string; // ISO Date string
    last_watered_at: string; // ISO Date string
    // user_id?: number; // Add later if needed
}

// For creating a new thought
export interface ThoughtCreatePayload {
    content: string;
    mood: Mood;
}

// For the journal summary response
export interface JournalSummaryData {
    summary: string;
    insight: string;
    recommendation: string;
    highlights: Array<{
        date: string;
        entry: string;
        comment: string;
    }>;
}

// For growth insights response
export interface GrowthInsightsData {
    total_thoughts: number;
    mood_distribution: { [key: string]: number }; // e.g., { positive: 5, neutral: 2 }
    recent_growth_trend: string;
}

// Generic API Error structure (optional but helpful)
export interface ApiError {
    detail: string | { msg: string; type: string }[]; // Match FastAPI's error format
}