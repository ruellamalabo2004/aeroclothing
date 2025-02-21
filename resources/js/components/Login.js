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
      <header className="login-header">
        <div className="logo-container">
          <img src="/imgs/mainlogo.svg" alt="Logo" className="logo" />
        </div>
        <nav className="nav-links">
          <a href="#home">HOME</a>
          <a href="#shop">SHOP</a>
          <a href="#about">ABOUT US</a>
          <a href="#support" className="support-link">SUPPORT</a>
        </nav>
        <div className="header-icons">
          <span className="search-icon">🔍</span>
          <span className="wishlist-icon">❤️</span>
          <span className="cart-icon">🛒</span>
          <button className="login-button">Login</button>
        </div>
      </header>

      {/* Login Container */}
      <div className="login-container">
        <h2>Welcome back!</h2>
        <p>Enter your credentials for login</p>

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div>
              <input 
                type="email" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="Email"
              />
            </div>
            <div>
              <input 
                type="password" 
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
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
