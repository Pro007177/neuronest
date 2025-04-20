import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const LoadingSpinner: React.FC<{ text?: string, size?: 'sm' | 'md' | 'lg' }> = ({ text = "Loading...", size = 'md' }) => (
    <div className={`d-inline-flex align-items-center text-secondary ${size === 'sm' ? 'small' : ''}`}>
        <div className={`spinner-border spinner-border-${size === 'sm' ? 'sm' : ''} me-2`} role="status">
            <span className="visually-hidden">{text}</span>
        </div>
        {text}
    </div>
);

export const ErrorMessage: React.FC<{ message: string | null, onRetry?: () => void }> = ({ message, onRetry }) => {
    if (!message) return null;
    return (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-2 px-3" role="alert">
            <small><AlertCircle size={16} className="me-2" /> {message}</small>
            {onRetry && (
                <button className="btn btn-sm btn-danger ms-2" onClick={onRetry}>
                    <RefreshCw size={14} className="me-1" /> Retry
                </button>
            )}
        </div>
    );
};