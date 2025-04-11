import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartLogin from '../LoginArea/CartLogin';

const LoginHeader = () => {
  const navigate = useNavigate();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Load cart items from localStorage
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(savedCart);
      setCartCount(savedCart.reduce((total, item) => total + item.quantity, 0));
    };

    loadCart();

    // Listen for storage events to update cart when changed from other tabs
    window.addEventListener('storage', loadCart);

    return () => {
      window.removeEventListener('storage', loadCart);
    };
  }, []);

  const handleSupportToggle = (e) => {
    e.preventDefault();
    setIsSupportOpen(!isSupportOpen);
    if (isCartOpen) setIsCartOpen(false);
  };

  const handleCartToggle = (e) => {
    e.preventDefault();
    setIsCartOpen(!isCartOpen);
    if (isSupportOpen) setIsSupportOpen(false);
  };

  const removeFromCart = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
    setCartCount(newCart.reduce((total, item) => total + item.quantity, 0));
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const supportItems = [
    { label: "ORDER & PAYMENT", path: "/customer/support/order-payment" },
    { label: "SHIPPING", path: "/customer/support/shipping" },
    { label: "RETURNS", path: "/customer/support/returns" },
    { label: "CONTACT US", path: "/customer/support/contact-us" },
    { label: "TERMS AND SERVICE", path: "/customer/support/terms-and-service" },
    { label: "FAQS", path: "/customer/support/faqs" },
  ];

  return (
    <header className="login-header">
      <div className="logo-container">
        <Link to="/">
          <img src="/imgs/logo.svg" alt="Logo" className="logo" />
        </Link>
      </div>
      <nav className="nav-links">
        <Link to="/home">HOME</Link>
        <Link to="/shop-browse">SHOP</Link>
        <Link to="/about">ABOUT US</Link>
        <div className="support-container">
          <a 
            href="/support" 
            className={`support-link ${isSupportOpen ? 'active' : ''}`}
            onClick={handleSupportToggle}
          >
            SUPPORT
            <img src="/imgs/DROPDOWN.SVG" alt="Dropdown" className="dropdown-icon" />
          </a>
          <div className={`support-dropdown ${!isSupportOpen ? 'hidden' : ''}`}>
            {supportItems.map((item, index) => (
              <a key={index} href={item.path} className="support-item">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
      <div className="header-icons">
        <img src="/imgs/Search.svg" alt="Search" className="header-icon" />
        <img src="/imgs/Wish.svg" alt="Wishlist" className="header-icon" />
        <div className="cart-container">
          <div className="cart-icon-wrapper" onClick={handleCartToggle}>
            <img src="/imgs/Cart.svg" alt="Cart" className="header-icon" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </div>
          <CartLogin
            isCartVisible={isCartOpen}
            setIsCartVisible={setIsCartOpen}
            cartItems={cartItems}
            cartCount={cartCount}
            removeFromCart={removeFromCart}
          />
        </div>
        <button className="login-button" onClick={handleLoginClick}>Login</button>
      </div>
    </header>
  );
};

export default LoginHeader; 
