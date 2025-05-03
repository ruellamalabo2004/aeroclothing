import React from 'react';
import { Trash2 } from 'lucide-react';
import { useCart } from '../Notifs/CartContext';

const ViewCart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (itemId, size, color, delta) => {
    updateQuantity(itemId, size, color, delta);
  };

  const handleRemoveItem = (itemId, size, color) => {
    removeFromCart(itemId, size, color);
  };

  const calculateTotal = (price, quantity) => (price * quantity).toFixed(2);

  return (
    <div className="view-cart">
      {cart.length === 0 ? (
        <p className="view-cart__empty">Your cart is empty.</p>
      ) : (
        <>
          <div className="view-cart__header">
            <span>PRODUCT</span>
            <span>PRICE</span>
            <span>QUANTITY</span>
            <span>TOTAL</span>
          </div>
          <div className="view-cart__items">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="view-cart__item">
                <div className="view-cart__product">
                  <img
                    src={item.imagePreview}
                    alt={item.productName}
                    className="view-cart__item-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/placeholder.png";
                    }}
                  />
                  <div className="view-cart__item-details">
                    <span className="view-cart__item-name">{item.productName}</span>
                    {item.size && <p className="view-cart__item-option">Size: {item.size}</p>}
                    {item.color && <p className="view-cart__item-option">Color: {item.color}</p>}
                  </div>
                </div>
                <span className="view-cart__item-price">${item.price.toFixed(2)}</span>
                <div className="view-cart__quantity">
                  <button
                    className="view-cart__quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.size, item.color, -1)}
                    disabled={item.quantity === 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="view-cart__quantity-value">{item.quantity}</span>
                  <button
                    className="view-cart__quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.size, item.color, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span className="view-cart__item-total">${calculateTotal(item.price, item.quantity)}</span>
                <button
                  className="view-cart__remove"
                  onClick={() => handleRemoveItem(item.id, item.size, item.color)}
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewCart;