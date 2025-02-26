import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // React Router for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
  
    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password
      });
  
      const { token, user } = response.data;  // Extract token and user data
  
      // Save token & role in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);  // Store the role from user object
  
      console.log("Stored Role:", localStorage.getItem('role')); // Debugging
  
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/dashboard');  // Redirect to admin dashboard
      } else {
        navigate('/homepage');   // Redirect to user homepage
      }
  
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
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
              <a href="#" className="forgot-password">Forgot password?</a>
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
      </div>
    </>
  );
};

export default Login;
