import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const ViewModal = ({ isOpen, onClose, productId, token }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
    }
  }, [isOpen, productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduct(res.data);
    } catch (err) {
      console.error('Failed to fetch product details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__overlay" onClick={onClose}></div>
      <div className="modal__content">
        <div className="modal__header">
          <h2 className="modal__title">Product Details</h2>
          <button className="modal__close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal__body">
          {loading ? (
            <div className="modal__loading">Loading...</div>
          ) : product ? (
            <div className="product-details">
              <div className="product-details__images">
                {product.image_1 && (
                  <img
                    src={`http://localhost:8000/storage/${product.image_1}`}
                    alt={product.product_name}
                    className="product-details__image"
                  />
                )}
              </div>
              <div className="product-details__info">
                <div className="product-details__group">
                  <h3 className="product-details__label">Product Name</h3>
                  <p className="product-details__value">{product.product_name}</p>
                </div>
                <div className="product-details__group">
                  <h3 className="product-details__label">Category</h3>
                  <p className="product-details__value">{product.category?.name || 'N/A'}</p>
                </div>
                <div className="product-details__group">
                  <h3 className="product-details__label">Type</h3>
                  <p className="product-details__value">{product.product_type}</p>
                </div>
                <div className="product-details__group">
                  <h3 className="product-details__label">Price</h3>
                  <p className="product-details__value">
                    ${parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="product-details__group">
                  <h3 className="product-details__label">Colors</h3>
                  <p className="product-details__value">
                    {Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || 'N/A'}
                  </p>
                </div>
                <div className="product-details__group">
                  <h3 className="product-details__label">Sizes</h3>
                  <p className="product-details__value">
                    {Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || 'N/A'}
                  </p>
                </div>
                <div className="product-details__group">
                  <h3 className="product-details__label">Status</h3>
                  <span className={`products__status products__status--${product.status.toLowerCase()}`}>
                    {product.status.toUpperCase()}
                  </span>
                </div>
                <div className="product-details__group">
                  <h3 className="product-details__label">Description</h3>
                  <p className="product-details__value">{product.description || 'No description available'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="modal__error">Failed to load product details</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewModal; 