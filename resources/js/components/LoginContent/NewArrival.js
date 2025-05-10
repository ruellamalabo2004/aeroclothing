import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react'; // Added Star import
import axios from 'axios';
import CartModal from '../Notifs/CartModal';
import CartSidebar from '../Notifs/CartSidebar';
import { useCart } from '../Notifs/CartContext';
import { useWishlist } from '../Notifs/WishlistContext';

const NewArrival = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [reviewStats, setReviewStats] = useState({}); // Store review stats by product ID
  const { cart, addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, apiError } = useWishlist();

  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${API_URL}/products`, { headers });

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
            rating: product.rating || 0, // Added rating field
            sizes: product.sizes
              ? typeof product.sizes === 'string'
                ? product.sizes.split(',').map((s) => s.trim())
                : Array.isArray(product.sizes)
                ? product.sizes
                : []
              : [],
            colors: product.colors
              ? typeof product.colors === 'string'
                ? product.colors.split(',').map((c) => c.trim())
                : Array.isArray(product.colors)
                ? product.colors
                : []
              : [],
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 8);

        setProducts(updatedProducts);
        
        // Fetch review statistics for each product
        updatedProducts.forEach(product => {
          fetchProductReviews(product.id);
        });
        
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
  
  // Fetch reviews for a product and update review stats
  const fetchProductReviews = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/reviews/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const reviewsData = await response.json();
      
      // Calculate review statistics
      if (reviewsData && reviewsData.length > 0) {
        const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        const average = total / reviewsData.length;
        
        setReviewStats(prevStats => ({
          ...prevStats,
          [productId]: {
            count: reviewsData.length,
            average: Number(average.toFixed(1))
          }
        }));
      } else {
        // No reviews for this product
        setReviewStats(prevStats => ({
          ...prevStats,
          [productId]: { count: 0, average: 0 }
        }));
      }
    } catch (err) {
      console.error(`Error fetching reviews for product ${productId}:`, err);
      // Set empty stats on error
      setReviewStats(prevStats => ({
        ...prevStats,
        [productId]: { count: 0, average: 0 }
      }));
    }
  };

  const handleAddToCart = (product) => (e) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const handleWishlistToggle = (product) => async (e) => {
    e.stopPropagation();
    const productId = parseInt(product.id);
    if (wishlistLoading[productId]) return;

    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const isInWishlist = wishlist.some((item) => item.id === productId);
      if (isInWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist({
          id: productId,
          productName: product.productName,
          price: product.price,
          imagePreview: product.imagePreview,
        });
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleProductClick = (productId) => () => {
    navigate(`/product/${productId}`);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleAddToCartConfirmed = (cartItem) => {
    addToCart(cartItem);
    setIsCartOpen(true);
  };

  const toggleCartSidebar = () => {
    setIsCartOpen((prev) => !prev);
  };

  if (loading) return <section className="new-arrival"><p>Loading new arrivals...</p></section>;
  if (error) return <section className="new-arrival"><p>{error}</p></section>;

  return (
    <>
      <section className="new-arrival">
        {apiError && (
          <div className="new-arrival__error">
            {apiError.message}
            {apiError.status === 401 && (
              <button onClick={() => navigate('/login')}>Login to retry</button>
            )}
          </div>
        )}
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
              <div 
                key={product.id} 
                className="new-arrival__product" 
                onClick={handleProductClick(product.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleProductClick(product.id)(e);
                  }
                }}
              >
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
                      className={`new-arrival__wishlist ${wishlist.some((item) => item.id === parseInt(product.id)) ? 'active' : ''}`}
                      onClick={handleWishlistToggle(product)}
                      aria-label={wishlist.some((item) => item.id === parseInt(product.id)) ? 'Remove from wishlist' : 'Add to wishlist'}
                      disabled={wishlistLoading[product.id]}
                    >
                      <Heart
                        size={20}
                        fill={wishlist.some((item) => item.id === parseInt(product.id)) ? 'currentColor' : 'none'}
                      />
                    </button>
                    <button
                      className="new-arrival__add-to-cart"
                      onClick={handleAddToCart(product)}
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
                <h3 className="new-arrival__name">{product.productName}</h3>
                <p className="new-arrival__price">${product.price.toFixed(2)}</p>
                <div className="new-arrival__rating">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={16}
                      fill={index < (reviewStats[product.id]?.average || 0) ? '#FFD700' : 'none'}
                      stroke={index < (reviewStats[product.id]?.average || 0) ? '#FFD700' : '#ccc'}
                    />
                  ))}
                  <span className="new-arrival__rating-count">
                    ({reviewStats[product.id]?.count || 0})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <CartModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCartConfirmed}
        />
      )}

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};

export default NewArrival;