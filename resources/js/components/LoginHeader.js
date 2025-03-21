import React from 'react';

const LoginHeader = () => {
  return (
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
  );
};

export default LoginHeader;