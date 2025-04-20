import {
    Thought, ThoughtCreatePayload, JournalSummaryData, GrowthInsightsData, ApiError, ApiErrorDetail,
    User, TokenResponse, LoginPayload, SignupPayload,
    Practice, MindspaceRecommendationResponse // Added Mindspace types
} from '../types'; // Ensure all necessary types are imported

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_V1_PREFIX = '/api/v1';

// --- Helper Functions ---

// Get token from storage
const getToken = (): string | null => {
    return localStorage.getItem('neuronest_token'); // Ensure key matches AuthContext
}

// Enhanced handleResponse to parse errors and handle different statuses
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorDetail: string = `HTTP error! status: ${response.status}`;
        try {
            // Try to parse specific error details from FastAPI
            const errorJson: ApiError = await response.json();
             if (typeof errorJson === 'object' && errorJson?.detail) {
                if (typeof errorJson.detail === 'string') {
                    errorDetail = errorJson.detail;
                } else if (Array.isArray(errorJson.detail) && errorJson.detail[0]?.msg) {
                    // Handle FastAPI validation errors array
                    errorDetail = errorJson.detail.map((d: ApiErrorDetail) => d.msg).join(', ');
                } else {
                     errorDetail = JSON.stringify(errorJson.detail); // Fallback
                }
            } else {
                 errorDetail = response.statusText || `HTTP error ${response.status}`;
            }
        } catch (e) {
            // If parsing JSON fails, use the basic status text
             errorDetail = response.statusText || `HTTP error ${response.status}`;
        }
        console.error("API Error:", response.status, errorDetail);
        throw new Error(errorDetail); // Throw error with extracted message
    }

    // Handle successful responses
    const contentType = response.headers.get("content-type");
    if (response.status === 204) { // No Content
        return null as T; // Return null for No Content responses
    }
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json() as Promise<T>; // Parse JSON body
    } else {
        // Handle non-JSON responses if necessary
        console.warn("Received non-JSON response:", response);
        // Try to return text if available, otherwise null
        try {
            const text = await response.text();
            return text as T; // May need adjustment based on expected non-JSON types
        } catch (e) {
            return null as T; // Fallback if text cannot be read
        }
    }
}


// Helper to create headers with Auth token
const createAuthHeaders = (token: string | null): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// --- Auth API ---

export const loginUser = async (payload: LoginPayload): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', payload.username);
    formData.append('password', payload.password);

    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });
    // Use handleResponse, it should work for JSON error details even from form posts
    return handleResponse<TokenResponse>(response);
};

export const signupUser = async (payload: SignupPayload): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/users`, {
        method: 'POST',
        headers: createAuthHeaders(null), // No token needed
        body: JSON.stringify(payload),
    });
    return handleResponse<User>(response);
};

export const getCurrentUser = async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/users/me`, {
        method: 'GET',
        headers: createAuthHeaders(token),
    });
    return handleResponse<User>(response);
};


// --- Thoughts API ---

export const getThoughts = async (): Promise<Thought[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/thoughts`, {
         headers: createAuthHeaders(token),
    });
    const result = await handleResponse<Thought[]>(response);
    return result || []; // Return empty array if response was null/empty
};

export const createThought = async (payload: ThoughtCreatePayload): Promise<Thought> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/thoughts`, {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(payload),
    });
    return handleResponse<Thought>(response);
};

export const waterThought = async (thoughtId: number): Promise<Thought> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/thoughts/${thoughtId}/water`, {
        method: 'PUT',
        headers: createAuthHeaders(token),
    });
    return handleResponse<Thought>(response);
};

// --- Journal API ---

export const getJournalSummary = async (): Promise<JournalSummaryData> => {
    const token = getToken();
    const payload = { period: "past week" }; // Keep payload simple
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/journal/summary`, {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(payload),
    });
    return handleResponse<JournalSummaryData>(response);
};

 // --- Insights API ---

 export const getGrowthInsights = async (periodDays: number = 30): Promise<GrowthInsightsData> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/insights?period_days=${periodDays}`, {
         headers: createAuthHeaders(token),
    });
    return handleResponse<GrowthInsightsData>(response);
};

 // --- Mindspace API (NEW) ---
 export const getMindspaceRecommendations = async (mood: string): Promise<Practice[]> => {
    const token = getToken();
    const payload = { mood };
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/mindspace/recommendations`, {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(payload),
    });
    // The backend returns { recommendations: Practice[] }, extract the array
    const data = await handleResponse<MindspaceRecommendationResponse>(response);
    return data.recommendations || []; // Return the array or empty if null/undefined
 };