import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CartSidebar = ({
  isCartVisible,
  setIsCartVisible,
  cartItems,
  cartCount,
  increaseCartQuantity,
  decreaseCartQuantity,
  removeFromCart,
  navigate,
}) => {
  const handleCloseCart = () => setIsCartVisible(false);
  const handleStartShopping = () => {
    navigate('/shop');
    setIsCartVisible(false);
  };

  const handleViewCart = () => {
    navigate('/profile/cart');
    setIsCartVisible(false);
  };

  const handleCheckout = () => {
    console.log('Cart Items before checkout:', cartItems);
    if (cartItems.length > 0) {
      navigate('/checkout', { state: { cartItems } });
    } else {
      alert('Your cart is empty. Add items before checking out.');
    }
  };

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

  return (
    <div className={`cart-sidebar ${isCartVisible ? 'active' : ''}`}>
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
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="cart-item">
                    <img
                      src={item.imagePreview || '/default-image.jpg'}
                      alt={item.productName || 'Product'}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h3>{item.productName || 'Unnamed Product'}</h3>
                      <p className="price">₱{item.price || 0}</p>
                      <p className="size">Size: {item.size || 'Not specified'}</p>
                      <p className="color">Color: {item.color || 'Not specified'}</p>
                      <div className="quantity-control">
                        <button
                          onClick={() => decreaseCartQuantity(item.id)}
                          disabled={item.quantity === 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseCartQuantity(item.id)}>+</button>
                      </div>
                    </div>
                    <button
                      className="remove-item"
                      onClick={removeFromCart(item.id, item.size, item.color)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-actions">
                <button className="view-cart-btn" onClick={handleViewCart}>
                  VIEW CART
                </button>
                <button className="checkout-btn" onClick={handleCheckout}>
                  CHECKOUT
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;