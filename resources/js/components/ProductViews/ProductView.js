import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from '../HeaderArea/CartSidebar';

const ProductView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

  const supportItems = [
    { label: "ORDER & PAYMENT", path: "/customer/support/order-payment" },
    { label: "SHIPPING", path: "/customer/support/shipping" },
    { label: "RETURNS", path: "/customer/support/returns" },
    { label: "CONTACT US", path: "/customer/support/contact-us" },
    { label: "TERMS AND SERVICE", path: "/customer/support/terms-and-service" },
  ];

  const profileDropdownItems = [
    { label: "My Profile", path: "/profile" },
    { label: "My Orders", path: "/profile/orders" },
    { label: "Logout", path: "#", onClick: handleLogout },
  ];

  const notifications = [
    { id: 1, message: "Your order #1234 has been shipped!", time: "2 hours ago" },
    { id: 2, message: "New collection available now!", time: "5 hours ago" },
    { id: 3, message: "20% off sale ends tomorrow!", time: "1 day ago" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [productResponse, profileResponse, wishlistResponse, cartResponse, reviewsResponse] = await Promise.all([
          axios.get(`${API_URL}/products/${productId}`, config),
          axios.get(`${API_URL}/profile`, config),
          axios.get(`${API_URL}/wishlist`, config),
          axios.get(`${API_URL}/cart`, config),
          axios.get(`${API_URL}/reviews/${productId}`, config),
        ]);

        if (!productResponse.data || Object.keys(productResponse.data).length === 0) {
          throw new Error("No product data returned");
        }
        setProduct(productResponse.data);
        setSelectedSize(productResponse.data.sizes?.[0] || "");
        setSelectedColor(productResponse.data.colors?.[0] || "");

        const profileData = profileResponse.data.profile || {};
        const user = {
          id: profileResponse.data.user.id,
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          email: profileResponse.data.user?.email || "",
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : "/imgs/Profile.svg",
        };
        setUserProfile(user);

        const wishlistData = wishlistResponse.data.data || wishlistResponse.data || [];
        const detailedWishlist = wishlistData.map(item => ({
          id: item.product_id,
          productName: item.product?.product_name || "Unknown Product",
          price: item.product?.price || 0,
          imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : "/default-image.jpg",
          created_at: item.created_at || new Date().toISOString(),
        }));
        setWishlistedItems(detailedWishlist);
        setIsWishlisted(detailedWishlist.some(item => item.id === parseInt(productId)));

        const cartData = cartResponse.data.data || cartResponse.data || [];
        const detailedCart = cartData.map(item => ({
          id: item.product_id,
          productName: item.product?.product_name || "Unknown Product",
          price: item.product?.price || 0,
          imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : "/default-image.jpg",
          quantity: item.quantity || 1,
          size: item.size || "Not specified",
          color: item.color || "Not specified",
        }));
        setCartItems(detailedCart);

        setReviews(reviewsResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load product or reviews");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [productId, navigate]);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleSizeSelect = (size) => setSelectedSize(size);
  const handleColorSelect = (color) => setSelectedColor(color);

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem("token");
    const userId = userProfile?.id;
    if (!token || !userId) return;

    try {
      if (isWishlisted) {
        await axios.delete(`${API_URL}/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistedItems(prev => prev.filter(item => item.id !== parseInt(productId)));
      } else {
        await axios.post(
          `${API_URL}/wishlist`,
          { user_id: userId, product_id: productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistedItems(prev => [
          {
            id: parseInt(productId),
            productName: product.product_name,
            price: product.price,
            imagePreview: product.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : "/default-image.jpg",
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      setIsWishlisted(prev => !prev);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const userId = userProfile?.id;
    if (!token || !userId) return;

    try {
      await axios.post(
        `${API_URL}/cart/add`,
        { 
          user_id: userId, 
          product_id: productId, 
          quantity, 
          size: selectedSize, 
          color: selectedColor 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newCartItem = {
        id: parseInt(productId),
        productName: product.product_name,
        price: product.price,
        imagePreview: product.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : "/default-image.jpg",
        quantity,
        size: selectedSize,
        color: selectedColor,
      };
      setCartItems(prev => {
        const existing = prev.find(item => 
          item.id === newCartItem.id && 
          item.size === newCartItem.size && 
          item.color === newCartItem.color
        );
        if (existing) {
          return prev.map(item =>
            item.id === newCartItem.id && 
            item.size === newCartItem.size && 
            item.color === newCartItem.color
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, newCartItem];
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleBuyNow = () => {
    navigate("/checkout", { state: { product, quantity, selectedSize, selectedColor } });
  };

  const increaseCartQuantity = (itemId) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseCartQuantity = (itemId) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const removeFromCart = (itemId) => async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setWishlistedItems([]);
      setCartItems([]);
      navigate("/login");
      setIsProfileDropdownOpen(false);
    }
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest(".notification-container") && !e.target.closest(".header-icon")) setIsNotificationOpen(false);
    if (!e.target.closest(".wishlist-container") && !e.target.closest(".header-icon")) setIsWishlistOpen(false);
    if (!e.target.closest(".support-container") && !e.target.closest(".support-link")) setIsSupportOpen(false);
    if (!e.target.closest(".cart-sidebar") && !e.target.closest(".header-icon")) setIsCartVisible(false);
    if (!e.target.closest(".profile-container") && !e.target.closest(".profile-button")) setIsProfileDropdownOpen(false);
  };

  useEffect(() => {
    if (isNotificationOpen || isWishlistOpen || isSupportOpen || isCartVisible || isProfileDropdownOpen) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isNotificationOpen, isWishlistOpen, isSupportOpen, isCartVisible, isProfileDropdownOpen]);

  const getAverageRating = () => {
    if (!reviews.length) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  };

  const maskCustomerName = (firstName, lastName) => {
    if (!firstName && !lastName) return "Anonymous";
    const maskedFirst = firstName ? `${firstName.slice(0, 2)}${'*'.repeat(Math.max(0, firstName.length - 2))}` : "";
    const maskedLast = lastName ? `${lastName.slice(0, 2)}${'*'.repeat(Math.max(0, lastName.length - 2))}` : "";
    return `${maskedFirst} ${maskedLast}`.trim();
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return (
      <div className="stars-container">
        {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="star full">★</span>)}
        {halfStar ? <span className="star half">★</span> : null}
        {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="star empty">☆</span>)}
      </div>
    );
  };

  if (!product && !error) return <div className="loading-container"><div className="loader"></div></div>;
  if (error) return <div className="error-container"><p className="error-message">{error}</p></div>;

  const imageUrl = product?.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : "https://via.placeholder.com/150";
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistedItems.length;
  const averageRating = getAverageRating();

  return (
    <div className="product-view-page">
      <Header
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={handleSearchSubmit}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        notifications={notifications}
        isWishlistOpen={isWishlistOpen}
        setIsWishlistOpen={setIsWishlistOpen}
        wishlistedItems={wishlistedItems}
        wishlistCount={wishlistCount}
        handleWishlistToggle={(product) => handleWishlistToggle}
        isSupportOpen={isSupportOpen}
        setIsSupportOpen={setIsSupportOpen}
        supportItems={supportItems}
        isCartVisible={isCartVisible}
        setIsCartVisible={setIsCartVisible}
        cartCount={cartCount}
        userProfile={userProfile}
        isProfileDropdownOpen={isProfileDropdownOpen}
        setIsProfileDropdownOpen={setIsProfileDropdownOpen}
        profileDropdownItems={profileDropdownItems}
      />
      
      <CartSidebar
        isCartVisible={isCartVisible}
        setIsCartVisible={setIsCartVisible}
        cartItems={cartItems}
        cartCount={cartCount}
        increaseCartQuantity={increaseCartQuantity}
        decreaseCartQuantity={decreaseCartQuantity}
        removeFromCart={removeFromCart}
        navigate={navigate}
      />
      
      <main className="product-container">
        <section className="product-showcase">
          <div className="product-gallery">
            <div className="main-image">
              <img src={imageUrl} alt={product?.product_name} />
            </div>
          </div>
          
          <div className="product-info">
            <h1 className="product-title">{product?.product_name || "Unnamed Product"}</h1>
            
            <div className="product-meta">
              <div className="product-price">₱{product?.price?.toLocaleString() ?? "N/A"}</div>
              <div className="product-rating-summary">
                {renderStars(averageRating)}
                <span className="review-count">({reviews.length})</span>
              </div>
            </div>
            
            <div className="product-options">
              {product?.colors?.length > 0 && (
                <div className="option-group">
                  <label>Color</label>
                  <div className="color-options">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        className={`color-option ${selectedColor === color ? "selected" : ""}`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        onClick={() => handleColorSelect(color)}
                        aria-label={color}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {product?.sizes?.length > 0 && (
                <div className="option-group">
                  <label>Size</label>
                  <div className="size-options">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        className={`size-option ${selectedSize === size ? "selected" : ""}`}
                        onClick={() => handleSizeSelect(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="option-group">
                <label>Quantity</label>
                <div className="quantity-selector">
                  <button className="quantity-btn decrease" onClick={decreaseQuantity}>−</button>
                  <input type="text" className="quantity-input" value={quantity} readOnly />
                  <button className="quantity-btn increase" onClick={increaseQuantity}>+</button>
                </div>
              </div>
            </div>
            
            <div className="product-actions">
              <button 
                className="wishlist-btn" 
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <span className="wishlist-icon">{isWishlisted ? "❤️" : "♡"}</span>
              </button>
              
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
              
              <button className="buy-now-btn" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>
          </div>
        </section>
        
        <section className="product-details">
          <h2>Product Details</h2>
          <div className="product-description">
            {product?.description || "No description available."}
          </div>
        </section>
        
        <section className="product-reviews">
          <div className="reviews-header">
            <h2>Customer Reviews</h2>
            <div className="review-summary">
              <div className="average-rating">
                {renderStars(averageRating)} 
                <span className="rating-value">{averageRating.toFixed(1)}</span>
              </div>
              <div className="review-count">Based on {reviews.length} reviews</div>
            </div>
          </div>
          
          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <img
                        src={review.user?.profile_pic ? `${BASE_IMAGE_URL}/${review.user.profile_pic}` : "/imgs/Profile.svg"}
                        alt="User"
                        className="reviewer-avatar"
                      />
                      <div className="reviewer-name">
                        {maskCustomerName(review.user?.first_name, review.user?.last_name)}
                      </div>
                    </div>
                    <div className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                  
                  <div className="review-content">
                    {review.review || 'No comment provided.'}
                  </div>
                  
                  {review.reply && review.reply !== "NULL" && (
                    <div className="review-reply">
                      <div className="reply-label">Seller Response:</div>
                      <div className="reply-content">{review.reply}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews">No reviews yet for this product.</div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductView;