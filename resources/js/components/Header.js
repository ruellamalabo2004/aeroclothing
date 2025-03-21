import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  isNotificationOpen,
  setIsNotificationOpen,
  notifications,
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
  const [showWishlistCount, setShowWishlistCount] = useState(wishlistCount > 0);

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

  useEffect(() => {
    if (latestWishlistItem) {
      setShowNotification(true);
      setShowWishlistCount(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        setShowWishlistCount(false);
        setTimeout(() => setShowWishlistCount(wishlistCount > 0), 1000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [latestWishlistItem, wishlistCount]);

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
          <img
            src="/imgs/notif.svg"
            alt="Notification"
            className="header-icon"
            onClick={handleNotificationClick}
          />
          <div className={`notification-dropdown ${!isNotificationOpen ? 'hidden' : ''}`}>
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
            onClick={handleWishlistClick}
          />
          {showWishlistCount && wishlistCount > 0 && (
            <span className="wishlist-count">{wishlistCount}</span>
          )}
          <div
            className={`wishlist-dropdown ${!isWishlistOpen ? 'hidden' : ''}`}
            onClick={() => {
              setIsWishlistOpen(false);
              navigate('/profile/wishlist');
            }}
          >
            {latestWishlistItem && showNotification ? (
              <div className="wishlist-notification">
                <img
                  src={latestWishlistItem.imagePreview || '/default-image.jpg'}
                  alt={latestWishlistItem.productName}
                  className="wishlist-item-image"
                  style={{ width: '30px', height: '30px', marginRight: '10px' }}
                />
                <p>Added to Wishlist: {latestWishlistItem.productName}</p>
              </div>
            ) : (
              <p className="no-wishlist-items">Click to view your wishlist.</p>
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
              <img
                src={userProfile.profile_pic}
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
  );
};

export default Header;