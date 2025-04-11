import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from '../FooterNav/Footer';
import LoginHeader from '../HeaderNav/LoginHeader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);

      const profileResponse = await axios.get('http://localhost:8000/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = profileResponse.data.profile;
      localStorage.setItem('profile', JSON.stringify(profile));

      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/homepage');
      }

    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('Sending reset link...');
    setForgotLoading(true);
  
    if (!forgotEmail) {
      setForgotMessage('Please provide a valid email.');
      setForgotLoading(false);
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8000/api/forgot-password', { email: forgotEmail });
      setForgotMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setForgotMessage(error.response?.data?.message || 'Unable to send reset link.');
    } finally {
      setForgotLoading(false);
    }
  };
  
  return (
    <>
      <LoginHeader />
      <div className="login-container">
        {!showForgotPassword ? (
          <>
            <h2>WELCOME BACK!</h2>
            <p>Enter your credentials for login</p>

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
                    placeholder="Email"
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="password" 
                    className="password-input"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Password"
                  />
                </div>

                <div className="checkbox-container">
                  <label>
                    <input type="checkbox" /> Remember me
                  </label>
                  <p className="forgot-password" onClick={() => setShowForgotPassword(true)}>Forgot password?</p>
                </div>

                <button type="submit" className="sign-in-button" disabled={loading}>
                  {loading ? 'Logging in...' : 'Sign In'}
                </button>

                <div className="separator"></div>

                <p className="create-account-text">Don't have an account?</p>
                <button className="create-account-button" onClick={() => navigate('/signup')}>
                  Create Account
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <h2>RESET PASSWORD</h2>
            <p>Enter your email to receive a reset link</p>

            {forgotMessage && <p className="error-message">{forgotMessage}</p>}

            <div className="login-form">
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <input 
                    type="email" 
                    className="email-input"
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)} 
                    required 
                    placeholder="Enter your email"
                  />
                </div>

                <button type="submit" className="sign-in-button" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <p className="back-to-login" onClick={() => setShowForgotPassword(false)}>
                  Back to Login
                </p>
              </form>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Login;
