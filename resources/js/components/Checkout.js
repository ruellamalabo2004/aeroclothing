import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialCartItems = location.state?.cartItems || [];
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [isOrderNoteOpen, setIsOrderNoteOpen] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    province: '',
    city: '',
    postalCode: '',
    streetAddress: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

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
  ];

  const profileDropdownItems = [
    { label: "My Profile", path: "/profile" },
    { label: "My Orders", path: "/profile/orders" },
    { label: "Logout", path: "#", onClick: handleLogout },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileData = response.data.profile;
        const userData = response.data.user;

        const userProfile = {
          id: userData.id,
          profile_id: profileData.id,
          first_name: profileData.first_name || '',
          middle_name: profileData.middle_name || '',
          last_name: profileData.last_name || '',
          suffix: profileData.suffix || '',
          email: userData?.email || '',
          phone_number: profileData.phone_number || '',
          gender: profileData.gender || '',
          date_of_birth: profileData.date_of_birth || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/Profile.svg',
        };

        setUserProfile(userProfile);
        setShippingInfo({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          phone: profileData.phone_number || '',
          country: 'Philippines',
          province: '',
          city: '',
          postalCode: '',
          streetAddress: '',
        });
      } catch (error) {
        console.error('Error fetching profile in Checkout:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/profile/cart', { state: { message: 'No items in cart to checkout.' } });
    }
  }, [cartItems, navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  const handleWishlistToggle = (product) => () => {
    setWishlistedItems((prev) => {
      const isWishlisted = prev.some((w) => w.id === product.id);
      return isWishlisted ? prev.filter((w) => w.id !== product.id) : [...prev, product];
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.notification-container') && !e.target.closest('.header-icon')) {
      setIsNotificationOpen(false);
    }
    if (!e.target.closest('.wishlist-container') && !e.target.closest('.header-icon')) {
      setIsWishlistOpen(false);
    }
    if (!e.target.closest('.support-container') && !e.target.closest('.support-link')) {
      setIsSupportOpen(false);
    }
    if (!e.target.closest('.cart-sidebar') && !e.target.closest('.header-icon')) {
      setIsCartVisible(false);
    }
    if (!e.target.closest('.profile-container') && !e.target.closest('.profile-button')) {
      setIsProfileDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isNotificationOpen || isWishlistOpen || isSupportOpen || isCartVisible || isProfileDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isNotificationOpen, isWishlistOpen, isSupportOpen, isCartVisible, isProfileDropdownOpen]);

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
    if (!token || !userId) {
      console.error('No token or userId available');
      return;
    }
    try {
      const response = await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart(token, userId);
    } catch (error) {
      console.error("Error removing from cart:", error.response?.data || error.message);
    }
  };

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

  const removeFromCart = (itemId) => async () => {
    await removeFromCartBackend(itemId);
  };

  const toggleOrderNote = () => {
    setIsOrderNoteOpen(!isOrderNoteOpen);
  };

  const handleOrderNoteChange = (e) => {
    setOrderNote(e.target.value);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.phone || 
        !shippingInfo.country || !shippingInfo.city || !shippingInfo.postalCode || 
        !shippingInfo.streetAddress) {
      setError('Please fill in all shipping details.');
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!userProfile?.id || !userProfile?.profile_id) {
      setError('User profile not loaded. Please try again.');
      return;
    }

    if (cartItems.length === 0) {
      setError('No items in cart to checkout.');
      return;
    }

    try {
      const orderData = {
        shipping_id: 1, // Placeholder, replace with actual shipping ID logic
        product_id: cartItems[0].id, // Assuming single item for simplicity
        customer: `${shippingInfo.firstName} ${shippingInfo.lastName}`, // Combine first and last name
        payment_method: paymentMethod || 'cod', // Default to COD if not selected
        total_amount: calculateSubtotal() + 50, // Subtotal + Shipping
        date: new Date().toISOString().split('T')[0], // Current date
        status: 'Pending', // Initial status, backend can update
        created_at: new Date().toISOString(), // Current timestamp
        updated_at: new Date().toISOString(), // Current timestamp
        archive_at: null, // Null for now
      };

      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Order placed:', response.data);
      setIsSuccessModalOpen(true); // Show modal on success
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error placing order:', err.response?.data || err.message);
      setError('Failed to place order: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    navigate('/profile/cart');
  };

  const handleViewCart = () => {
    window.location.href = 'http://127.0.0.1:8000/cart';
  };

  const handleContinueShopping = () => {
    setIsSuccessModalOpen(false);
    navigate('/shop');
  };

  const handleTrackOrder = () => {
    setIsSuccessModalOpen(false);
    navigate('/profile/orders');
  };

  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const wishlistCount = wishlistedItems.length;

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="Checkout">
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
        handleWishlistToggle={handleWishlistToggle}
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
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-body">
          <div className="checkout-details">
            <h2>Shipping Information</h2>
            <form className="shipping-form" onSubmit={handlePlaceOrder}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="province">Province</label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={shippingInfo.province}
                    onChange={handleShippingChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label htmlFor="streetAddress">Street Address</label>
                <textarea
                  id="streetAddress"
                  name="streetAddress"
                  value={shippingInfo.streetAddress}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit
                </button>
              </div>
            </form>

            <h2>Payment Method</h2>
            <div className="payment-methods">
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="creditCard"
                  checked={paymentMethod === 'creditCard'}
                  onChange={handlePaymentChange}
                />
                Credit Card
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={handlePaymentChange}
                />
                PayPal
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={handlePaymentChange}
                />
                Cash on Delivery
              </label>
            </div>
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <img src={item.imagePreview || '/default-image.jpg'} alt={item.productName} className="summary-item-image" />
                  <div className="summary-item-details">
                    <p className="summary-item-name">{item.productName}</p>
                    <p className="summary-item-quantity">Quantity: {item.quantity}</p>
                    <p className="summary-item-price">₱{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No items in cart. Please add items before checking out.</p>
            )}
            <div className="summary-total">
              <span>Subtotal</span>
              <span>₱{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="summary-total">
              <span>Shipping</span>
              <span>₱50.00</span>
            </div>
            <div className="summary-total grand-total">
              <span>Total</span>
              <span>₱{(calculateSubtotal() + 50).toFixed(2)}</span>
            </div>
            <div className="summary-actions">
              <button className="view-cart-btn" onClick={handleViewCart}>
                View Cart
              </button>
              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0 || !paymentMethod || !shippingInfo.firstName}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {isSuccessModalOpen && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Order Placed Successfully!</h2>
            <p className="success-message">
              We've received your order and it will ship in 5-7 business days. <br />
              Your order number is #1
            </p>
            <div className="modal-actions">
              <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
              <button className="track-order-btn" onClick={handleTrackOrder}>
                Track Order
              </button>
            </div>
          </div>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Checkout;