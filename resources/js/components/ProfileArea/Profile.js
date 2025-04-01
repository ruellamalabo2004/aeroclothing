import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from '../HeaderArea/CartSidebar'; // Import the CartSidebar component

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    phone_number: '',
    gender: '',
    date_of_birth: '',
    profile_pic: '/imgs/profile.svg',
  });
  const [displayedName, setDisplayedName] = useState({
    first_name: '',
    last_name: '',
  });
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [latestWishlistItem, setLatestWishlistItem] = useState(null);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('profile');
  const [cartItems, setCartItems] = useState([]);

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
    { label: "FAQS", path: "/customer/support/faqs" },
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
          throw new Error("No authentication token found. Please log in.");
        }

        const response = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileData = response.data.profile;
        const userData = response.data.user;

        const userProfile = {
          id: userData.id,
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
            : '/imgs/profile.svg',
        };

        setProfile(userProfile);
        setDisplayedName({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
        });
        setImagePreview(userProfile.profile_pic);

        fetchWishlist(token, userProfile.id);
        fetchCart(token, userProfile.id);
      } catch (err) {
        console.error('Fetch Profile Error:', err);
        handleAuthError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

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
      }));
      setCartItems(detailedCart);
    } catch (error) {
      console.error("Error fetching cart:", error.response?.data || error.message);
    }
  };

  // Add to Wishlist
  const addToWishlist = async (product) => {
    const token = localStorage.getItem('token');
    const userId = profile?.id;
    try {
      const response = await axios.post(`${API_URL}/wishlist`, {
        user_id: userId,
        product_id: product.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLatestWishlistItem({
        id: product.id,
        productName: product.name || product.productName,
        price: product.price,
        imagePreview: product.imagePreview,
      });
      fetchWishlist(token, userId);
    } catch (error) {
      console.error("Error adding to wishlist:", error.response?.data || error.message);
      if (error.response?.status === 409) fetchWishlist(token, userId);
    }
  };

  // Remove from Wishlist
  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    const userId = profile?.id;
    try {
      await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWishlist(token, userId);
    } catch (error) {
      console.error("Error removing from wishlist:", error.response?.data || error.message);
    }
  };

  // Remove from cart
  const removeFromCartBackend = async (productId) => {
    const token = localStorage.getItem('token');
    const userId = profile?.id;
    try {
      const response = await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Remove from cart response:", response.data);
      fetchCart(token, userId);
    } catch (error) {
      console.error("Error removing from cart:", error.response?.data || error.message);
    }
  };

  // Cart quantity controls
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
    await removeFromCartBackend(itemId);
  };

  // Wishlist toggle handler
  const handleWishlistToggle = (product) => async () => {
    const isWishlisted = wishlistedItems.some((item) => item.id === product.id);
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  // Clear latestWishlistItem after 3 seconds
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

  const handleMenuClick = (menuItem, path) => {
    setActiveMenuItem(menuItem);
    navigate(path);
  };

  const handleLogout = () => {
    setActiveMenuItem('logout');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size exceeds 1MB limit.');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Only JPEG or PNG files are allowed.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append('first_name', profile.first_name);
    formData.append('middle_name', profile.middle_name);
    formData.append('last_name', profile.last_name);
    formData.append('suffix', profile.suffix);
    formData.append('email', profile.email);
    formData.append('phone_number', profile.phone_number);
    formData.append('gender', profile.gender);
    formData.append('date_of_birth', profile.date_of_birth);
    if (newProfileImage) formData.append('profile_image', newProfileImage);
    formData.append('_method', 'PUT');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No authentication token found. Please log in.");

      const response = await fetch(`${API_URL}/update-profile`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate('/login');
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedData = await response.json();
      setProfile((prev) => ({
        ...prev,
        first_name: updatedData.profile?.first_name || prev.first_name,
        middle_name: updatedData.profile?.middle_name || prev.middle_name,
        last_name: updatedData.profile?.last_name || prev.last_name,
        suffix: updatedData.profile?.suffix || prev.suffix,
        email: updatedData.user?.email || prev.email,
        phone_number: updatedData.profile?.phone_number || prev.phone_number,
        gender: updatedData.profile?.gender || prev.gender,
        date_of_birth: updatedData.profile?.date_of_birth || prev.date_of_birth,
        profile_pic: updatedData.profile?.profile_pic
          ? `${BASE_IMAGE_URL}/${updatedData.profile.profile_pic}`
          : prev.profile_pic,
      }));

      setDisplayedName({
        first_name: updatedData.profile?.first_name || profile.first_name,
        last_name: updatedData.profile?.last_name || profile.last_name,
      });

      setNewProfileImage(null);
      setImagePreview(updatedData.profile?.profile_pic
        ? `${BASE_IMAGE_URL}/${updatedData.profile.profile_pic}`
        : profile.profile_pic);

      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Save Profile Error:', err);
      alert(err.message || 'Failed to update profile. Please try again.');
      if (err.message.includes("token") || err.message.includes("expired")) handleAuthError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?query=${searchQuery}`);
  };

  const wishlistCount = wishlistedItems.length;
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (loading) return <div className="loading">Loading profile...</div>;
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
        notifications={notifications}
        isWishlistOpen={isWishlistOpen}
        setIsWishlistOpen={setIsWishlistOpen}
        wishlistedItems={wishlistedItems}
        wishlistCount={wishlistCount}
        latestWishlistItem={latestWishlistItem}
        handleWishlistToggle={handleWishlistToggle}
        isSupportOpen={isSupportOpen}
        setIsSupportOpen={setIsSupportOpen}
        supportItems={supportItems}
        isCartVisible={isCartVisible}
        setIsCartVisible={setIsCartVisible}
        cartCount={cartCount}
        userProfile={profile}
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
      <div className="profile-container">
        <h1 className="profile-title">Profile Information</h1>
        <div className="profile-body">
          <div className="sidebar">
            <div className="user-info">
              <img
                src={imagePreview || profile.profile_pic}
                alt="Profile"
                className="profile-pic"
              />
              <h2>{displayedName.first_name} {displayedName.last_name}</h2>
            </div>
            <ul className="nav-menu">
              <li
                className={activeMenuItem === 'profile' ? 'active' : ''}
                onClick={() => handleMenuClick('profile', '/profile')}
              >
                <img src="/imgs/myprofile.svg" alt="My Profile" /> My Profile
              </li>
              <li
                className={activeMenuItem === 'address' ? 'active' : ''}
                onClick={() => handleMenuClick('address', '/profile/address')}
              >
                <img src="/imgs/myaddress.svg" alt="My Address" /> My Address
              </li>
              <li
                className={activeMenuItem === 'password' ? 'active' : ''}
                onClick={() => handleMenuClick('password', '/profile/change-password')}
              >
                <img src="/imgs/mypassword.svg" alt="Change Password" /> Change Password
              </li>
              <li
                className={activeMenuItem === 'wishlist' ? 'active' : ''}
                onClick={() => handleMenuClick('wishlist', '/profile/wishlist')}
              >
                <img src="/imgs/mywishlist.svg" alt="My Wishlist" /> My Wishlist
              </li>
              <li
                className={activeMenuItem === 'orders' ? 'active' : ''}
                onClick={() => handleMenuClick('orders', '/profile/orders')}
              >
                <img src="/imgs/myorder.svg" alt="My Orders" /> My Orders
              </li>
              <li
                className={activeMenuItem === 'cart' ? 'active' : ''}
                onClick={() => handleMenuClick('cart', '/profile/cart')}
              >
                <img src="/imgs/mycarts.svg" alt="My Cart" /> My Cart
              </li>
              <li
                className={activeMenuItem === 'logout' ? 'active' : ''}
                onClick={handleLogout}
              >
                <img src="/imgs/mylogout.svg" alt="Logout" /> Logout
              </li>
            </ul>
          </div>
          <div className="profile-content">
            <div className="profile-form">
              <div className="add-profile-image">
                <h3>ADD PROFILE IMAGE</h3>
                <img
                  src={imagePreview || profile.profile_pic}
                  alt="Profile Preview"
                  className="preview-image"
                />
                <p>File size: Maximum 1MB</p>
                <p>File Extension: JPEG, PNG</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  id="profileImageInput"
                  style={{ display: 'none' }}
                />
                <button
                  className="select-image"
                  onClick={() => document.getElementById('profileImageInput').click()}
                >
                  Select Image
                </button>
              </div>
              <div className="form-fields">
                <div className="form-group name-row">
                  <div className="form-group-item">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={profile.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group-item">
                    <label>Middle Name</label>
                    <input
                      type="text"
                      name="middle_name"
                      value={profile.middle_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={profile.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Suffix</label>
                  <input
                    type="text"
                    name="suffix"
                    value={profile.suffix}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={profile.phone_number}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={profile.date_of_birth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="save-button"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;