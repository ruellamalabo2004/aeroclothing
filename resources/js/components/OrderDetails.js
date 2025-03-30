import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from './CartSidebar';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
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
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const trackingSteps = ["PENDING", "PROCESSING", "SHIPPING", "DELIVERED"];

  const statusIconMap = {
    "PENDING": "pends",
    "PROCESSING": "proces",
    "SHIPPING": "ships",
    "DELIVERED": "delivers"
  };

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

    const fetchProfileAndData = async () => {
      try {
        const profileResponse = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = profileResponse.data.profile;
        const user = {
          id: profileResponse.data.user.id,
          first_name: profileData.first_name || '',
          middle_name: profileData.middle_name || '',
          last_name: profileData.last_name || '',
          suffix: profileData.suffix || '',
          email: profileResponse.data.user?.email || '',
          phone_number: profileData.phone_number || '',
          gender: profileData.gender || '',
          date_of_birth: profileData.date_of_birth || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/Profile.svg',
        };
        setUserProfile(user);

        await fetchCart(token, user.id);

        if (!orderId) {
          setError("No order ID specified");
        } else {
          const orderResponse = await axios.get(`${API_URL}/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOrder(orderResponse.data);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        } else {
          setError(err.message || "Failed to load data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndData();
  }, [orderId, navigate]);

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
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseCartQuantity = (itemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
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
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      const token = localStorage.getItem('token');
      axios.delete(`${API_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => console.error("Error clearing cart:", error));
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setCartItems([]);
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

  const trackingHistory = order?.tracking_history || [];
  const reachedSteps = trackingHistory.map((tracking) => (tracking.status || "").toUpperCase());
  const currentStepIndex = trackingSteps
    .map((step, index) => (reachedSteps.includes(step) ? index : -1))
    .filter((index) => index !== -1)
    .reduce((max, curr) => Math.max(max, curr), -1);

  // Restore tracking timestamps
  const trackingTimestamps = {};
  trackingHistory.forEach((tracking) => {
    const status = (tracking.status || "").toUpperCase();
    trackingTimestamps[status] = tracking.timestamp;
  });

  const calculateEstimatedDelivery = () => {
    return order?.courier?.estimated_delivery_time || "N/A";
  };

  const handleCancelOrder = async () => {
    if (!order || !orderId) return;
    
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const orderResponse = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(orderResponse.data);
      
      alert("Order has been canceled successfully");
    } catch (error) {
      console.error("Error canceling order:", error.response?.data || error.message);
      alert("Failed to cancel order. Please try again later.");
    }
  };

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p>Error: {error}</p>;

  const currentStatus = reachedSteps.length > 0 ? reachedSteps[reachedSteps.length - 1] : "PENDING";
  const canCancel = currentStatus === "PENDING";

  return (
    <div className="OrderDetails">
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
      
      <div className="order-details-page">
        <div className="order-details-container">
          {/* Container 1: Order Status */}
          <div className="order-status-container">
            <h3>Order Status</h3>
            <div className="progress-bar-container">
              <div className="progress-steps">
                {trackingSteps.map((step, index) => (
                  <div key={step} className="progress-step">
                    <div className={`step-icon ${index <= currentStepIndex ? "active" : ""}`}>
                      <img 
                        src={`/imgs/${statusIconMap[step]}.svg`} 
                        alt={step} 
                        className="status-icon" 
                      />
                    </div>
                    <div className={`step-label ${index <= currentStepIndex ? "active" : ""}`}>
                      {step}
                    </div>
                    {/* Add timestamp below each step */}
                    <div className={`step-timestamp ${index <= currentStepIndex ? "active" : ""}`}>
                      {trackingTimestamps[step] ? new Date(trackingTimestamps[step]).toLocaleString() : ""}
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div className={`progress-line ${index < currentStepIndex ? "active" : ""}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {canCancel && (
              <div className="cancel-order-container">
                <button className="cancel-order-btn" onClick={handleCancelOrder}>
                  Cancel Order
                </button>
              </div>
            )}
          </div>

          {/* Container 2: Order Info and Summary Toggle */}
          <div className="order-info-container">
            <div className="order-header">
              <div className="order-number">
                <h2>ORDER #{order?.id || "N/A"}</h2>
              </div>
              <div className="order-date">
                <p>Placed On: {order?.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}</p>
              </div>
            </div>
            <div className="order-shipping-info">
              <div className="courier-info">
                <p><strong>Courier:</strong> {order?.courier?.name || "N/A"}</p>
              </div>
              <div className="delivery-estimate">
                <p><strong>Estimated Delivery:</strong> {calculateEstimatedDelivery()}</p>
              </div>
            </div>
            <button 
              className="toggle-summary-btn"
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            >
              {isSummaryOpen ? "Hide Order Details" : "Show Order Details"}
            </button>

            {/* Container 3: Order Summary (Dropdown) */}
            {isSummaryOpen && (
              <div className="order-summary-container">
                <h3>Order Summary</h3>
                {order?.products?.length > 0 ? (
                  <div className="order-products">
                    {order.products.map((product) => {
                      const imageUrl = product.image_1
                        ? product.image_1.startsWith('http')
                          ? product.image_1
                          : `${BASE_IMAGE_URL}/${product.image_1}`
                        : "/default-image.jpg";

                      return (
                        <div key={product.id || "unknown"} className="product-item">
                          <div className="product-image-container">
                            <img
                              src={imageUrl}
                              alt={product.product_name || "Product"}
                              className="product-image"
                            />
                          </div>
                          <div className="product-details">
                            <h4 className="product-name">{product.product_name || "Unnamed Product"}</h4>
                            <div className="product-meta">
                              <p className="product-quantity">Qty: {product.quantity || "N/A"}</p>
                              <p className="product-price">
                                ₱{(product.price * product.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* Shipping Cost */}
                    <div className="order-shipping-cost">
                      <p className="shipping-label">Shipping Cost:</p>
                      <p className="shipping-value">
                        ₱{order?.courier?.shipping_fee !== undefined ? Number(order.courier.shipping_fee).toFixed(2) : "N/A"}
                      </p>
                    </div>
                    {/* Total Amount */}
                    <div className="order-total">
                      <p className="total-label">Total Amount:</p>
                      <p className="total-value">
                        ₱{Number(order?.total_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>No product details available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetails;