import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from '../HeaderArea/CartSidebar';

const ProductReview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({}); // Store new review inputs
  const [existingReviews, setExistingReviews] = useState({}); // Store fetched reviews per product
  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  // Reuse some state from OrderDetails for consistency (e.g., cart, header)
  const [cartItems, setCartItems] = useState([]);
  const [wishlistedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const notifications = [
    { id: 1, message: "Your order #1234 has been shipped!", time: "2 hours ago" },
    { id: 2, message: "New collection available now!", time: "5 hours ago" },
    { id: 3, message: "20% off sale ends tomorrow!", time: "1 day ago" },
  ];

  const supportItems = [
    { label: "ORDER & PAYMENT", path: "/customer/support/order-payment" },
    { label: "SHIPPING", path: "/customer/support/shipping" },
    { label: "RETURNS", path: "/customer/support/returns" },
    { label: "CONTACT US", path: "/customer/support/contact-us" },
    { label: "TERMS AND SERVICE", path: "/customer/support/terms-and-service" },
    { label: "FAQS", path: "/customer/support/faqs" },
  ];

  const profileDropdownItems = [
    { label: "My Profile", path: "/profile" },
    { label: "My Orders", path: "/profile/orders" },
    { label: "Logout", path: "#", onClick: handleLogout },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchOrderAndReviews = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch order details
        const orderResponse = await axios.get(`${API_URL}/orders/${orderId}`, config);
        setOrder(orderResponse.data);

        // Fetch user profile
        const profileResponse = await axios.get(`${API_URL}/profile`, config);
        const profileData = profileResponse.data.profile;
        const user = {
          id: profileResponse.data.user.id,
          first_name: profileData.first_name || '',
          email: profileResponse.data.user?.email || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/Profile.svg',
        };
        setUserProfile(user);

        // Fetch existing reviews for each product
        const reviewsData = {};
        await Promise.all(
          orderResponse.data.products.map(async (product) => {
            const reviewResponse = await axios.get(`${API_URL}/reviews/${product.id}`, config);
            reviewsData[product.id] = reviewResponse.data || [];
          })
        );
        setExistingReviews(reviewsData);

        // Initialize new review inputs
        const initialReviews = {};
        orderResponse.data.products.forEach(product => {
          initialReviews[product.id] = { rating: 0, comment: '' };
        });
        setReviews(initialReviews);
      } catch (err) {
        setError(err.message || "Failed to load order or review data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndReviews();
  }, [orderId, navigate]);

  const handleRatingChange = (productId, rating) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const handleCommentChange = (productId, comment) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment },
    }));
  };

  const handleSubmitReview = async (productId) => {
    const token = localStorage.getItem('token');
    const reviewData = reviews[productId];

    if (!reviewData.rating || reviewData.rating < 1) {
      alert("Please provide a rating.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/reviews`,
        {
          order_id: orderId,
          product_id: productId,
          rating: reviewData.rating,
          review: reviewData.comment, // Changed 'comment' to 'review' to match backend
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Review submitted successfully!");

      // Update existing reviews state with the new review
      setExistingReviews(prev => ({
        ...prev,
        [productId]: [...(prev[productId] || []), response.data.review],
      }));

      // Reset the review input for this product
      setReviews(prev => ({
        ...prev,
        [productId]: { rating: 0, comment: '' },
      }));

      // Optionally redirect back to OrderDetails
      // navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error("Error submitting review:", error.response?.data || error.message);
      alert("Failed to submit review: " + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setCartItems([]);
      navigate('/login');
    }
  };

  // Calculate average rating for a product
  const getAverageRating = (productId) => {
    const productReviews = existingReviews[productId] || [];
    if (productReviews.length === 0) return 0;
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / productReviews.length).toFixed(1);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistedItems.length;

  return (
    <div className="ProductReview">
      <Header
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={() => {}}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        notifications={notifications}
        isWishlistOpen={isWishlistOpen}
        setIsWishlistOpen={setIsWishlistOpen}
        wishlistedItems={wishlistedItems}
        wishlistCount={wishlistCount}
        handleWishlistToggle={() => {}}
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
        increaseCartQuantity={() => {}} // Add logic if needed
        decreaseCartQuantity={() => {}} // Add logic if needed
        removeFromCart={() => {}} // Add logic if needed
        navigate={navigate}
      />

      <div className="review-page">
        <h2>Review Order #{order?.id}</h2>
        {order?.products?.length > 0 ? (
          order.products.map(product => {
            const imageUrl = product.image_1
              ? product.image_1.startsWith('http')
                ? product.image_1
                : `${BASE_IMAGE_URL}/${product.image_1}`
              : "/default-image.jpg";
            const productReviews = existingReviews[product.id] || [];
            const averageRating = getAverageRating(product.id);

            return (
              <div key={product.id} className="review-item">
                <div className="product-info">
                  <img src={imageUrl} alt={product.product_name} className="product-image" />
                  <div>
                    <h4>{product.product_name}</h4>
                    <p>Quantity: {product.quantity}</p>
                  </div>
                </div>

                {/* Display Existing Reviews and Average Rating */}
                <div className="existing-reviews">
                  <h3>Reviews ({productReviews.length})</h3>
                  {productReviews.length > 0 ? (
                    <>
                      <p>Average Rating: {averageRating} / 5</p>
                      <ul>
                        {productReviews.map(review => (
                          <li key={review.id} className="review">
                            <p><strong>{review.user?.first_name || 'Anonymous'}</strong>: {review.rating} / 5</p>
                            <p>{review.review || 'No comment'}</p>
                            <p><small>{new Date(review.created_at).toLocaleDateString()}</small></p>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                </div>

                {/* Review Submission Form */}
                <div className="review-form">
                  <h3>Submit Your Review</h3>
                  <label>Rating (1-5):</label>
                  <select
                    value={reviews[product.id]?.rating || 0}
                    onChange={(e) => handleRatingChange(product.id, Number(e.target.value))}
                  >
                    <option value={0}>Select Rating</option>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                  <label>Comment:</label>
                  <textarea
                    value={reviews[product.id]?.comment || ''}
                    onChange={(e) => handleCommentChange(product.id, e.target.value)}
                    placeholder="Write your review here..."
                  />
                  <button
                    onClick={() => handleSubmitReview(product.id)}
                    className="submit-review-btn"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No products available to review.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductReview;