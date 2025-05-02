// src/Notifs/CartModal.js
import React, { useState } from 'react';
import { useCart } from '../Notifs/CartContext';

// Color mapping helper function
const getColorHexCode = (colorName) => {
  const colorMap = {
    'Red': '#FF0000',
    'Blue': '#0000FF',
    'Black': '#000000',
    'Green': '#008000',
    'Gray': '#808080',
    'White': '#FFFFFF',
    'Yellow': '#FFFF00',
    'Purple': '#800080',
    'Pink': '#FFC0CB',
    'Orange': '#FFA500',
    'Brown': '#A52A2A',
    'Navy': '#000080',
    'Teal': '#008080',
    'Maroon': '#800000',
    'Olive': '#808000',
    'Cyan': '#00FFFF',
    'Silver': '#C0C0C0',
    'Gold': '#FFD700',
    'Beige': '#F5F5DC',
    'Coral': '#FF7F50',
    'Turquoise': '#40E0D0',
    'Lavender': '#E6E6FA',
    'Indigo': '#4B0082',
  };
  
  // If the color exists in our map, return it, otherwise default to a light gray
  return colorMap[colorName] || '#CCCCCC';
};

const CartModal = ({ product, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Using the new structure from ViewProduct.js
  const availableSizes = product.sizes || [];
  const availableColors = product.colors || [];

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if ((availableSizes.length > 0 && !selectedSize) || 
        (availableColors.length > 0 && !selectedColor)) {
      alert('Please select a size and color.');
      return;
    }
    
    const cartItem = {
      id: parseInt(product.id),
      productName: product.productName,
      price: product.price,
      imagePreview: product.imagePreview,
      selectedSize: selectedSize,
      selectedColor: selectedColor,
      quantity,
    };
    
    addToCart(cartItem);
    onAddToCart && onAddToCart(cartItem); // Keep this for backward compatibility
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

        {availableSizes.length > 0 && (
          <div className="cart-modal__option">
            <label className="cart-modal__label">Size</label>
            <div className="cart-modal__sizes">
              {availableSizes.map((size) => (
                <button
                  key={size.id || size.size_id}
                  className={`cart-modal__size-btn ${selectedSize === size.size_name ? 'cart-modal__size-btn--selected' : ''}`}
                  onClick={() => handleSizeChange(size.size_name)}
                >
                  {size.size_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {availableColors.length > 0 && (
          <div className="cart-modal__option">
            <label className="cart-modal__label">Color</label>
            <div className="cart-modal__colors">
              {availableColors.map((color) => (
                <div
                  key={color.id || color.color_id}
                  className={`cart-modal__color-btn ${selectedColor === color.color_name ? 'cart-modal__color-btn--selected' : ''}`}
                  onClick={() => handleColorSelect(color.color_name)}
                >
                  <div 
                    className="cart-modal__color-btn-circle"
                    style={{ 
                      backgroundColor: getColorHexCode(color.color_name) 
                    }}
                  ></div>
                  <span className="cart-modal__color-btn-label">{color.color_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
          disabled={(availableSizes.length > 0 && !selectedSize) || 
                   (availableColors.length > 0 && !selectedColor)}
        >
          {((availableSizes.length === 0 || selectedSize) && 
            (availableColors.length === 0 || selectedColor)) 
            ? 'Add to Cart' : 'Please Select Options'}
        </button>
      </div>
    </div>
  );
};

export default CartModal;