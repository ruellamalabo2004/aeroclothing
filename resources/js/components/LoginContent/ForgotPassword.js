import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);
        setShowSuccessPopup(false);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/forgot-password', { email }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            setMessage(response.data.message || 'Password reset link sent to your email.');
            setShowSuccessPopup(true);
            setIsLoading(false);
        } catch (err) {
            // Error handling removed as per previous request
            setIsLoading(false);
        }
    };

    // Auto-close success pop-up after 3 seconds and redirect
    useEffect(() => {
        if (showSuccessPopup) {
            const timer = setTimeout(() => {
                setShowSuccessPopup(false);
                navigate('/login'); // Redirect to login after success
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessPopup, navigate]);

    return (
        <div className="forgot-password">
            <div className="forgot-password__card">
                <h1 className="forgot-password__title">Forgot Password</h1>
                <p className="forgot-password__subtitle">
                    Enter your email to reset your password
                </p>
                <form className="forgot-password__form" onSubmit={handleSubmit}>
                    <div className="forgot-password__field">
                        <label htmlFor="email" className="forgot-password__label">Email Address</label>
                        <div className="forgot-password__input-wrapper">
                            <span className="forgot-password__input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                                    <polyline points="22 6 12 13 2 6"></polyline>
                                </svg>
                            </span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="forgot-password__input"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <button type="submit" className="forgot-password__submit-button" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>
                <div className="forgot-password__links">
                    <Link to="/login">Return to Login</Link>
                    <span>|</span>
                    <Link to="/support">Contact Support</Link>
                </div>
            </div>

            {/* Right-Side Success Pop-up Notification */}
            {showSuccessPopup && (
                <div className="success-notification" id="success-notification">
                    <span className="success-notification__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4"></path>
                            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                        </svg>
                    </span>
                    <p className="success-notification__message">{message}</p>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;