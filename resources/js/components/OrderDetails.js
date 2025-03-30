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

  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const trackingSteps = ["PENDING", "PROCESSING", "SHIPPING", "DELIVERED"];

  // Sample notifications (from Shop.js)
  const notifications = [
    { id: 1, message: "Your order #1234 has been shipped!", time: "2 hours ago" },
    { id: 2, message: "New collection available now!", time: "5 hours ago" },
    { id: 3, message: "20% off sale ends tomorrow!", time: "1 day ago" },
  ];

  // Support items (from Shop.js)
  const supportItems = [
    { label: "ORDER & PAYMENT", path: "/customer/support/order-payment" },
    { label: "SHIPPING", path: "/customer/support/shipping" },
    { label: "RETURNS", path: "/customer/support/returns" },
    { label: "CONTACT US", path: "/customer/support/contact-us" },
    { label: "TERMS AND SERVICE", path: "/customer/support/terms-and-service" },
    { label: "FAQS", path: "/customer/support/faqs" },
  ];

  // Profile dropdown items (from Shop.js)
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

    // Fetch user profile, cart, and order details
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

        // Fetch cart
        await fetchCart(token, user.id);

        // Fetch order details
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

  // Fetch cart (from Shop.js)
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

  // Cart handlers (from Shop.js)
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

  // Logout handler (from Shop.js)
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

  // Outside click handler (from Shop.js)
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

  // Tracking logic (from original OrderDetails.js)
  const trackingHistory = order?.tracking_history || [];
  const reachedSteps = trackingHistory.map((tracking) => (tracking.status || "").toUpperCase());
  const currentStepIndex = trackingSteps
    .map((step, index) => (reachedSteps.includes(step) ? index : -1))
    .filter((index) => index !== -1)
    .reduce((max, curr) => Math.max(max, curr), -1);

  const trackingTimestamps = {};
  trackingHistory.forEach((tracking) => {
    const status = (tracking.status || "").toUpperCase();
    trackingTimestamps[status] = tracking.timestamp;
  });

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p>Error: {error}</p>;

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
      <div className="order-details-container">
        <h2 className="order-title">Order #{order?.id || "N/A"}</h2>

        {/* Tracking Status */}
        <div className="tracking-container">
          <h3>Order Status</h3>
          <div className="tracking-steps">
            {trackingSteps.map((step, index) => (
              <div
                key={step}
                className={`step ${
                  index <= currentStepIndex ? "active" : ""
                } ${index === currentStepIndex ? "current" : ""}`}
              >
                <div className="step-circle">{index <= currentStepIndex ? "✓" : index + 1}</div>
                <div className="step-info">
                  <p className="step-label">{step}</p>
                  {trackingTimestamps[step] ? (
                    <p className="step-timestamp">
                      {new Date(trackingTimestamps[step]).toLocaleString()}
                    </p>
                  ) : (
                    <p className="step-timestamp">Not yet reached</p>
                  )}
                </div>
                {index < trackingSteps.length - 1 && <div className="step-line"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <p>
            <strong>Total Amount:</strong> ₱
            {order?.total_amount !== undefined && order.total_amount !== null
              ? Number(order.total_amount).toFixed(2)
              : "N/A"}
          </p>
          <p>
            <strong>Placed On:</strong>{" "}
            {order?.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}
          </p>
        </div>

        {/* Product Details */}
        {order?.products?.length > 0 ? (
          <div className="product-details">
            <h3>Items Ordered</h3>
            {order.products.map((product) => {
              // Fix image URL logic
              const imageUrl = product.image_1
                ? product.image_1.startsWith('http')
                  ? product.image_1 // Use as-is if it's a full URL
                  : `${BASE_IMAGE_URL}/${product.image_1}` // Prepend BASE_IMAGE_URL if it's a relative path
                : "/default-image.jpg";

              return (
                <div key={product.id || "unknown"} className="product-item">
                  <img
                    src={imageUrl}
                    alt={product.product_name || "Product"}
                    className="product-image"
                  />
                  <div className="product-info">
                    <p><strong>{product.product_name || "Unnamed Product"}</strong></p>
                    <p>Quantity: {product.quantity || "N/A"}</p>
                    <p>
                      Price: ₱
                      {typeof product.price === "number" && typeof product.quantity === "number"
                        ? (product.price * product.quantity).toFixed(2)
                        : product.price || "N/A"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No product details available.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetails;