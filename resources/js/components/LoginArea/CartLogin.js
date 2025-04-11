import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CartLogin = ({
  isCartVisible,
  setIsCartVisible,
  cartItems,
  cartCount,
  removeFromCart
}) => {
  const navigate = useNavigate();
  const [showScrollbar, setShowScrollbar] = useState(false);
  const cartItemsRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (cartItemsRef.current) {
        const { scrollHeight, clientHeight } = cartItemsRef.current;
        setShowScrollbar(scrollHeight > clientHeight);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [cartItems]);

  const handleCloseCart = () => setIsCartVisible(false);

  const handleStartShopping = () => {
    navigate('/shop-browse');
    setIsCartVisible(false);
  };

  const handleViewCart = () => {
    navigate('/cart');
    setIsCartVisible(false);
  };

  const handleCheckout = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
    setIsCartVisible(false);
  };

  return (
    <div className={`cart-login ${isCartVisible ? 'active' : ''}`}>
      <div className="cart-content">
        <div className="cart-header">
          <h2>CART ({cartCount})</h2>
          <span className="close-cart" onClick={handleCloseCart}>×</span>
        </div>
        <div className={`cart-body ${cartItems.length === 0 ? 'empty' : ''}`}>
          {cartItems.length === 0 ? (
            <>
              <div className="empty-cart-container">
                <img src="/imgs/emptycart.svg" alt="Empty Cart" className="empty-cart-icon" />
                <p>Your cart is currently empty.</p>
              </div>
              <button className="start-shopping-btn" onClick={handleStartShopping}>
                START SHOPPING
              </button>
            </>
          ) : (
            <>
              <div
                className={`cart-items ${showScrollbar ? 'show-scrollbar' : 'hide-scrollbar'}`}
                ref={cartItemsRef}
              >
                {cartItems.map((item, index) => (
                  <div key={index} className="cart-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <p className="price">₱{item.price}</p>
                      <p className="size">Size: {item.size}</p>
                      <p className="color">Color: {item.color}</p>
                      <p className="quantity">Quantity: {item.quantity}</p>
                    </div>
                    <button
                      className="remove-item"
                      onClick={() => removeFromCart(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <p>Total: ₱{cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)}</p>
              </div>
              <div className="cart-actions">
                <button className="view-cart-btn" onClick={handleViewCart}>
                  VIEW CART
                </button>
                <button className="checkout-btn" onClick={handleCheckout}>
                  {localStorage.getItem('token') ? 'CHECKOUT' : 'LOGIN TO CHECKOUT'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartLogin; 

