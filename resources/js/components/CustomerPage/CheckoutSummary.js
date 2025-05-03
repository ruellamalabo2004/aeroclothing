import React from 'react';
import { useCart } from '../Notifs/CartContext';
import { useNavigate } from 'react-router-dom';

const CheckoutSummary = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const shippingCost = 5.99;
  const total = calculateSubtotal() + shippingCost;

  const handleViewCart = () => {
    navigate('/cart');
  };

  return (
    <div className="checkout-summary">
      <div className="summary-header">
        <h2>Order Summary</h2>
      </div>
      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <div className="summary-items">
          {cart.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="summary-item">
              <img
                src={item.imagePreview || '/images/placeholder.png'}
                alt={item.productName}
                className="item-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder.png';
                }}
              />
              <div className="item-details">
                <h3>{item.productName}</h3>
                <div className="item-specs">
                  <p>Qty: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                  <p>Color: {item.color}</p>
                </div>
              </div>
              <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
      <div className="summary-totals">
        <div className="total-row">
          <span>Subtotal</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>Shipping</span>
          <span>${shippingCost.toFixed(2)}</span>
        </div>
        <div className="total-row total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <div className="summary-actions">
        <button className="view-cart-btn" onClick={handleViewCart}>View Cart</button>
        <button className="confirm-btn">Confirm Checkout</button>
      </div>
      <p className="terms-note">
        By placing your order, you agree to our Terms and Conditions and Privacy Policy.
      </p>
    </div>
  );
};

export default CheckoutSummary;