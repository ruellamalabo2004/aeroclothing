import React from 'react';
import { useCart } from '../Notifs/CartContext';
import { useNavigate } from 'react-router-dom';

const CartSummary = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  // Placeholder for shipping (since no backend)
  const shipping = 'Calculated at checkout';
  // Total (assuming no taxes for now, adjust as needed)
  const total = subtotal;

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-summary">
      <h2 className="cart-summary__title">Order Summary</h2>
      <div className="cart-summary__row">
        <span>Subtotal</span>
        <span>${subtotal}</span>
      </div>
      <div className="cart-summary__row">
        <span>Shipping</span>
        <span>{shipping}</span>
      </div>
      <div className="cart-summary__row cart-summary__total">
        <span>Total including taxes</span>
        <span>${total}</span>
      </div>
      <button className="cart-summary__checkout-btn" onClick={handleProceedToCheckout}>
        Proceed to Checkout →
      </button>
    </div>
  );
};

export default CartSummary;