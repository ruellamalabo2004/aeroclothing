import React, { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in with:', username, password);
  };

  return (
    <>
      {/* Header */}
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

      {/* Right-Side Image */}
      <div className="right-image-container">
        <img src="/imgs/design2.svg" alt="Right Image" className="right-image" />
      </div>

      {/* Left-Side Image */}
      <div className="left-image-container">
        <img src="/imgs/design1.svg" alt="Left Image" className="left-image" />
      </div>

      {/* Login Container */}
      <div className="login-container">
        <h2>WELCOME BACK!</h2>
        <p>Enter your credentials for login</p>

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input 
                type="email" 
                className="email-input"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
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

            <button type="submit" className="sign-in-button">Sign In</button>

            {/* Separator Line */}
            <div className="separator"></div>

            {/* Create Account Section */}
            <p className="create-account-text">Don't have an account?</p>
            <button className="create-account-button">Create Account</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
