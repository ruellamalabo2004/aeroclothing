// src/Notifs/CartModal.js
import React, { useState } from 'react';
import { useCart } from '../Notifs/CartContext';

const CartModal = ({ product, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const colorMap = {
    Red: '#FF0000',
    Blue: '#0000FF',
    Black: '#000000',
    Green: '#008000',
    Gray: '#808080',
    White: '#FFFFFF',
    Yellow: '#FFFF00',
  };

  const sizes = product.sizes || [];
  const colors = (product.colors || []).map((colorName) => ({
    name: colorName,
    value: colorMap[colorName] || '#000000',
  }));

  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color.');
      return;
    }
    const cartItem = {
      ...product,
      selectedSize,
      selectedColor,
      quantity,
    };
    addToCart(cartItem);
    onAddToCart(cartItem); // Keep this for backward compatibility
    onClose();
  };

  return (
    <div className="cart-modal__overlay">
      <div className="cart-modal">
        <button className="cart-modal__close" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        <h2 className="cart-modal__title">Product Options</h2>
        <div className="cart-modal__product-info">
          <img
            src={product.imagePreview}
            alt={product.productName}
            className="cart-modal__product-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/placeholder.png";
            }}
          />
          <div className="cart-modal__product-details">
            <h3 className="cart-modal__product-name">{product.productName}</h3>
            <p className="cart-modal__product-price">${product.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="cart-modal__option">
          <label className="cart-modal__label">Size</label>
          <select
            className="cart-modal__select"
            value={selectedSize}
            onChange={handleSizeChange}
          >
            <option value="" disabled>Select size</option>
            {sizes.length > 0 ? (
              sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))
            ) : (
              <option value="" disabled>No sizes available</option>
            )}
          </select>
        </div>

        <div className="cart-modal__option">
          <label className="cart-modal__label">Color</label>
          <div className="cart-modal__color-grid">
            {colors.length > 0 ? (
              colors.map((color) => (
                <div key={color.name} className="cart-modal__color-item">
                  <div
                    className={`cart-modal__color ${
                      selectedColor === color.name ? 'cart-modal__color--selected' : ''
                    } ${color.name.toLowerCase() === 'white' ? 'cart-modal__color--white' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorSelect(color.name)}
                    title={color.name}
                  />
                  <span className="cart-modal__color-label">{color.name.toUpperCase()}</span>
                </div>
              ))
            ) : (
              <span>No colors available</span>
              
            )}
          </div>
        </div>

        <div className="cart-modal__option">
          <label className="cart-modal__label">Quantity</label>
          <div className="cart-modal__quantity">
            <button
              className="cart-modal__quantity-btn"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity === 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="cart-modal__quantity-value">{quantity}</span>
            <button
              className="cart-modal__quantity-btn"
              onClick={() => handleQuantityChange(1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <button
          className="cart-modal__add-btn"
          onClick={handleAddToCart}
          disabled={!selectedSize || !selectedColor}
        >
          {selectedSize && selectedColor ? 'Add to Cart' : 'Please Select Options'}
        </button>
      </div>
    </div>
  );
};

export default CartModal;