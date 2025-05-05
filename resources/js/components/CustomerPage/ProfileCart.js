import React from 'react';
import { useCart } from '../Notifs/CartContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';

const ProfileCart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, size, color, delta) => {
    const currentItem = cart.find((i) => i.id === itemId && i.size === size && i.color === color);
    if (!currentItem) return;
    const newQuantity = Math.max(1, currentItem.quantity + delta);
    if (newQuantity !== currentItem.quantity) {
      updateQuantity(itemId, size, color, newQuantity);
    }
  };

  const handleRemoveItem = (itemId, size, color) => {
    removeFromCart(itemId, size, color);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const calculateTotal = (price, quantity) => (price * quantity).toFixed(2);
  const calculateCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className="cart">
      <div className="cart-section">
        <h2>My Cart</h2>
        {cart.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="cart-item">
                <div className="cart-item-image-container">
                  <img src={item.imagePreview} alt={item.productName} className="cart-item-image" />
                </div>
                <div className="cart-item-details">
                  <h3>{item.productName}</h3>
                  <p>Size: {item.size}</p>
                  <p>Color: {item.color}</p>
                </div>
                <div className="cart-item-quantity">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.size, item.color, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.id, item.size, item.color, 1)}>
                    <Plus size={14} />
                  </button>
                </div>
                <div className="cart-item-price">${calculateTotal(item.price, item.quantity)}</div>
                <button
                  className="cart-item-remove"
                  onClick={() => handleRemoveItem(item.id, item.size, item.color)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <div className="cart-total">
              <span>Total</span>
              <span>${calculateCartTotal()}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCart;