import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from '../HeaderArea/CartSidebar';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize cartItems from either cartItems (from cart) or a single product (from Buy Now)
  const initialCartItems = location.state?.cartItems || 
    (location.state?.product ? [{
      id: location.state.product.id,
      productName: location.state.product.productName,
      price: location.state.product.price,
      imagePreview: location.state.product.imagePreview,
      quantity: location.state.quantity || 1,
    }] : []);
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
    email: '',
    firstName: '',
    lastName: '',
    country: 'Philippines',
    city: '',
    region: '',
    postalCode: '',
    streetAddress: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  const [couriers, setCouriers] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);
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
    const fetchProfileAndCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const [profileResponse, couriersResponse] = await Promise.all([
          axios.get(`${API_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/couriers`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const profileData = profileResponse.data.profile;
        const userData = profileResponse.data.user;

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
          email: userData?.email || '',
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          country: 'Philippines',
          city: '',
          region: '',
          postalCode: '',
          streetAddress: '',
        });

        setCouriers(couriersResponse.data);

        // If no cartItems were passed via state, fetch from backend
        if (initialCartItems.length === 0) {
          await fetchCart(token, userProfile.id);
        }
      } catch (error) {
        console.error('Error fetching data in Checkout:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
        setError('Failed to load checkout data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndCart();
  }, [navigate]);

  useEffect(() => {
    if (cartItems.length === 0 && !location.state?.product) {
      setError('Your cart is empty. Please add items to proceed with checkout.');
    } else {
      setError(null); // Clear error if there are items
    }
  }, [cartItems, location.state]);

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
      await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
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

  const clearCartBackend = async (token) => {
    try {
      await axios.delete(`${API_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error.response?.data || error.message);
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

  const calculateShippingCost = () => {
    const courier = couriers.find(c => c.id === parseInt(selectedCourier));
    return courier ? parseFloat(courier.shipping_fee) : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShippingCost();
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCourierChange = (e) => {
    setSelectedCourier(e.target.value);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!shippingInfo.email || !shippingInfo.firstName || !shippingInfo.lastName || 
        !shippingInfo.country || !shippingInfo.city || !shippingInfo.region || 
        !shippingInfo.postalCode || !shippingInfo.streetAddress) {
      setError('Please fill in all shipping details.');
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method.');
      return;
    }

    if (!selectedCourier) {
      setError('Please select a courier for shipping.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!userProfile?.profile_id) {
      setError('User profile not loaded. Please try again.');
      return;
    }

    if (cartItems.length === 0) {
      setError('No items in cart to checkout.');
      return;
    }

    const orderData = {
      profile_id: userProfile.profile_id,
      payment_method: paymentMethod,
      courier_id: parseInt(selectedCourier),
      total_amount: calculateTotal(),
      order_details: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Order placed:', response.data);
      setOrderId(response.data.order.id);
      setIsSuccessModalOpen(true);
      setError(null);

      await clearCartBackend(token);
    } catch (err) {
      console.error('Error placing order:', err.response?.data || err.message);
      const errors = err.response?.data?.errors;
      if (err.response?.status === 422 && errors) {
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        setError(`Failed to place order: ${errorMessages}`);
      } else {
        setError('Failed to place order: ' + (err.response?.data?.message || err.message));
      }
    }
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
    if (orderId) {
      navigate(`/my-orders/${orderId}`);
    } else {
      navigate('/profile/orders');
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const wishlistCount = wishlistedItems.length;

  if (loading) return <div className="loading">Loading checkout...</div>;

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
            <div className="shipping-container">
              <h2>Shipping Information</h2>
              <form className="shipping-form" onSubmit={handlePlaceOrder}>
                <div className="account-section">
                  <div className="form-group full-width">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      required
                      readOnly
                    />
                  </div>
                </div>

                <div className="shipping-info-section">
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
                        readOnly
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
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleShippingChange}
                      required
                      readOnly
                    />
                  </div>
                  <div className="form-group full-width">
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
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="region">Region</label>
                      <input
                        type="text"
                        id="region"
                        name="region"
                        value={shippingInfo.region}
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
                      className="long-textarea"
                    />
                  </div>
                </div>

                <div className="courier-container">
                  <h3>Select Courier</h3>
                  {couriers.length > 0 ? (
                    <table className="courier-table">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Courier</th>
                          <th>Estimated Delivery</th>
                          <th>Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {couriers.map((courier) => (
                          <tr key={courier.id}>
                            <td>
                              <input
                                type="radio"
                                name="courier"
                                value={courier.id}
                                checked={selectedCourier === String(courier.id)}
                                onChange={handleCourierChange}
                              />
                            </td>
                            <td>{courier.name}</td>
                            <td>{courier.estimated_delivery_time || 'N/A'}</td>
                            <td>₱{parseFloat(courier.shipping_fee).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No couriers available at this time.</p>
                  )}
                </div>
              </form>
            </div>

            <div className="payment-container">
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
                  Credit Card / Debit Card
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={handlePaymentChange}
                  />
                  Paypal
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
              <span>₱{calculateShippingCost().toFixed(2)}</span>
            </div>
            <div className="summary-total grand-total">
              <span>Total</span>
              <span>₱{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="summary-actions">
              <button className="view-cart-btn" onClick={handleViewCart}>
                View Cart
              </button>
              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0 || !paymentMethod || !shippingInfo.email || !selectedCourier}
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
              Your order number is #{orderId || 'N/A'}
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