// src/Notifs/CartSidebar.js
import React from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../Notifs/CartContext';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const API_URL = "http://127.0.0.1:8000/api";

  // Update the cart quantity by sending the full quantity value
  const handleQuantityChange = async (itemId, size, color, delta) => {
    const updatedQuantity = getUpdatedQuantity(itemId, size, color, delta);

    // Always update the local state first
    updateQuantity(itemId, size, color, delta);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post(
          `${API_URL}/cart/update`,
          { product_id: itemId, size, color, quantity: updatedQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error updating quantity:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    }
  };

  // Get new quantity based on delta
  const getUpdatedQuantity = (itemId, size, color, delta) => {
    const item = cart.find(
      (i) => i.id === itemId && i.size === size && i.color === color
    );
    return item ? item.quantity + delta : 1;
  };

  // Remove item from cart and server
  const handleRemoveItem = async (itemId, size, color) => {
    removeFromCart(itemId, size, color);
    const token = localStorage.getItem('token');

    if (token) {
      try {
        await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { size, color },
        });
      } catch (error) {
        console.error('Error removing item:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className={`cart-sidebar ${isOpen ? 'cart-sidebar--open' : ''}`}>
      <div className="cart-sidebar__header">
        <div className="cart-sidebar__title-container">
          <ShoppingCart size={20} className="cart-sidebar__icon" />
          <h2 className="cart-sidebar__title">Your Cart ({cart.length} items)</h2>
        </div>
        <button className="cart-sidebar__close" onClick={onClose} aria-label="Close cart sidebar">
          ×
        </button>
      </div>

      <div className="cart-sidebar__items">
        {cart.length === 0 ? (
          <p className="cart-sidebar__empty">Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="cart-sidebar__item">
              <img
                src={item.imagePreview}
                alt={item.productName}
                className="cart-sidebar__item-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder.png";
                }}
              />
              <div className="cart-sidebar__item-details">
                <h3 className="cart-sidebar__item-name">{item.productName}</h3>
                <p className="cart-sidebar__item-option">Size: {item.size}</p>
                <p className="cart-sidebar__item-option">Color: {item.color}</p>
                <div className="cart-sidebar__quantity">
                  <button
                    className="cart-sidebar__quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.size, item.color, -1)}
                    disabled={item.quantity === 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="cart-sidebar__quantity-value">{item.quantity}</span>
                  <button
                    className="cart-sidebar__quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.size, item.color, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="cart-sidebar__item-actions">
                <p className="cart-sidebar__item-price">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  className="cart-sidebar__remove"
                  onClick={() => handleRemoveItem(item.id, item.size, item.color)}
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-sidebar__footer">
          <div className="cart-sidebar__subtotal">
            <span className="cart-sidebar__subtotal-label">Subtotal</span>
            <span className="cart-sidebar__subtotal-value">${calculateSubtotal().toFixed(2)}</span>
          </div>
          <button className="cart-sidebar__checkout-btn" onClick={handleProceedToCheckout}>
            Proceed to Checkout
          </button>
          <p className="cart-sidebar__note">Shipping and taxes calculated at checkout</p>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;
