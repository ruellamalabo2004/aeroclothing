import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SecondContent = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${API_URL}/products`, {
          headers,
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
            imagePreview: product.image_2
              ? `${BASE_IMAGE_URL}/${product.image_2}`
              : "/images/placeholder.png",
            productName: product.product_name ?? "Unnamed Product",
            link: `/shop/${product.id}`,
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10);

        console.log("Parsed Products:", updatedProducts);

        setProducts(updatedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error.response?.data || error.message);
        setError("Failed to load products. Please try again later.");
        setLoading(false);

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchProducts();
  }, [navigate]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleProductClick = (productId) => () => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <section className="second-content">
        <p>Loading products...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="second-content">
        <p>{error}</p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="second-content">
        <h2 className="second-content__title">EXPLORE AERO'S CLOTHING</h2>
        <p>No recent products available.</p>
      </section>
    );
  }

  const totalProducts = products.length;
  const leftIndex = (currentIndex - 1 + totalProducts) % totalProducts;
  const rightIndex = (currentIndex + 1) % totalProducts;

  return (
    <section className="second-content">
      <div className="second-content__header">
        <h2 className="second-content__title">EXPLORE AERO'S CLOTHING</h2>
      </div>
      
      <div className="second-content__carousel">
        <button 
          className="second-content__nav-button second-content__nav-prev" 
          onClick={handlePrevious}
          aria-label="Previous product"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="second-content__products">
          <div
            className="second-content__product second-content__product--left"
            onClick={handleProductClick(products[leftIndex].id)}
          >
            <div className="second-content__image-container">
              <img 
                src={products[leftIndex].imagePreview} 
                alt={products[leftIndex].productName} 
                className="second-content__image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder.png";
                }}
              />
            </div>
          </div>

          <div
            className="second-content__product second-content__product--center"
            onClick={handleProductClick(products[currentIndex].id)}
          >
            <div className="second-content__image-container">
              <img 
                src={products[currentIndex].imagePreview} 
                alt={products[currentIndex].productName} 
                className="second-content__image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder.png";
                }}
              />
            </div>
          </div>

          <div
            className="second-content__product second-content__product--right"
            onClick={handleProductClick(products[rightIndex].id)}
          >
            <div className="second-content__image-container">
              <img 
                src={products[rightIndex].imagePreview} 
                alt={products[rightIndex].productName} 
                className="second-content__image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder.png";
                }}
              />
            </div>
          </div>
        </div>
        
        <button 
          className="second-content__nav-button second-content__nav-next" 
          onClick={handleNext}
          aria-label="Next product"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      <div className="second-content__product-info">
        <h3 className="second-content__product-name">{products[currentIndex].productName}</h3>
      </div>
    </section>
  );
};

export default SecondContent;