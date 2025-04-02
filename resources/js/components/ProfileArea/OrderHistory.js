import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from '../HeaderArea/CartSidebar';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, orderId: null, productId: null });
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userReviews, setUserReviews] = useState([]);

  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

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
    { label: "My Orders", path: "/order-history" },
    { label: "Logout", path: "#", onClick: handleLogout },
  ];

  const statusFilters = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const profileResponse = await axios.get(`${API_URL}/profile`, config);
        const profileData = profileResponse.data.profile || {};
        const user = {
          id: profileResponse.data.user.id,
          first_name: profileData.first_name || '',
          middle_name: profileData.middle_name || '',
          last_name: profileData.last_name || '',
          suffix: profileData.suffix || '',
          email: profileResponse.data.user.email || '',
          phone_number: profileData.phone_number || '',
          gender: profileData.gender || '',
          date_of_birth: profileData.date_of_birth || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/Profile.svg',
        };
        setUserProfile(user);

        await fetchCart(token, user.id);

        const ordersResponse = await axios.get(`${API_URL}/orders`, config);
        console.log("Orders Fetched:", ordersResponse.data);
        setOrders(ordersResponse.data || []);

        const reviewsResponse = await axios.get(`${API_URL}/reviews/user`, config);
        console.log("User Reviews Fetched:", reviewsResponse.data);
        setUserReviews(reviewsResponse.data || []);
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        } else {
          setError(err.message || "Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const fetchCart = async (token, userId) => {
    try {
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = response.data.data || response.data || [];
      const detailedCart = cartData.map(item => ({
        id: item.product_id,
        productName: item.product?.product_name || "Unknown Product",
        price: item.product?.price || 0,
        imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : '/default-image.jpg',
        quantity: item.quantity || 1,
      }));
      setCartItems(detailedCart);
    } catch (error) {
      console.error("Error fetching cart:", error.response?.data || error.message);
    }
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
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeFromCartBackend = async (productId) => {
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    try {
      await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart(token, userId);
    } catch (error) {
      console.error("Error removing from cart:", error.response?.data || error.message);
    }
  };

  const removeFromCart = (itemId) => async () => {
    await removeFromCartBackend(itemId);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      const token = localStorage.getItem('token');
      axios.delete(`${API_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(error => console.error("Error clearing cart:", error));
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setCartItems([]);
      setOrders([]);
      setUserProfile(null);
      navigate('/login');
      setIsProfileDropdownOpen(false);
    }
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.notification-container') && !e.target.closest('.header-icon')) setIsNotificationOpen(false);
    if (!e.target.closest('.wishlist-container') && !e.target.closest('.header-icon')) setIsWishlistOpen(false);
    if (!e.target.closest('.support-container') && !e.target.closest('.support-link')) setIsSupportOpen(false);
    if (!e.target.closest('.cart-sidebar') && !e.target.closest('.header-icon')) setIsCartVisible(false);
    if (!e.target.closest('.profile-container') && !e.target.closest('.profile-button')) setIsProfileDropdownOpen(false);
  };

  useEffect(() => {
    if (isNotificationOpen || isWishlistOpen || isSupportOpen || isCartVisible || isProfileDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isNotificationOpen, isWishlistOpen, isSupportOpen, isCartVisible, isProfileDropdownOpen]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistedItems.length;

  const getCurrentStatus = (order) => {
    if (order.is_cancelled) return 'CANCELLED';
    if (order.status) return order.status.toUpperCase();
    if (order.tracking_history && order.tracking_history.length > 0) {
      const sortedHistory = [...order.tracking_history].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      return sortedHistory[0].status.toUpperCase();
    }
    return 'PENDING';
  };

  const hasReviewedProduct = (productId) => {
    const productIdInt = parseInt(productId);
    const reviewed = userReviews.some(review => parseInt(review.product_id) === productIdInt);
    console.log(`Checking if product ${productIdInt} is reviewed:`, reviewed, 'User Reviews:', userReviews);
    return reviewed;
  };

  const filteredOrders = activeFilter === 'ALL'
    ? orders
    : orders.filter(order => getCurrentStatus(order) === activeFilter);

  const navigateToOrderDetails = (orderId, e) => {
    if (e && (e.target.classList.contains('toggle-summary-btn') || e.target.classList.contains('rate-product-btn'))) {
      e.stopPropagation();
      return;
    }
    if (e && e.target.closest('.order-summary-expanded')) {
      e.stopPropagation();
      return;
    }
    navigate(`/my-orders/${orderId}`);
  };

  const openReviewModal = (orderId, productId) => {
    if (!orderId || !productId) {
      console.error("Missing orderId or productId:", { orderId, productId });
      alert("Cannot open review modal: Missing order or product information.");
      return;
    }
    console.log("Opening review modal for order:", orderId, "product:", productId);
    setReviewModal({ isOpen: true, orderId, productId });
    setRating(0);
    setReviewText('');
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, orderId: null, productId: null });
  };

  const submitReview = async () => {
    const token = localStorage.getItem('token');
    if (!reviewModal.orderId || !reviewModal.productId) {
      console.error("Missing orderId or productId in review submission:", reviewModal);
      alert("Cannot submit review: Missing order or product information.");
      return;
    }
    const payload = {
      order_id: parseInt(reviewModal.orderId),
      product_id: parseInt(reviewModal.productId),
      rating,
      review: reviewText,
    };
    console.log("Submitting review with payload:", payload);
    try {
      const response = await axios.post(`${API_URL}/reviews`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Review submission response:", response.data);
      setUserReviews(prev => [...prev, response.data.review]);
      alert('Review submitted successfully!');
      closeReviewModal();
    } catch (err) {
      console.error("Review submission error:", err.response?.data || err.message);
      alert('Failed to submit review: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div>Loading your orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="OrderHistory">
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
        increaseCartQuantity={increaseCartQuantity}
        decreaseCartQuantity={decreaseCartQuantity}
        removeFromCart={removeFromCart}
        navigate={navigate}
      />
      <div className="order-history-page">
        <div className="order-history-container">
          <h1 className="page-title">My Orders</h1>
          <div className="order-filters">
            {statusFilters.map(filter => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          {filteredOrders.length > 0 ? (
            <div className="orders-list">
              {filteredOrders.map(order => {
                const currentStatus = getCurrentStatus(order);
                const orderDate = new Date(order.created_at).toLocaleDateString();
                const orderItems = order.order_details || order.products || order.items || [];
                const previewItem = orderItems.length > 0 ? orderItems[0] : null;
                const imageUrl = previewItem?.image_1 || previewItem?.product?.image_1 || previewItem?.image
                  ? (previewItem.image_1 || previewItem.product?.image_1 || previewItem.image).startsWith('http')
                    ? (previewItem.image_1 || previewItem.product?.image_1 || previewItem.image)
                    : `${BASE_IMAGE_URL}/${previewItem.image_1 || previewItem.product?.image_1 || previewItem.image}`
                  : "/default-image.jpg";
                const additionalItemsCount = orderItems.length - 1;
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className={`order-card ${isExpanded ? 'expanded' : ''}`}
                    onClick={(e) => navigateToOrderDetails(order.id, e)}
                  >
                    <div className="order-header">
                      <div className="order-id">Order #{order.id}</div>
                      <div className="order-date">{orderDate}</div>
                      <div className={`order-status ${currentStatus.toLowerCase()}`}>
                        {currentStatus}
                      </div>
                    </div>
                    <div className="order-preview">
                      {previewItem ? (
                        <>
                          <div className="product-image-container">
                            <img
                              src={imageUrl}
                              alt={previewItem.product_name || previewItem.product?.product_name || "Product"}
                              className="product-thumbnail"
                              onError={(e) => (e.target.src = "/default-image.jpg")}
                            />
                          </div>
                          <div className="product-info">
                            <div className="product-name">
                              {previewItem.product_name || previewItem.product?.product_name || "Unnamed Product"}
                            </div>
                            <div className="product-details">
                              <span>Price: ₱{Number(previewItem.price || previewItem.product?.price || 0).toFixed(2)}</span>
                              {previewItem.quantity && <span> | Qty: {previewItem.quantity}</span>}
                              {previewItem.size && <span> | Size: {previewItem.size}</span>}
                              {previewItem.color && <span> | Color: {previewItem.color}</span>}
                            </div>
                            {additionalItemsCount > 0 && (
                              <div className="additional-products">
                                +{additionalItemsCount} more {additionalItemsCount === 1 ? 'item' : 'items'}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="no-product-info">
                          No product information available for this order.
                        </div>
                      )}
                    </div>
                    <div className="order-actions">
                      <div className="order-total">
                        <div className="total-label">Total:</div>
                        <div className="total-amount">₱{Number(order.total_amount).toFixed(2)}</div>
                      </div>
                      <button
                        className="toggle-summary-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedOrderId(expandedOrderId === order.id ? null : order.id);
                        }}
                      >
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </button>
                      <div className="view-details-btn">View Order</div>
                    </div>
                    {isExpanded && (
                      <div className="order-summary-expanded" onClick={(e) => e.stopPropagation()}>
                        <h3>Order Summary</h3>
                        {orderItems.length > 0 ? (
                          <div className="order-products">
                            {orderItems.map((product, index) => {
                              const productImageUrl = product.image_1 || product.product?.image_1 || product.image
                                ? (product.image_1 || product.product?.image_1 || product.image).startsWith('http')
                                  ? (product.image_1 || product.product?.image_1 || product.image)
                                  : `${BASE_IMAGE_URL}/${product.image_1 || product.product?.image_1 || product.image}`
                                : "/default-image.jpg";
                              const productId = product.product_id || product.id;
                              const isReviewed = hasReviewedProduct(productId);

                              return (
                                <div key={`${order.id}-product-${index}`} className="product-item">
                                  <div className="product-image-container">
                                    <img
                                      src={productImageUrl}
                                      alt={product.product_name || product.product?.product_name || "Product"}
                                      className="product-image"
                                      onError={(e) => (e.target.src = "/default-image.jpg")}
                                    />
                                  </div>
                                  <div className="product-details">
                                    <h4 className="product-name">
                                      {product.product_name || product.product?.product_name || "Unnamed Product"}
                                    </h4>
                                    <div className="product-meta">
                                      <p className="product-quantity">Qty: {product.quantity || 1}</p>
                                      <p className="product-price">
                                        ₱{((product.price || product.product?.price || 0) * (product.quantity || 1)).toFixed(2)}
                                      </p>
                                    </div>
                                    {(product.size || product.color) && (
                                      <div className="product-attributes">
                                        {product.size && <span className="product-size">Size: {product.size}</span>}
                                        {product.color && <span className="product-color">Color: {product.color}</span>}
                                      </div>
                                    )}
                                    {currentStatus === 'DELIVERED' && (
                                      <button
                                        className="rate-product-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openReviewModal(order.id, productId);
                                        }}
                                        disabled={isReviewed}
                                      >
                                        {isReviewed ? "Reviewed" : "Rate Product"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            <div className="order-shipping-cost">
                              <p className="shipping-label">Shipping Cost:</p>
                              <p className="shipping-value">
                                ₱{order.shipping_cost !== undefined ? Number(order.shipping_cost).toFixed(2) : "N/A"}
                              </p>
                            </div>
                            <div className="order-total-summary">
                              <p className="total-label">Total Amount:</p>
                              <p className="total-value">
                                ₱{Number(order.total_amount).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p>No product details available.</p>
                        )}
                        <div className="shipping-info">
                          <p><strong>Shipping Method:</strong> {order.shipping_method || order.courier?.name || "Standard Shipping"}</p>
                          <p><strong>Estimated Delivery:</strong> {order.estimated_delivery || order.courier?.estimated_delivery_time || "N/A"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-orders">
              <p>No orders found with the selected filter.</p>
              {activeFilter !== 'ALL' && (
                <button
                  className="show-all-btn"
                  onClick={() => setActiveFilter('ALL')}
                >
                  Show All Orders
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {reviewModal.isOpen && (
        <div className="review-modal">
          <div className="review-modal-content">
            <h2>Rate and Review Product</h2>
            <div className="rating">
              <label>Rating (1-5):</label>
              <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                <option value={0}>Select Rating</option>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="review-text">
              <label>Review:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
                rows="4"
              />
            </div>
            <div className="review-modal-actions">
              <button onClick={submitReview} disabled={rating === 0 || !reviewText.trim()}>
                Submit Review
              </button>
              <button onClick={closeReviewModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrderHistory;