import {
    Thought,
    ThoughtCreatePayload,
    JournalSummaryData,
    GrowthInsightsData,
    ApiError
} from '../types'; // Adjust path if needed

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'; // Fallback for safety
const API_V1_PREFIX = '/api/v1';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorData: ApiError | string = `HTTP error! status: ${response.status}`;
        try {
            // Try to parse specific error details from FastAPI
            const jsonError = await response.json();
            errorData = jsonError as ApiError;
            // Extract a user-friendly message if possible
            if (typeof errorData === 'object' && errorData?.detail) {
                if (typeof errorData.detail === 'string') {
                    errorData = errorData.detail;
                } else if (Array.isArray(errorData.detail) && errorData.detail[0]?.msg) {
                    // Handle validation errors array
                    errorData = errorData.detail.map(d => d.msg).join(', ');
                } else {
                     errorData = JSON.stringify(errorData.detail); // Fallback for complex details
                }
            } else {
                 errorData = response.statusText; // Use status text if no detail
            }

        } catch (e) {
            // If parsing fails, use the basic status text
            errorData = response.statusText || `HTTP error ${response.status}`;
        }
         console.error("API Error:", errorData);
        throw new Error(typeof errorData === 'string' ? errorData : 'API request failed');
    }
    return response.json() as Promise<T>;
}

// --- Thoughts API ---

export const getThoughts = async (): Promise<Thought[]> => {
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/thoughts`);
    return handleResponse<Thought[]>(response);
};

export const createThought = async (payload: ThoughtCreatePayload): Promise<Thought> => {
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/thoughts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse<Thought>(response);
};

export const waterThought = async (thoughtId: number): Promise<Thought> => {
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/thoughts/${thoughtId}/water`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }, // Header might not be strictly needed for PUT with no body, but good practice
    });
    return handleResponse<Thought>(response);
};

// --- Journal API ---

export const getJournalSummary = async (): Promise<JournalSummaryData> => {
    // Assuming the request body is simple for now, adjust if needed
    const payload = { period: "past week" };
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/journal/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse<JournalSummaryData>(response);
};

 // --- Insights API ---

 export const getGrowthInsights = async (periodDays: number = 30): Promise<GrowthInsightsData> => {
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/insights?period_days=${periodDays}`);
    return handleResponse<GrowthInsightsData>(response);
};