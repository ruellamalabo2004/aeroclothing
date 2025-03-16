import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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

const ChangePassword = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    profile_pic: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('password');
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);

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

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const profileData = response.data.profile;
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/Profile.svg',
        });
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
      });

    // Load cart items from localStorage
    const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(storedCart);
  }, [navigate]);

  const handleMenuClick = (menuItem, path) => {
    setActiveMenuItem(menuItem);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirmation do not match!');
      return;
    }

    const formData = new FormData();
    formData.append('currentPassword', passwordData.currentPassword);
    formData.append('newPassword', passwordData.newPassword);

    axios
      .post('http://127.0.0.1:8000/api/change-password', formData)
      .then((response) => {
        console.log('Password updated:', response.data);
        alert('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      })
      .catch((error) => {
        console.error('Error updating password:', error);
        alert('Failed to update password.');
      });
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?query=${searchQuery}`);
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleWishlistToggle = () => {
    setIsWishlistOpen(!isWishlistOpen);
  };

  const handleSupportToggle = (e) => {
    e.preventDefault();
    setIsSupportOpen(!isSupportOpen);
  };

  const handleCartClick = () => {
    setIsCartVisible(!isCartVisible);
  };

  const handleStartShopping = () => {
    navigate('/shop');
    setIsCartVisible(false);
  };

  const handleCloseCart = () => {
    setIsCartVisible(false);
  };

  const handleProfileToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
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

  return (
    <div className="ChangePassword">
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
              <img 
                src="/imgs/DROPDOWN.SVG" 
                alt="Dropdown" 
                className="dropdown-icon" 
              />
            </Link>
            <div className={`support-dropdown ${!isSupportOpen ? 'hidden' : ''}`}>
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
            <div className={`notification-dropdown ${!isNotificationOpen ? 'hidden' : ''}`}>
              {notifications.length > 0 ? (
                notifications.map(notification => (
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
            <div className={`wishlist-dropdown ${!isWishlistOpen ? 'hidden' : ''}`}>
              {wishlistedItems.length > 0 ? (
                wishlistedItems.map(item => (
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
          <div className="profile-container">
            <button
              className={`profile-button ${isProfileDropdownOpen ? 'active' : ''}`}
              onClick={handleProfileToggle}
            >
              {profile.profile_pic ? (
                <img
                  src={profile.profile_pic}
                  alt="Profile"
                  className="profile-pic"
                />
              ) : (
                <img src="/imgs/Profile.svg" alt="Profile" className="profile-pic" />
              )}
            </button>
            <div className={`profile-dropdown ${!isProfileDropdownOpen ? 'hidden' : ''}`}>
              {profileDropdownItems.map((item, index) => (
                <React.Fragment key={index}>
                  <Link
                    to={item.path}
                    className="profile-item"
                    onClick={item.onClick || undefined}
                  >
                    {item.label}
                  </Link>
                  {index === 1 && <hr className="profile-separator" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className={`cart-sidebar ${isCartVisible ? 'active' : ''}`}>
        <div className="cart-content">
          <div className="cart-header">
            <h2>CART</h2>
            <span className="close-cart" onClick={handleCloseCart}>×</span>
          </div>
          <div className="cart-body">
            <img src="/imgs/emptycart.svg" alt="Empty Cart" className="empty-cart-icon" />
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
                src={profile.profile_pic}
                alt="Profile"
                className="profile-pic"
                onError={() => console.log('Image failed to load:', profile.profile_pic)}
              />
              <h2>{profile.first_name} {profile.last_name}</h2>
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
            <div className="change-password-form">
              <h2 className="form-title">Set Password</h2>
              <p className="form-subtitle">
                For your account’s security, do not share your password with anyone else
              </p>
              <div className="form-group full-width">
                <label>Old Password</label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.currentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter old password"
                  />
                  <img
                    src={showPasswords.currentPassword ? '/imgs/show.svg' : '/imgs/visible.svg'}
                    alt="Toggle visibility"
                    className="eye-icon"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label>New Password</label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.newPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                  />
                  <img
                    src={showPasswords.newPassword ? '/imgs/show.svg' : '/imgs/visible.svg'}
                    alt="Toggle visibility"
                    className="eye-icon"
                    onClick={() => togglePasswordVisibility('newPassword')}
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label>Confirm Password</label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.confirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                  <img
                    src={showPasswords.confirmPassword ? '/imgs/show.svg' : '/imgs/visible.svg'}
                    alt="Toggle visibility"
                    className="eye-icon"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="submit-button" onClick={handleSave}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChangePassword;