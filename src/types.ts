// Keep existing: Mood, Thought, ThoughtCreatePayload, User, TokenResponse, LoginPayload, SignupPayload, JournalSummaryData, GrowthInsightsData, ApiErrorDetail, ApiError

// Add Practice type matching backend schema
export interface Practice {
    id: string;
    title: string;
    duration_minutes: number;
    description: string;
    // type?: 'breathing' | 'meditation' | 'mindfulness'; // Optional type
}

// Optional: Type for the API response (or just use Practice[])
export interface MindspaceRecommendationResponse {
    recommendations: Practice[];
}

// --- Existing Types ---
export enum Mood { Positive = "positive", Neutral = "neutral", Negative = "negative" }
export interface Thought { id: number; user_id: number; content: string; mood: Mood; growth_stage: number; created_at: string; last_watered_at: string; }
export interface ThoughtCreatePayload { content: string; mood: Mood; }
export interface User { id: number; username: string; created_at: string; }
export interface TokenResponse { access_token: string; token_type: string; }
export interface LoginPayload { username: string; password: string; }
export interface SignupPayload { username: string; password: string; }
export interface JournalSummaryData { summary: string; insight: string; recommendation: string; highlights: Array<{ date: string; entry: string; comment: string; }>; }
export interface GrowthInsightsData { total_thoughts: number; mood_distribution: { [key in Mood]?: number }; recent_growth_trend: string; }
export interface ApiErrorDetail { loc?: (string | number)[]; msg: string; type: string; ctx?: Record<string, any>; }
export interface ApiError { detail: string | ApiErrorDetail[]; }