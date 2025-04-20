import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/password/reset', {
                email,
                password,
                password_confirmation,
                token,
            });

            setMessage(response.data.message || 'Password has been reset successfully.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={password_confirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Reset Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                />
                <button type="submit">Reset Password</button>
            </form>

            {message && <p>{message}</p>}
            {error && <p>{error}</p>}
        </div>
    );
};

export default ResetPassword;
