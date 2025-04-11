import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from '../HeaderArea/CartSidebar';
import { MdOutlinePendingActions } from "react-icons/md";
import { GiCardboardBoxClosed } from "react-icons/gi";
import { FaTruckFast } from "react-icons/fa6";
import { IoHome, IoCloudUploadOutline } from "react-icons/io5";

const Myorders = () => {
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
  const [productSelectionModal, setProductSelectionModal] = useState({ isOpen: false, orderId: null, orderItems: [] });
  const [activeMenuItem, setActiveMenuItem] = useState('orders');
  const [returnModal, setReturnModal] = useState({ isOpen: false, orderId: null });
  const [returnForm, setReturnForm] = useState({
    orderNumber: '',
    customerName: '',
    email: '',
    phoneNumber: '',
    productName: '',
    quantity: '',
    returnReason: '',
    image: null
  });

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
    { label: "My Orders", path: "/profile/orders" },
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
        await fetchOrders();
        await fetchUserReviews();
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

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Orders fetched:", response.data);
      
      // Check the structure of the orders data
      const ordersData = response.data.data || response.data || [];
      console.log("Orders data structure:", JSON.stringify(ordersData[0], null, 2));
      
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
      setError("Failed to load orders. Please try again later.");
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

  const handleMenuClick = (menuItem, path) => {
    setActiveMenuItem(menuItem);
    navigate(path);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?query=${searchQuery}`);
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
    if (!productId) return false;
    
    // Convert productId to string for consistent comparison
    const productIdStr = String(productId);
    
    // Check if the product has been reviewed
    const reviewed = userReviews.some(review => {
      const reviewProductId = String(review.product_id);
      return reviewProductId === productIdStr;
    });
    
    console.log(`Checking if product ${productIdStr} is reviewed:`, reviewed, 'User Reviews:', userReviews);
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
    console.log("Closing review modal");
    setReviewModal({ isOpen: false, orderId: null, productId: null });
    setRating(0);
    setReviewText('');
  };

  const submitReview = async () => {
    const token = localStorage.getItem('token');
    if (!reviewModal.orderId || !reviewModal.productId) {
      console.error("Missing orderId or productId in review submission:", reviewModal);
      alert("Cannot submit review: Missing order or product information.");
      return;
    }
    
    // Convert IDs to integers for the API
    const orderId = parseInt(reviewModal.orderId);
    const productId = parseInt(reviewModal.productId);
    
    const payload = {
      order_id: orderId,
      product_id: productId,
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

  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/orders/${orderId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
    } catch (error) {
      console.error("Error canceling order:", error.response?.data || error.message);
    }
  };

  const fetchUserReviews = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/reviews/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User Reviews Fetched:", response.data);
      setUserReviews(response.data || []);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  };

  const openProductSelectionModal = (orderId, orderItems) => {
    console.log("Opening product selection modal for order:", orderId);
    setProductSelectionModal({ isOpen: true, orderId, orderItems });
  };

  const closeProductSelectionModal = () => {
    console.log("Closing product selection modal");
    setProductSelectionModal({ isOpen: false, orderId: null, orderItems: [] });
  };

  const selectProductForReview = (productId) => {
    console.log("Selected product for review:", productId);
    closeProductSelectionModal();
    openReviewModal(productSelectionModal.orderId, productId);
  };

  const openReturnModal = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setReturnForm({
        orderNumber: order.id.toString(),
        customerName: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`,
        email: userProfile?.email || '',
        phoneNumber: userProfile?.phone_number || '',
        productName: '',
        quantity: '',
        returnReason: '',
        image: null
      });
      setReturnModal({ isOpen: true, orderId });
    }
  };

  const closeReturnModal = () => {
    setReturnModal({ isOpen: false, orderId: null });
    setReturnForm({
      orderNumber: '',
      customerName: '',
      email: '',
      phoneNumber: '',
      productName: '',
      quantity: '',
      returnReason: '',
      image: null
    });
  };

  const handleReturnFormChange = (e) => {
    const { name, value } = e.target;
    setReturnForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReturnForm(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    // Here you would implement the API call to submit the return request
    console.log('Return form submitted:', returnForm);
    closeReturnModal();
  };

  return (
    <div className="myorders-main">
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
      <div className="myorders-profile-container">
        <h1 className="myorders-profile-title">My Orders</h1>
        <div className="myorders-profile-body">
          <div className="myorders-sidebar">
            <div className="myorders-user-info">
              <img src={userProfile?.profile_pic || '/imgs/Profile.svg'} alt="Profile" className="myorders-profile-pic" />
              <h2>{userProfile?.first_name} {userProfile?.last_name}</h2>
            </div>
            <ul className="myorders-nav-menu">
              <li className={activeMenuItem === 'profile' ? 'active' : ''} onClick={() => handleMenuClick('profile', '/profile')}>
                <img src="/imgs/myprofile.svg" alt="My Profile" /> My Profile
              </li>
              <li className={activeMenuItem === 'address' ? 'active' : ''} onClick={() => handleMenuClick('address', '/profile/address')}>
                <img src="/imgs/myaddress.svg" alt="My Address" /> My Address
              </li>
              <li className={activeMenuItem === 'password' ? 'active' : ''} onClick={() => handleMenuClick('password', '/profile/change-password')}>
                <img src="/imgs/mypassword.svg" alt="Change Password" /> Change Password
              </li>
              <li className={activeMenuItem === 'wishlist' ? 'active' : ''} onClick={() => handleMenuClick('wishlist', '/profile/wishlist')}>
                <img src="/imgs/mywishlist.svg" alt="My Wishlist" /> My Wishlist
              </li>
              <li className={activeMenuItem === 'orders' ? 'active' : ''} onClick={() => handleMenuClick('orders', '/profile/orders')}>
                <img src="/imgs/myorder.svg" alt="My Orders" /> My Orders
              </li>
              <li className={activeMenuItem === 'cart' ? 'active' : ''} onClick={() => handleMenuClick('cart', '/profile/cart')}>
                <img src="/imgs/mycarts.svg" alt="My Cart" /> My Cart
              </li>
              <li className={activeMenuItem === 'logout' ? 'active' : ''} onClick={handleLogout}>
                <img src="/imgs/mylogout.svg" alt="Logout" /> Logout
              </li>
            </ul>
          </div>
          <div className="myorders-profile-content">
            <div className="myorders-filters">
              {statusFilters.map(filter => (
                <button
                  key={filter}
                  className={`myorders-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="myorders-loading-container">
                <div className="myorders-loader"></div>
              </div>
            ) : error ? (
              <div className="myorders-error-container">
                <p className="myorders-error-message">{error}</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="myorders-no-orders">
                <p>No orders found with the selected filter.</p>
                {activeFilter !== 'ALL' && (
                  <button
                    className="myorders-show-all-btn"
                    onClick={() => setActiveFilter('ALL')}
                  >
                    Show All Orders
                  </button>
                )}
              </div>
            ) : (
              <div className="myorders-list">
                {filteredOrders.map(order => {
                  const currentStatus = getCurrentStatus(order);
                  const orderDate = new Date(order.created_at).toLocaleDateString();
                  const orderItems = order.order_details || order.products || order.items || [];
                  
                  console.log("Order details structure:", JSON.stringify(order.order_details, null, 2));
                  console.log("Order items:", orderItems);

                  return (
                    <div key={order.id} className="myorders-card">
                      <div className="myorders-header">
                        <div className="myorders-info">
                          <div className="myorders-id">
                            {currentStatus === 'PENDING' && <MdOutlinePendingActions className="myorders-status-icon" />}
                            {currentStatus === 'PROCESSING' && <GiCardboardBoxClosed className="myorders-status-icon" />}
                            {currentStatus === 'SHIPPING' && <FaTruckFast className="myorders-status-icon" />}
                            {currentStatus === 'DELIVERED' && <IoHome className="myorders-status-icon" />}
                            Order #{order.id}
                          </div>
                          {currentStatus === 'DELIVERED' && (
                            <div className="myorders-delivery-message">Your package was delivered!</div>
                          )}
                        </div>
                        <div className="myorders-date">{orderDate}</div>
                        <div className={`myorders-status ${currentStatus.toLowerCase()}`}>
                          {currentStatus}
                        </div>
                      </div>

                      <div className="myorders-products">
                        {orderItems.map((product, index) => {
                          const productImageUrl = product.image_1 || product.product?.image_1 || product.image
                            ? (product.image_1 || product.product?.image_1 || product.image).startsWith('http')
                              ? (product.image_1 || product.product?.image_1 || product.image)
                              : `${BASE_IMAGE_URL}/${product.image_1 || product.product?.image_1 || product.image}`
                            : "/default-image.jpg";
                          const productId = product.product_id || product.id;
                          const isReviewed = hasReviewedProduct(productId);
                          
                          console.log("Product in order:", product);
                          console.log("Product ID:", productId);
                          console.log("Is reviewed:", isReviewed);

                          return (
                            <div key={`${order.id}-product-${index}`} className="myorders-product-item">
                              <div className="myorders-product-image-container">
                                <img
                                  src={productImageUrl}
                                  alt={product.product_name || product.product?.product_name || "Product"}
                                  className="myorders-product-image"
                                  onError={(e) => (e.target.src = "/default-image.jpg")}
                                />
                              </div>
                              <div className="myorders-product-details">
                                <h4 className="myorders-product-name">
                                  {product.product_name || product.product?.product_name || "Unnamed Product"}
                                </h4>
                                <div className="myorders-product-meta">
                                  <p className="myorders-product-quantity">Qty: {product.quantity || 1}</p>
                                  <p className="myorders-product-price">
                                    ₱{Number(product.price || product.product?.price || 0).toFixed(2)}
                                  </p>
                                </div>
                                {(product.size || product.color) && (
                                  <div className="myorders-product-attributes">
                                    {product.size && <span className="myorders-product-size">Size: {product.size}</span>}
                                    {product.color && <span className="myorders-product-color">Color: {product.color}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="myorders-actions">
                        <div className="myorders-summary">
                          <div className="myorders-shipping-info">
                            <div className="myorders-shipping-cost">
                              <span className="myorders-shipping-label">Shipping Cost:</span>
                              <span className="myorders-shipping-value">₱{order.shipping_cost ? Number(order.shipping_cost).toFixed(2) : "0.00"}</span>
                            </div>
                            <div className="myorders-shipping-method">
                              <span className="myorders-shipping-label">Shipping Method:</span>
                              <span className="myorders-shipping-value">{order.shipping_method || "Standard Shipping"}</span>
                            </div>
                            <div className="myorders-estimated-delivery">
                              <span className="myorders-shipping-label">Estimated Delivery:</span>
                              <span className="myorders-shipping-value">{order.estimated_delivery || "3-5 business days"}</span>
                            </div>
                          </div>
                          <div className="myorders-total">
                            <div className="myorders-total-label">Total:</div>
                            <div className="myorders-total-amount">₱{Number(order.total_amount).toFixed(2)}</div>
                          </div>
                        </div>
                        
                        <div className="myorders-action-buttons">
                          {currentStatus === 'PENDING' && (
                            <button className="myorders-cancel-btn" onClick={() => handleCancelOrder(order.id)}>
                              Cancel Order
                            </button>
                          )}
                          {currentStatus === 'DELIVERED' && (
                            <>
                              <button className="myorders-return-btn" onClick={() => openReturnModal(order.id)}>Return & Refund</button>
                              <button 
                                className="myorders-track-btn"
                                onClick={() => navigateToOrderDetails(order.id)}
                              >
                                Track Order
                              </button>
                              {orderItems.length > 1 ? (
                                <button
                                  className="myorders-rate-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Rate Product button clicked for multiple items in order:", order.id);
                                    openProductSelectionModal(order.id, orderItems);
                                  }}
                                >
                                  Rate Products
                                </button>
                              ) : (
                                <button
                                  className="myorders-rate-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const productId = orderItems[0].product_id || orderItems[0].id;
                                    console.log("Rate Product button clicked for order:", order.id, "product:", productId);
                                    openReviewModal(order.id, productId);
                                  }}
                                  disabled={hasReviewedProduct(orderItems[0].product_id || orderItems[0].id)}
                                >
                                  {hasReviewedProduct(orderItems[0].product_id || orderItems[0].id) ? "Reviewed" : "Rate Product"}
                                </button>
                              )}
                            </>
                          )}
                          {(currentStatus === 'SHIPPING' || currentStatus === 'PROCESSING') && (
                            <button 
                              className="myorders-track-btn"
                              onClick={() => navigateToOrderDetails(order.id)}
                            >
                              Track Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {reviewModal.isOpen && (
        <div className="myorders-review-modal">
          <div className="myorders-review-modal-content">
            <h2>Rate and Review Product</h2>
            {console.log("Rendering review modal for order:", reviewModal.orderId, "product:", reviewModal.productId)}
            {orders.map(order => {
              if (order.id === reviewModal.orderId) {
                console.log("Found order for review:", order);
                const orderItems = order.order_details || order.products || order.items || [];
                console.log("Order items for review:", orderItems);
                
                const product = orderItems.find(item => {
                  const itemId = String(item.product_id || item.id);
                  const targetId = String(reviewModal.productId);
                  console.log("Comparing item ID:", itemId, "with target ID:", targetId);
                  return itemId === targetId;
                });
                
                console.log("Found product for review:", product);
                if (product) {
                  const productImageUrl = product.image_1 || product.product?.image_1 || product.image
                    ? (product.image_1 || product.product?.image_1 || product.image).startsWith('http')
                      ? (product.image_1 || product.product?.image_1 || product.image)
                      : `${BASE_IMAGE_URL}/${product.image_1 || product.product?.image_1 || product.image}`
                    : "/default-image.jpg";

                  return (
                    <div key={product.id} className="myorders-review-product-item">
                      <div className="myorders-product-image-container">
                        <img
                          src={productImageUrl}
                          alt={product.product_name || product.product?.product_name || "Product"}
                          className="myorders-product-image"
                          onError={(e) => (e.target.src = "/default-image.jpg")}
                        />
                      </div>
                      <div className="myorders-product-info">
                        <h4>{product.product_name || product.product?.product_name || "Unnamed Product"}</h4>
                        <p>Quantity: {product.quantity || 1}</p>
                        <p>Price: ₱{Number(product.price || product.product?.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                }
              }
              return null;
            })}
            <div className="myorders-rating">
              <label>Rating (1-5):</label>
              <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                <option value={0}>Select Rating</option>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="myorders-review-text">
              <label>Review:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
                rows="4"
              />
            </div>
            <div className="myorders-review-modal-actions">
              <button onClick={closeReviewModal} className="myorders-cancel-review-btn">Cancel</button>
              <button onClick={submitReview} disabled={rating === 0 || !reviewText.trim()}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {productSelectionModal.isOpen && (
        <div className="myorders-product-selection-modal">
          <div className="myorders-product-selection-modal-content">
            <h2>Select Product to Rate</h2>
            <div className="myorders-product-selection-list">
              {productSelectionModal.orderItems.map((product, index) => {
                const productId = product.product_id || product.id;
                const isReviewed = hasReviewedProduct(productId);
                const productImageUrl = product.image_1 || product.product?.image_1 || product.image
                  ? (product.image_1 || product.product?.image_1 || product.image).startsWith('http')
                    ? (product.image_1 || product.product?.image_1 || product.image)
                    : `${BASE_IMAGE_URL}/${product.image_1 || product.product?.image_1 || product.image}`
                  : "/default-image.jpg";
                
                return (
                  <div key={`select-${productId}`} className="myorders-product-selection-item">
                    <div className="myorders-product-image-container">
                      <img
                        src={productImageUrl}
                        alt={product.product_name || product.product?.product_name || "Product"}
                        className="myorders-product-image"
                        onError={(e) => (e.target.src = "/default-image.jpg")}
                      />
                    </div>
                    <div className="myorders-product-info">
                      <h4>{product.product_name || product.product?.product_name || "Unnamed Product"}</h4>
                      <p>Quantity: {product.quantity || 1}</p>
                      <p>Price: ₱{Number(product.price || product.product?.price || 0).toFixed(2)}</p>
                    </div>
                    <div className="myorders-product-selection-action">
                      {isReviewed ? (
                        <span className="myorders-reviewed-text">Already Reviewed</span>
                      ) : (
                        <button 
                          className="myorders-select-product-btn"
                          onClick={() => selectProductForReview(productId)}
                        >
                          Rate This Product
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="myorders-product-selection-modal-actions">
              <button onClick={closeProductSelectionModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {returnModal.isOpen && (
        <div className="myorders-return-modal">
          <div className="myorders-return-modal-content">
            <h2>RETURN REQUEST FORM</h2>
            <form onSubmit={handleReturnSubmit}>
              <div className="myorders-form-top">
                <div className="myorders-form-left">
                  <div className="myorders-form-group">
                    <label>Order Number</label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={returnForm.orderNumber}
                      onChange={handleReturnFormChange}
                      readOnly
                    />
                  </div>

                  <div className="myorders-form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      name="customerName"
                      value={returnForm.customerName}
                      onChange={handleReturnFormChange}
                      required
                    />
                  </div>

                  <div className="myorders-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={returnForm.email}
                      onChange={handleReturnFormChange}
                      required
                    />
                  </div>

                  <div className="myorders-form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={returnForm.phoneNumber}
                      onChange={handleReturnFormChange}
                      required
                    />
                  </div>

                  <div className="myorders-form-section">
                    <h3>Items to Returned</h3>
                    <div className="myorders-form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        name="productName"
                        value={returnForm.productName}
                        onChange={handleReturnFormChange}
                        required
                      />
                    </div>

                    <div className="myorders-form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={returnForm.quantity}
                        onChange={handleReturnFormChange}
                        required
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="myorders-form-right">
                  <div className="myorders-form-group myorders-image-upload">
                    <div className="myorders-upload-area">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/svg+xml,image/png,image/jpeg"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="image-upload" className="myorders-upload-label">
                        <IoCloudUploadOutline className="myorders-upload-icon" />
                        <p>Drop your image here or Click to Browse</p>
                        <small>Format photos SVG, PNG, or JPG.</small>
                      </label>
                    </div>
                  </div>

                  <div className="myorders-reason-section">
                    <label>Return Reason (Select One):</label>
                    <div className="myorders-return-reasons">
                      <label className="myorders-reason-option">
                        <input
                          type="radio"
                          name="returnReason"
                          value="Defective or Damaged Item"
                          checked={returnForm.returnReason === "Defective or Damaged Item"}
                          onChange={handleReturnFormChange}
                        />
                        Defective or Damaged Item
                      </label>
                      <label className="myorders-reason-option">
                        <input
                          type="radio"
                          name="returnReason"
                          value="Wrong Item Received"
                          checked={returnForm.returnReason === "Wrong Item Received"}
                          onChange={handleReturnFormChange}
                        />
                        Wrong Item Received
                      </label>
                      <label className="myorders-reason-option">
                        <input
                          type="radio"
                          name="returnReason"
                          value="Sizing or Fit Issues"
                          checked={returnForm.returnReason === "Sizing or Fit Issues"}
                          onChange={handleReturnFormChange}
                        />
                        Sizing or Fit Issues
                      </label>
                      <label className="myorders-reason-option">
                        <input
                          type="radio"
                          name="returnReason"
                          value="Received Extra Item"
                          checked={returnForm.returnReason === "Received Extra Item"}
                          onChange={handleReturnFormChange}
                        />
                        Received Extra Item
                      </label>
                      <label className="myorders-reason-option">
                        <input
                          type="radio"
                          name="returnReason"
                          value="Product Quality Issues"
                          checked={returnForm.returnReason === "Product Quality Issues"}
                          onChange={handleReturnFormChange}
                        />
                        Product Quality Issues
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="myorders-form-actions">
                <button type="button" onClick={closeReturnModal} className="myorders-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="myorders-submit-btn">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />

    </div>
  );
};

export default Myorders;
