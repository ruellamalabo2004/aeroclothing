import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = [
    { label: "ORDERS & PAYMENTS", path: "/customer/support/order-payment" },
    { label: "SHIPPING", path: "/customer/support/shipping" },
    { label: "RETURNS", path: "/customer/support/returns" },
    { label: "CONTACT US", path: "/customer/support/contact-us" },
    { label: "TERMS AND SERVICES", path: "/customer/support/terms-and-service" },
    { label: "FAQS", path: "/customer/support/faqs" },
  ];

  const socialIcons = [
    { src: '/imgs/instagram.svg', alt: 'Instagram' },
    { src: '/imgs/facebook.svg', alt: 'Facebook' },
    { src: '/imgs/twitter.svg', alt: 'Twitter' },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          {footerLinks.map((link, index) => (
            <Link key={index} to={link.path} className="footer-link">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="footer-socials">
          <span>SOCIALS</span>
          <div className="social-icons">
            {socialIcons.map((icon, index) => (
              <img key={index} src={icon.src} alt={icon.alt} className="social-icon" />
            ))}
          </div>
        </div>
      </div>
      <div className="footer-copyright">
        <p>@2025 AERO. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    profileImage: '/imgs/profile.svg',
  });
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('profile');

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

  useEffect(() => {
    console.log('Profile component mounted. Current token:', localStorage.getItem('token'));
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const response = await fetch("http://127.0.0.1:8000/api/customer/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          console.log("Unauthorized! Redirecting to login.");
          localStorage.removeItem("token");
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const profileData = await response.json();
        console.log('Profile data fetched:', profileData);
        setProfile({
          firstName: profileData.first_name || '',
          middleName: profileData.middle_name || '',
          lastName: profileData.last_name || '',
          suffix: profileData.suffix || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          gender: profileData.gender || '',
          dateOfBirth: profileData.date_of_birth || '',
          profileImage: profileData.profile_image
            ? `http://127.0.0.1:8000/storage/${profileData.profile_image}`
            : '/imgs/profile.svg',
        });
        setImagePreview(
          profileData.profile_image
            ? `http://127.0.0.1:8000/storage/${profileData.profile_image}`
            : '/imgs/profile.svg'
        );
      } catch (err) {
        console.error('Fetch Profile Error:', err);
        handleAuthError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
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
    };

    if (isNotificationOpen || isWishlistOpen || isSupportOpen || isCartVisible) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isNotificationOpen, isWishlistOpen, isSupportOpen, isCartVisible]);

  const handleAuthError = (err) => {
    if (err.message.includes("401")) {
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
    const formData = new FormData();
    formData.append('first_name', profile.firstName);
    formData.append('middle_name', profile.middleName);
    formData.append('last_name', profile.lastName);
    formData.append('suffix', profile.suffix);
    formData.append('email', profile.email);
    formData.append('phone', profile.phone);
    formData.append('gender', profile.gender);
    formData.append('date_of_birth', profile.dateOfBirth);
    if (newProfileImage) {
      formData.append('profile_image', newProfileImage);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch("http://127.0.0.1:8000/api/update-profile", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        console.log("Unauthorized! Redirecting to login.");
        localStorage.removeItem("token");
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedData = await response.json();
      setProfile((prev) => ({
        ...prev,
        firstName: updatedData.first_name || prev.firstName,
        middleName: updatedData.middle_name || prev.middleName,
        lastName: updatedData.last_name || prev.lastName,
        suffix: updatedData.suffix || prev.suffix,
        email: updatedData.email || prev.email,
        phone: updatedData.phone || prev.phone,
        gender: updatedData.gender || prev.gender,
        dateOfBirth: updatedData.date_of_birth || prev.dateOfBirth,
        profileImage: updatedData.profile_image
          ? `http://127.0.0.1:8000/storage/${updatedData.profile_image}`
          : prev.profileImage,
      }));
      setNewProfileImage(null);
      setImagePreview(
        updatedData.profile_image
          ? `http://127.0.0.1:8000/storage/${updatedData.profile_image}`
          : '/imgs/profile.svg'
      );
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Save Profile Error:', err);
      handleAuthError(err);
    }
  };

  const handleProfileClick = () => navigate('/profile');
  const handleSearchClick = () => setIsSearchOpen((prev) => !prev);
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?query=${searchQuery}`);
  };
  const handleNotificationClick = () => setIsNotificationOpen((prev) => !prev);
  const handleWishlistToggle = () => setIsWishlistOpen((prev) => !prev);
  const handleSupportToggle = (e) => {
    e.preventDefault();
    setIsSupportOpen((prev) => !prev);
  };
  const handleCartClick = () => setIsCartVisible((prev) => !prev);
  const handleStartShopping = () => {
    navigate('/shop');
    setIsCartVisible(false);
  };
  const handleCloseCart = () => setIsCartVisible(false);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="Profile">
      <header className="login-header">
        <div className="logo-container">
          <img src="/imgs/logo.svg" alt="Aero Logo" className="logo" />
        </div>
        <nav className="nav-links">
          <Link to="/homepage">HOME</Link>
          <Link to="/shop">SHOP</Link>
          <Link to="/about">ABOUT US</Link>
          <div className="support-container">
            <Link
              to="/support"
              className={`support-link ${isSupportOpen ? 'active' : ''}`}
              onClick={handleSupportToggle}
            >
              SUPPORT
              <img src="/imgs/DROPDOWN.SVG" alt="Dropdown" className="dropdown-icon" />
            </Link>
            <div className={`support-dropdown ${isSupportOpen ? '' : 'hidden'}`}>
              {supportItems.map((item, index) => (
                <Link key={index} to={item.path} className="support-item">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <div className="header-icons">
          <div className="search-container">
            {isSearchOpen && (
              <form onSubmit={handleSearchSubmit} className="search-form">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                  autoFocus
                />
              </form>
            )}
            <img
              src="/imgs/Search.svg"
              alt="Search"
              className="header-icon search-icon"
              onClick={handleSearchClick}
            />
          </div>
          <div className="notification-container">
            <img
              src="/imgs/notif.svg"
              alt="Notification"
              className="header-icon"
              onClick={handleNotificationClick}
            />
            <div className={`notification-dropdown ${isNotificationOpen ? '' : 'hidden'}`}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <p>{notification.message}</p>
                    <span>{notification.time}</span>
                  </div>
                ))
              ) : (
                <p className="no-notifications">No new notifications</p>
              )}
            </div>
          </div>
          <div className="wishlist-container">
            <img
              src="/imgs/Wish.svg"
              alt="Wishlist"
              className="header-icon"
              onClick={handleWishlistToggle}
            />
            <div className={`wishlist-dropdown ${isWishlistOpen ? '' : 'hidden'}`}>
              {wishlistedItems.length > 0 ? (
                wishlistedItems.map((item) => (
                  <div key={item.id} className="wishlist-item">
                    <div className="wishlist-item-details">
                      <p>{item.name}</p>
                      <span>{item.price}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-wishlist-items">No items in wishlist</p>
              )}
            </div>
          </div>
          <img
            src="/imgs/Cart.svg"
            alt="Cart"
            className="header-icon"
            onClick={handleCartClick}
          />
          <button className="profile-button" onClick={handleProfileClick}>
            <img src="/imgs/Profile.svg" alt="Profile" />
          </button>
        </div>
      </header>

      <div className={`cart-sidebar ${isCartVisible ? 'active' : ''}`}>
        <div className="cart-content">
          <div className="cart-header">
            <h2>CART</h2>
            <span className="close-cart" onClick={handleCloseCart}></span>
          </div>
          <div className="cart-body">
            <img src="/imgs/empty-cart.svg" alt="Empty Cart" className="empty-cart-icon" />
            <p>Your cart is currently empty.</p>
            <button className="start-shopping-btn" onClick={handleStartShopping}>
              START SHOPPING
            </button>
          </div>
        </div>
      </div>

      <div className="profile-container">
        <h1 className="profile-title">Profile Information</h1>
        <div className="profile-body">
          <div className="sidebar">
            <div className="user-info">
              <img
                src={imagePreview || profile.profileImage}
                alt="Profile"
                className="profile-pic"
              />
              <h2>{profile.firstName} {profile.lastName}</h2>
            </div>
            <ul className="nav-menu">
              <li
                className={activeMenuItem === 'profile' ? 'active' : ''}
                onClick={() => handleMenuClick('profile', '/profile')}
              >
                <img src="/imgs/user.svg" alt="My Profile" /> My Profile
              </li>
              <li
                className={activeMenuItem === 'address' ? 'active' : ''}
                onClick={() => handleMenuClick('address', '/profile/address')}
              >
                <img src="/imgs/location.svg" alt="My Address" /> My Address
              </li>
              <li
                className={activeMenuItem === 'password' ? 'active' : ''}
                onClick={() => handleMenuClick('password', '/profile/change-password')}
              >
                <img src="/imgs/lock.svg" alt="Change Password" /> Change Password
              </li>
              <li
                className={activeMenuItem === 'wishlist' ? 'active' : ''}
                onClick={() => handleMenuClick('wishlist', '/profile/wishlist')}
              >
                <img src="/imgs/heart.svg" alt="My Wishlist" /> My Wishlist
              </li>
              <li
                className={activeMenuItem === 'orders' ? 'active' : ''}
                onClick={() => handleMenuClick('orders', '/profile/orders')}
              >
                <img src="/imgs/order.svg" alt="My Orders" /> My Orders
              </li>
              <li
                className={activeMenuItem === 'cart' ? 'active' : ''}
                onClick={() => handleMenuClick('cart', '/profile/cart')}
              >
                <img src="/imgs/cart.svg" alt="My Cart" /> My Cart
              </li>
              <li
                className={activeMenuItem === 'logout' ? 'active' : ''}
                onClick={handleLogout}
              >
                <img src="/imgs/logout.svg" alt="Logout" /> Logout
              </li>
            </ul>
          </div>
          <div className="profile-content">
            <div className="profile-form">
              <div className="add-profile-image">
                <h3>ADD PROFILE IMAGE</h3>
                <img
                  src={imagePreview || profile.profileImage}
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
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group-item">
                    <label>Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={profile.middleName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
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
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
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
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-actions">
                  <button className="save-button" onClick={handleSave}>
                    Save
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