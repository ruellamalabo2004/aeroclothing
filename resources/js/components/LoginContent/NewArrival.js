import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import axios from 'axios';

const NewArrival = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found.');
        }

        const response = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Products API Response:", response.data);

        const productsData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.data)
          ? response.data.data
          : [];

        const updatedProducts = productsData
          .map((product) => ({
            id: product.id ?? `${Date.now()}-${Math.random()}`,
            created_at: product.created_at ?? new Date().toISOString(),
            imagePreview: product.image_1
              ? `${BASE_IMAGE_URL}/${product.image_1}`
              : "/images/placeholder.png",
            imageHover: product.image_2
              ? `${BASE_IMAGE_URL}/${product.image_2}`
              : product.image_1
              ? `${BASE_IMAGE_URL}/${product.image_1}`
              : "/images/placeholder.png",
            productName: product.product_name ?? "Unnamed Product",
            price: Number(product.price) || 0,
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 8); // Kept at 4 products as requested

        console.log("Parsed Products:", updatedProducts);

        setProducts(updatedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error.response?.data || error.message);
        setError("Failed to load new arrivals. Please try again later.");
        setLoading(false);

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchProducts();
  }, [navigate]);

  const handleAddToCart = (productId) => (e) => {
    e.stopPropagation();
    navigate(`/shop/${productId}`);
  };

  const handleWishlistToggle = (productId) => (e) => {
    e.stopPropagation();
    console.log(`Toggling wishlist for product ${productId}`);
  };

  const handleProductClick = (productId) => () => {
    navigate(`/shop/${productId}`);
  };

  if (loading) {
    return (
      <section className="new-arrival">
        <p>Loading new arrivals...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="new-arrival">
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="new-arrival">
      <div className="new-arrival__header">
        <div className="new-arrival__title-container">
          <h2 className="new-arrival__title">New Arrival Items</h2>
          <h3 className="new-arrival__subtitle">Discover great new styles for your little adventurers.</h3>
        </div>
      </div>

      {products.length === 0 ? (
        <p>No new arrivals available.</p>
      ) : (
        <div className="new-arrival__products">
          {products.map((product) => (
            <div key={product.id} className="new-arrival__product" onClick={handleProductClick(product.id)}>
              <div className="new-arrival__image-container">
                <img
                  src={product.imagePreview}
                  alt={product.productName}
                  className="new-arrival__image new-arrival__image-main"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/placeholder.png";
                  }}
                />
                <img
                  src={product.imageHover}
                  alt={`${product.productName} alternative view`}
                  className="new-arrival__image new-arrival__image-hover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = product.imagePreview || "/images/placeholder.png";
                  }}
                />
                <div className="new-arrival__buttons">
                  <button 
                    className="new-arrival__wishlist" 
                    onClick={handleWishlistToggle(product.id)}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={20} /> {/* Slightly larger than original */}
                  </button>
                  <button 
                    className="new-arrival__add-to-cart" 
                    onClick={handleAddToCart(product.id)}
                    aria-label="View product"
                  >
                    <ShoppingCart size={20} /> {/* Slightly larger than original */}
                  </button>
                </div>
              </div>
              <h3 className="new-arrival__name">{product.productName}</h3>
              <p className="new-arrival__price">${product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default NewArrival;