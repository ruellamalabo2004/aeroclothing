import React from 'react';
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

  const handleCheckout = () => {
    console.log('Cart Items before checkout:', cartItems); // Debug
    if (cartItems.length > 0) {
      navigate('/checkout', { state: { cartItems } });
    } else {
      alert('Your cart is empty. Add items before checking out.');
    }
  };

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
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img
                      src={item.imagePreview || '/default-image.jpg'}
                      alt={item.productName || 'Product'}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h3>{item.productName || 'Unnamed Product'}</h3>
                      <p>₱{item.price || 0}</p>
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
                      onClick={removeFromCart(item.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="checkout-btn"
                onClick={handleCheckout}
              >
                PROCEED TO CHECKOUT
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;