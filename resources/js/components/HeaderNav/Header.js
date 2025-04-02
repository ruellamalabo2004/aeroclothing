import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = ({
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  isNotificationOpen,
  setIsNotificationOpen,
  isWishlistOpen,
  setIsWishlistOpen,
  wishlistedItems,
  wishlistCount,
  latestWishlistItem,
  handleWishlistToggle,
  isSupportOpen,
  setIsSupportOpen,
  supportItems,
  isCartVisible,
  setIsCartVisible,
  cartCount,
  userProfile,
  isProfileDropdownOpen,
  setIsProfileDropdownOpen,
  profileDropdownItems,
}) => {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const API_URL = "http://127.0.0.1:8000/api";

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) setSearchQuery('');
  };

  const handleNotificationClick = () => setIsNotificationOpen(!isNotificationOpen);
  const handleWishlistClick = () => setIsWishlistOpen(!isWishlistOpen);
  const handleSupportToggle = (e) => {
    e.preventDefault();
    setIsSupportOpen(!isSupportOpen);
  };
  const handleCartClick = () => setIsCartVisible(!isCartVisible);
  const handleProfileToggle = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  const handleNotificationItemClick = (notification) => {
    const match = notification.message.match(/#(\d+)/);
    const orderId = match ? match[1] : null;
    if (orderId) {
      setIsNotificationOpen(false);
      navigate(`/my-orders/${orderId}`);
    }
  };

  const handleWishlistItemClick = (item) => {
    setIsWishlistOpen(false);
    navigate(`/customer/item/${item.id}`);
  };

  const fetchNotifications = async (token, userId) => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const notificationsData = response.data.data || response.data || [];
      console.log("Notifications Data:", notificationsData); // Debug log
      const formattedNotifications = notificationsData.map((notification) => ({
        id: notification.id,
        message: `Your order #${notification.order_id} has been ${notification.status.toLowerCase()}!`,
        time: formatTimeAgo(new Date(notification.created_at)),
        productImage: notification.product_image || '/default-image.jpg',
      }));
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
      setNotifications([]);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 },
    ];
    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && userProfile?.id) {
      fetchNotifications(token, userProfile.id); // Initial fetch
      const interval = setInterval(() => {
        fetchNotifications(token, userProfile.id); // Poll every 60 seconds
      }, 60000);
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [userProfile]);

  useEffect(() => {
    if (latestWishlistItem) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000); // Notification disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [latestWishlistItem]);

  useEffect(() => {
    console.log("Current Notifications in Header:", notifications);
    console.log("Current wishlist Isaac:", wishlistCount); // Debug log for wishlist count
  }, [notifications, wishlistCount]);

  // Function to render the styled message (unchanged)
  const renderStyledMessage = (message) => {
    const parts = message.split(/(Order #\d+)/);
    return parts.map((part, index) => {
      if (part.match(/Order #\d+/)) {
        return (
          <span key={index} style={{ fontWeight: 'bold', color: '#e5383b' }}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Get the 4 most recent wishlist items (assuming sorted in HomePage.js)
  const recentWishlistItems = wishlistedItems.slice(0, 4);

  return (
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
          <div className="notification-icon-wrapper">
            <img
              src="/imgs/notif.svg"
              alt="Notification"
              className="header-icon"
              onClick={handleNotificationClick}
            />
            {notifications.length > 0 && (
              <span className="notification-count">{notifications.length}</span>
            )}
          </div>
          <div className={`notification-dropdown ${!isNotificationOpen ? 'hidden' : ''}`}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="notification-item"
                  onClick={() => handleNotificationItemClick(notification)}
                >
                  <img src={notification.productImage} alt="Product" />
                  <div className="notification-content">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: notification.message.replace(
                          /(Order #\d+)/,
                          '<span class="order-number">$1</span>'
                        ),
                      }}
                    />
                    <span className="time">{notification.time}</span>
                  </div>
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
            onClick={handleWishlistClick}
          />
          {wishlistCount >= 0 && (
            <span className="wishlist-count">{wishlistCount}</span>
          )}
          <div className={`wishlist-dropdown ${!isWishlistOpen ? 'hidden' : ''}`}>
            {latestWishlistItem && showNotification ? (
              <div className="wishlist-notification">
                <img
                  src={latestWishlistItem.imagePreview || '/default-image.jpg'}
                  alt={latestWishlistItem.productName}
                  className="wishlist-item-image"
                />
                <p>You added {latestWishlistItem.productName} to your wishlist! 💖</p>
              </div>
            ) : null}
            {recentWishlistItems.length > 0 ? (
              <>
                {recentWishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="wishlist-item"
                    onClick={() => handleWishlistItemClick(item)}
                  >
                    <img
                      src={item.imagePreview || '/default-image.jpg'}
                      alt={item.productName}
                      className="wishlist-item-image"
                    />
                    <div className="wishlist-item-details">
                      <p>{item.productName}</p>
                    </div>
                  </div>
                ))}
                <button
                  className="show-more-btn small"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent closing dropdown
                    setIsWishlistOpen(false);
                    navigate('/profile/wishlist');
                  }}
                >
                  Show More
                </button>
              </>
            ) : (
              <p className="no-wishlist-items">Your wishlist is empty.</p>
            )}
          </div>
        </div>
        <div className="cart-icon-container">
          <img
            src="/imgs/Cart.svg"
            alt="Cart"
            className="header-icon"
            onClick={handleCartClick}
          />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </div>
        <div className="profile-container">
          <button
            className={`profile-button ${isProfileDropdownOpen ? 'active' : ''}`}
            onClick={handleProfileToggle}
          >
            {userProfile?.profile_pic ? (
              <img src={userProfile.profile_pic} alt="Profile" className="profile-pic" />
            ) : (
              <img src="/imgs/Profile.svg" alt="Profile" className="profile-pic" />
            )}
          </button>
          <div className={`profile-dropdown ${!isProfileDropdownOpen ? 'hidden' : ''}`}>
            {profileDropdownItems.map((item, index) => (
              <React.Fragment key={index}>
                {item.label === "Logout" ? (
                  <div className="profile-item" onClick={item.onClick}>
                    {item.label}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className="profile-item"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
                {index === 1 && <hr className="profile-separator" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;