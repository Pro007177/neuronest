import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import * as api from '../services/api';
import { User, LoginPayload, SignupPayload } from '../types';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean; // Loading state for initial auth check
    login: (payload: LoginPayload) => Promise<void>;
    signup: (payload: SignupPayload) => Promise<void>;
    logout: () => void;
    error: string | null; // Store auth-related errors
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'neuronest_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
    const [isLoading, setIsLoading] = useState(true); // Start loading initially
    const [error, setError] = useState<string | null>(null);

    const fetchCurrentUser = useCallback(async (currentToken: string) => {
        if (!currentToken) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const userData = await api.getCurrentUser(currentToken);
            setUser(userData);
        } catch (err: any) {
            console.error("Failed to fetch current user:", err);
            // If token is invalid (e.g., 401 error), log out
            setUser(null);
            setToken(null);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            // Don't set a generic error here, just clear user state
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array

    // Effect to check token validity on initial load
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
            setToken(storedToken);
            fetchCurrentUser(storedToken);
        } else {
            setIsLoading(false); // No token, stop loading
        }
    }, [fetchCurrentUser]); // Depend on fetchCurrentUser

    const handleAuthSuccess = (newToken: string, userData?: User) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        setToken(newToken);
        setError(null);
        if (userData) {
            setUser(userData);
        } else {
            // If user data not immediately available (e.g., after signup), fetch it
            fetchCurrentUser(newToken);
        }
    };

    const login = async (payload: LoginPayload) => {
        setIsLoading(true); // Indicate loading during login attempt
        setError(null);
        try {
            const tokenData = await api.loginUser(payload);
            // Fetch user data after successful login
            const userData = await api.getCurrentUser(tokenData.access_token);
            handleAuthSuccess(tokenData.access_token, userData);
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err.message || "Login failed. Please check username and password.");
            // Ensure user/token state is cleared on login failure
            setUser(null);
            setToken(null);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            throw err; // Re-throw error so calling component can handle it (e.g., show message)
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (payload: SignupPayload) => {
        setIsLoading(true);
        setError(null);
        try {
            // Signup creates the user but doesn't log them in automatically in this flow
            // We could modify the backend to return a token on signup, or require login after.
            // Let's require login after signup for simplicity here.
            await api.signupUser(payload);
            // Optionally automatically log in after signup:
            // await login({ username: payload.username, password: payload.password });
        } catch (err: any) {
            console.error("Signup failed:", err);
            setError(err.message || "Signup failed. Username might already exist.");
             throw err; // Re-throw error
        } finally {
             setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setError(null);
        // Optionally redirect to login page here using useNavigate if using React Router
    };

    const value = {
        isAuthenticated: !!token && !!user, // Consider authenticated only if token AND user are set
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        error
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};