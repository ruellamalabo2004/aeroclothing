import React, { useState, useEffect } from 'react';
import { useWishlist } from '../Notifs/WishlistContext';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import CartModal from '../Notifs/CartModal';
import CartSidebar from '../Notifs/CartSidebar';
import { useCart } from '../Notifs/CartContext';
import axios from 'axios';

const ProfileWishlist = () => {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [enrichedWishlist, setEnrichedWishlist] = useState([]);
  const [fetchingDetails, setFetchingDetails] = useState(true);
  
  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  const handleRemove = (itemId) => async (e) => {
    e.stopPropagation();
    await removeFromWishlist(itemId);
  };

  // Fetch complete product details including sizes and colors
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!wishlist.length) {
        setFetchingDetails(false);
        setEnrichedWishlist([]);
        return;
      }

      setFetchingDetails(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch details for each wishlist item
        const enrichedItems = await Promise.all(
          wishlist.map(async (item) => {
            try {
              const response = await axios.get(`${API_URL}/products/${item.id}`, { headers });
              const productData = response.data;
              
              return {
                ...item,
                sizes: productData.sizes 
                  ? typeof productData.sizes === 'string'
                    ? productData.sizes.split(',').map(s => s.trim())
                    : Array.isArray(productData.sizes)
                      ? productData.sizes
                      : []
                  : [],
                colors: productData.colors
                  ? typeof productData.colors === 'string'
                    ? productData.colors.split(',').map(c => c.trim())
                    : Array.isArray(productData.colors)
                      ? productData.colors
                      : []
                  : [],
                imageHover: productData.image_2
                  ? `${BASE_IMAGE_URL}/${productData.image_2}`
                  : item.imagePreview || "/images/placeholder.png"
              };
            } catch (error) {
              console.error(`Error fetching details for product ${item.id}:`, error);
              return item; // Return original item if fetch fails
            }
          })
        );
        
        setEnrichedWishlist(enrichedItems);
      } catch (error) {
        console.error("Error enriching wishlist items:", error);
      } finally {
        setFetchingDetails(false);
      }
    };

    fetchProductDetails();
  }, [wishlist]);

  const handleAddToCart = (product) => (e) => {
    e.stopPropagation();
    // Find the enriched version of this product with sizes and colors
    const enrichedProduct = enrichedWishlist.find(item => item.id === product.id) || product;
    setSelectedProduct(enrichedProduct);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleAddToCartConfirmed = (cartItem) => {
    addToCart(cartItem);
    setIsCartOpen(true);
    setSelectedProduct(null);
  };

  return (
    <div className="profile-wishlist">
      <div className="profile-wishlist-section">
        <div className="profile-wishlist-header">
          <h2 className="profile-wishlist-title">My Wishlist</h2>
          <span className="profile-wishlist-item-count">{wishlist.length} items</span>
        </div>
        {isLoading || fetchingDetails ? (
          <p className="profile-wishlist-loading">Loading...</p>
        ) : enrichedWishlist.length === 0 ? (
          <p className="profile-wishlist-no-items">Your wishlist is empty.</p>
        ) : (
          <div className="profile-wishlist-items">
            {enrichedWishlist.map((item) => (
              <div key={item.id} className="profile-wishlist-item">
                <img
                  src={item.imagePreview}
                  alt={item.productName}
                  className="profile-wishlist-item-image"
                  onError={(e) => (e.target.src = '/images/placeholder.png')}
                />
                <div className="profile-wishlist-item-details">
                  <h3 className="profile-wishlist-item-name">{item.productName}</h3>
                  <p className="profile-wishlist-item-price">${item.price.toFixed(2)}</p>
                  <div className="profile-wishlist-item-actions">
                    <button
                      className="profile-wishlist-item-add"
                      onClick={handleAddToCart(item)}
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                    <button
                      className="profile-wishlist-item-remove"
                      onClick={handleRemove(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default ProfileWishlist; 