import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from '../HeaderArea/CartSidebar';
import AddressFormModal from '../ProfileModal/AddressFormModal';
import '../../../sass/MyAddress.scss';

const MyAddress = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    profile_pic: '/imgs/profile.svg',
  });
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeMenuItem, setActiveMenuItem] = useState('address');
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [latestWishlistItem, setLatestWishlistItem] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    country: '',
    province: '',
    city: '',
    postal_code: '',
    street_address: ''
  });

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No authentication token found. Please log in.");

        const profileResponse = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = profileResponse.data.profile;
        const userId = profileResponse.data.user.id;
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/profile.svg',
        });

        fetchWishlist(token, userId);
        fetchCart(token, userId);
        fetchAddresses(token);
        fetchNotifications(token);
      } catch (err) {
        handleAuthError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const fetchAddresses = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const addressData = response.data.data || response.data;
      const cleanedAddresses = addressData.map(address => ({
        ...address,
        recipient_name: address.recipient_name.replace(/^\d+\s*/, '').trim()
      }));
      setAddresses(cleanedAddresses);
    } catch (error) {
      console.error("Error fetching addresses:", error.response?.data || error.message);
    }
  };

  const fetchWishlist = async (token, userId) => {
    try {
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wishlistData = response.data.data || response.data || [];
      const detailedWishlist = wishlistData.map(item => ({
        id: item.product_id,
        productName: item.product?.product_name || "Unknown Product",
        price: item.product?.price || 0,
        imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : '/default-image.jpg',
      }));
      setWishlistedItems(detailedWishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error.response?.data || error.message);
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
        size: item.size || "Not specified",
        color: item.color || "Not specified",
      }));
      setCartItems(detailedCart);
    } catch (error) {
      console.error("Error fetching cart:", error.response?.data || error.message);
    }
  };

  const fetchNotifications = async (token) => {
    try {
      console.log("Fetching notifications with token:", token); // Debug token
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notificationData = response.data.data || response.data || [];
      console.log("Raw API response:", response); // Log full response
      console.log("Parsed notifications:", notificationData); // Log parsed data
      setNotifications(notificationData);
      if (notificationData.length === 0) {
        console.log("No notifications returned from API.");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
      setNotifications([]); // Reset on error to avoid stale data
      setError("Failed to fetch notifications. Please try again later.");
    }
  };

  const handleLogout = () => {
    setActiveMenuItem('logout');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleMenuClick = (menuItem, path) => {
    setActiveMenuItem(menuItem);
    navigate(path);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?query=${searchQuery}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = {
      recipient_name: `${formData.first_name} ${formData.last_name}`,
      phone_number: formData.phone_number,
      country: formData.country,
      region: formData.province,
      city: formData.city,
      postal_code: formData.postal_code,
      street_address: formData.street_address,
    };

    try {
      if (selectedAddress) {
        await axios.put(`${API_URL}/addresses/${selectedAddress.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const response = await axios.post(`${API_URL}/addresses`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        payload.id = response.data.id;
        payload.is_default = response.data.is_default || (addresses.length === 0);
      }

      fetchAddresses(token);
      setFormData({
        first_name: '',
        last_name: '',
        phone_number: '',
        country: '',
        province: '',
        city: '',
        postal_code: '',
        street_address: ''
      });
      setShowAddressForm(false);
      setSelectedAddress(null);
      setError(null);
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setError('Failed to save address. Please try again.');
    }
  };

  const handleEdit = (address) => {
    const [firstName, ...lastNameParts] = address.recipient_name.split(' ');
    setFormData({
      first_name: firstName,
      last_name: lastNameParts.join(' '),
      phone_number: address.phone_number || '',
      country: address.country || '',
      province: address.region || '',
      city: address.city || '',
      postal_code: address.postal_code || '',
      street_address: address.street_address || ''
    });
    setSelectedAddress(address);
    setShowAddressForm(true);
  };

  const handleDelete = (address) => {
    setSelectedAddress(address);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/addresses/${selectedAddress.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses(token);
      setShowDeleteModal(false);
      setSelectedAddress(null);
    } catch (error) {
      console.error("Error deleting address:", error.response?.data || error.message);
      setError('Failed to delete address. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedAddress(null);
  };

  const handleSetDefault = async (addressId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API_URL}/addresses/${addressId}/set-default`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses((prevAddresses) =>
        prevAddresses.map((address) =>
          address.id === addressId
            ? { ...address, is_default: 1 }
            : { ...address, is_default: 0 }
        )
      );
    } catch (err) {
      console.error("Failed to set default address:", err.response?.data || err.message);
      setError('Failed to set default address. Please try again.');
    }
  };

  const handleAuthError = (err) => {
    if (err.message.includes("401") || err.response?.status === 401) {
      setError("Session expired. Please log in again.");
      localStorage.removeItem('token');
      navigate('/login');
    } else if (err.message.includes("403")) {
      setError("Access denied. Insufficient permissions.");
      navigate('/unauthorized');
    } else if (err.message.includes("404")) {
      setError("Profile not found.");
    } else {
      setError(err.message || "An error occurred.");
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

  const removeFromCart = (itemId) => async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart(token, profile.id);
    } catch (error) {
      console.error("Error removing from cart:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (latestWishlistItem) {
      const timer = setTimeout(() => setLatestWishlistItem(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [latestWishlistItem]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.notification-container') && !e.target.closest('.header-icon')) setIsNotificationOpen(false);
      if (!e.target.closest('.wishlist-container') && !e.target.closest('.header-icon')) setIsWishlistOpen(false);
      if (!e.target.closest('.support-container') && !e.target.closest('.support-link')) setIsSupportOpen(false);
      if (!e.target.closest('.cart-sidebar') && !e.target.closest('.header-icon')) setIsCartVisible(false);
      if (!e.target.closest('.profile-container') && !e.target.closest('.profile-button')) setIsProfileDropdownOpen(false);
    };

    if (isNotificationOpen || isWishlistOpen || isSupportOpen || isCartVisible || isProfileDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isNotificationOpen, isWishlistOpen, isSupportOpen, isCartVisible, isProfileDropdownOpen]);

  const wishlistCount = wishlistedItems.length;
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const notificationCount = notifications.length;

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="Profile">
      <Header
  isSearchOpen={isSearchOpen}
  setIsSearchOpen={setIsSearchOpen}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  handleSearchSubmit={handleSearchSubmit}
  isNotificationOpen={isNotificationOpen}
  setIsNotificationOpen={setIsNotificationOpen}
  isWishlistOpen={isWishlistOpen}
  setIsWishlistOpen={setIsWishlistOpen}
  wishlistedItems={wishlistedItems}
  wishlistCount={wishlistCount}
  latestWishlistItem={latestWishlistItem}
  isSupportOpen={isSupportOpen}
  setIsSupportOpen={setIsSupportOpen}
  isCartVisible={isCartVisible}
  setIsCartVisible={setIsCartVisible}
  cartCount={cartCount}
  userProfile={profile}
  isProfileDropdownOpen={isProfileDropdownOpen}
  setIsProfileDropdownOpen={setIsProfileDropdownOpen}
  handleLogout={handleLogout}
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
      <div className="profile-container">
        <h1 className="profile-title">My Addresses</h1>
        <div className="profile-body">
          <div className="sidebar">
            <div className="user-info">
              <img src={profile.profile_pic} alt="Profile" className="profile-pic" />
              <h2>{profile.first_name} {profile.last_name}</h2>
            </div>
            <ul className="nav-menu">
              <li className={activeMenuItem === 'profile' ? 'active' : ''} onClick={() => handleMenuClick('profile', '/profile')}>
                <img src="/imgs/myprofile.svg" alt="My Profile" /> My Profile
              </li>
              <li className={activeMenuItem === 'address' ? 'active' : ''} onClick={() => handleMenuClick('address', '/profile/my-address')}>
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
          <div className="profile-content">
            <div className="address-container">
              <div className="address-header">
                <h1>My Addresses</h1>
                <button className="add-address-btn" onClick={() => {
                  setFormData({
                    first_name: '',
                    last_name: '',
                    phone_number: '',
                    country: '',
                    province: '',
                    city: '',
                    postal_code: '',
                    street_address: ''
                  });
                  setSelectedAddress(null);
                  setShowAddressForm(true);
                }}>
                  Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="no-addresses">You haven't added any addresses yet.</p>
              ) : (
                <div className="addresses-list">
                  {addresses.map((address) => (
                    <div 
                      key={address.id} 
                      className={`address-item ${address.is_default === 1 ? 'is-default' : ''}`}
                      onClick={() => address.is_default !== 1 && handleSetDefault(address.id)}
                    >
                      {address.is_default === 1 && <span className="default-badge">Default</span>}
                      <div className="address-details">
                        <div className="recipient-info">
                          <p className="recipient-name">{address.recipient_name}</p>
                          <p className="phone-number">{address.phone_number}</p>
                          <p className="address-line">{address.street_address}</p>
                          <p className="address-line">{address.city}</p>
                          <p className="address-line">{address.region}, {address.postal_code}</p>
                        </div>
                        <div className="address-actions">
                          <button 
                            className="edit-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(address);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(address);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddressFormModal
        showAddressForm={showAddressForm}
        setShowAddressForm={setShowAddressForm}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        handleAddressSubmit={handleAddressSubmit}
      />

      {showDeleteModal && (
        <div className="delete-modal">
          <div className="modal-content">
            <h2>Delete Address?</h2>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmDelete}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyAddress;