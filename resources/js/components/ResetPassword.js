import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Assuming the token is passed via URL parameter

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/reset-password', {
        token,
        password,
        password_confirmation: confirmPassword,
      });
      setMessage(response.data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="login-header">
        <div className="logo-container">
          <img src="/imgs/logo.svg" alt="Logo" className="logo" />
        </div>
        <nav className="nav-links">
          <a href="#home">HOME</a>
          <a href="#shop">SHOP</a>
          <a href="#about">ABOUT US</a>
          <a href="#support" className="support-link">SUPPORT</a>
        </nav>
        <div className="header-icons">
          <img src="/imgs/Search.svg" alt="Search" className="header-icon" />
          <img src="/imgs/Wish.svg" alt="Wishlist" className="header-icon" />
          <img src="/imgs/Cart.svg" alt="Cart" className="header-icon" />
          <button className="login-button">Login</button>
        </div>
      </header>

      <div className="right-image-container">
        <img src="/imgs/design2.svg" alt="Right Image" className="right-image" />
      </div>

      <div className="left-image-container">
        <img src="/imgs/design1.svg" alt="Left Image" className="left-image" />
      </div>

      <div className="login-container">
        <h2>RESET PASSWORD</h2>
        <p>Enter your new password</p>

        {message && <p className="error-message">{message}</p>}

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="password"
                className="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="New Password"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="password-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm New Password"
              />
            </div>

            <button type="submit" className="sign-in-button" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <p className="back-to-login" onClick={() => navigate('/login')}>
              Back to Login
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;