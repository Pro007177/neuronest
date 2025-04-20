import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
 import { ErrorMessage, LoadingSpinner } from './common'; // Assuming common components exist

interface SignupPageProps {
    onLoginClick: () => void; // Function to switch to login view
    onSignupSuccess: () => void; // Function after successful signup
}

export const SignupPage: React.FC<SignupPageProps> = ({ onLoginClick, onSignupSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await signup({ username, password });
            alert("Signup successful! Please log in."); // Inform user
            onSignupSuccess(); // e.g., switch to login view
        } catch (err: any) {
            setError(err.message || "Signup failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="mx-auto" style={{ maxWidth: '400px' }}>
             <div className="bg-white rounded shadow p-4">
                <h2 className="fs-3 fw-bold text-success text-center mb-4">Create Account</h2>
                <form onSubmit={handleSubmit}>
                     <ErrorMessage message={error} />
                    <div className="mb-3">
                        <label htmlFor="signup-username" className="form-label">Username</label>
                        <input
                            type="text"
                            id="signup-username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="signup-password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="signup-password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={isLoading}
                        />
                    </div>
                     <div className="mb-3">
                        <label htmlFor="signup-confirm-password" className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            id="signup-confirm-password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100 mb-3" disabled={isLoading}>
                        {isLoading ? <LoadingSpinner text="Creating Account..." /> : 'Sign Up'}
                    </button>
                     <p className="text-center small text-secondary mb-0">
                        Already have an account?{' '}
                        <button type="button" className="btn btn-link p-0" onClick={onLoginClick}>
                            Login
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};