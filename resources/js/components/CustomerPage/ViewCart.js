import React from 'react';
import { useCart } from '../Notifs/CartContext';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const ViewCart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, size, color, delta) => {
    const currentItem = cart.find((i) => i.id === itemId && i.size === size && i.color === color);
    if (!currentItem) {
      console.error('Item not found in cart');
      return;
    }
    const newQuantity = Math.max(1, currentItem.quantity + delta);
    if (newQuantity !== currentItem.quantity) {
      updateQuantity(itemId, size, color, newQuantity);
    }
  };

  const handleRemoveItem = (itemId, size, color) => {
    removeFromCart(itemId, size, color);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleUpdateCart = () => {
    console.log('Cart updated');
  };

  const calculateTotal = (price, quantity) => (price * quantity).toFixed(2);

  return (
    <div className="view-cart">
      {cart.length === 0 ? (
        <p className="view-cart__empty">Your cart is empty.</p>
      ) : (
        <>
          <div className="view-cart__items">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="view-cart__item">
                <img
                  src={item.imagePreview}
                  alt={item.productName}
                  className="view-cart__item-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/placeholder.png";
                  }}
                />
                <div className="view-cart__details">
                  <div className="view-cart__product-info">
                    <h3 className="view-cart__item-name">{item.productName}</h3>
                    <p className="view-cart__item-option">Size: {item.size}</p>
                    <p className="view-cart__item-option">Color: {item.color}</p>
                    <p className="view-cart__item-price">Price: ${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="view-cart__quantity-controls">
                  <button
                    className="view-cart__quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.size, item.color, -1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="view-cart__quantity-value">{item.quantity}</span>
                  <button
                    className="view-cart__quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.size, item.color, 1)}
                  >
                    +
                  </button>
                  <span className="view-cart__item-total">Total: ${calculateTotal(item.price, item.quantity)}</span>
                  <button
                    className="view-cart__remove-btn"
                    onClick={() => handleRemoveItem(item.id, item.size, item.color)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="view-cart__footer">
            <button className="view-cart__continue-btn" onClick={handleContinueShopping}>
              ← Continue Shopping
            </button>
            <button className="view-cart__update-btn" onClick={handleUpdateCart}>
              Update Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewCart;