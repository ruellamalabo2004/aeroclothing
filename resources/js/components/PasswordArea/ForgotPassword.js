import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Sending reset link...');

    if (!email) {
      setMessage('Please provide a valid email.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/forgot-password', { email });
      setMessage(response.data.message || 'Reset link sent successfully!');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to send reset link.');
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
        <h2>FORGOT PASSWORD</h2>
        <p>Enter your email to receive a reset link</p>

        {message && <p className="error-message">{message}</p>}

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                className="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <button type="submit" className="sign-in-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;