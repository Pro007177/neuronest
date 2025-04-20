import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage, LoadingSpinner } from './common'; // Assuming common components exist

interface LoginPageProps {
    onSignupClick: () => void; // Function to switch to signup view
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSignupClick }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login({ username, password });
            // Login success is handled by AuthContext updating state, App.tsx will re-render
        } catch (err: any) {
            setError(err.message || "Login failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto" style={{ maxWidth: '400px' }}>
             <div className="bg-white rounded shadow p-4">
                <h2 className="fs-3 fw-bold text-success text-center mb-4">Login to NeuroNest</h2>
                <form onSubmit={handleSubmit}>
                    <ErrorMessage message={error} />
                    <div className="mb-3">
                        <label htmlFor="login-username" className="form-label">Username</label>
                        <input
                            type="text"
                            id="login-username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="login-password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="login-password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100 mb-3" disabled={isLoading}>
                        {isLoading ? <LoadingSpinner text="Logging in..." /> : 'Login'}
                    </button>
                    <p className="text-center small text-secondary mb-0">
                        Don't have an account?{' '}
                        <button type="button" className="btn btn-link p-0" onClick={onSignupClick}>
                            Sign Up
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};