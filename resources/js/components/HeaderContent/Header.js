import React, { useState, useEffect } from 'react';
import { Search, Heart, Bell, ShoppingBag, ChevronDown, Menu, User, Settings, LogOut, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    return !!(token && userData);
  });
  const [user, setUser] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('/images/profile-pic.jpg');
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = "http://127.0.0.1:8000/api";

  // Fetch user profile data
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const userData = response.data;
      console.log('Profile fetched:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch profile:', error.response?.data || error.message);
      setUser(null);
      setProfilePicUrl('/images/profile-pic.jpg');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        navigate('/login');
      }
    }
  };

  // Construct the profile picture URL
  const getProfileImageUrl = () => {
    if (!user || !user.profile || !user.profile.profile_pic) {
      return '/images/profile-pic.jpg';
    }

    const profilePicPath = user.profile.profile_pic;

    if (profilePicPath.startsWith('http')) {
      return profilePicPath;
    } else if (profilePicPath.startsWith('/')) {
      return `http://127.0.0.1:8000${profilePicPath}`;
    } else {
      return `http://127.0.0.1:8000/storage/${profilePicPath}`;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.profile && parsedUser.profile.profile_pic) {
        setProfilePicUrl(getProfileImageUrl());
      } else {
        setProfilePicUrl('/images/profile-pic.jpg');
      }
      fetchUserProfile(token);
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setProfilePicUrl('/images/profile-pic.jpg');
    }
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleSupportDropdown = () => {
    setIsSupportOpen(!isSupportOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setProfilePicUrl('/images/profile-pic.jpg');
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="header">
      {/* Desktop Header */}
      <div className="header__desktop">
        <div className="header__logo">
          <img src="/images/NEWLOGO.svg" alt="GAGAS Logo" className="header__logo-image" />
        </div>

        <nav className="header__nav">
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <Link to="/homepage" className="header__nav-link">HOME</Link>
            </li>
            <li className="header__nav-item">
              <Link to="/shop" className="header__nav-link">SHOP</Link>
            </li>
            <li className="header__nav-item">
              <Link to="/about" className="header__nav-link">ABOUT US</Link>
            </li>
            <li className="header__nav-item">
              <Link to="/contact" className="header__nav-link">CONTACT US</Link>
            </li>
            <li 
              className="header__nav-item header__nav-item--dropdown"
              onMouseEnter={() => setIsSupportOpen(true)}
              onMouseLeave={() => setIsSupportOpen(false)}
            >
              <Link to="/support" className="header__nav-link">
                SUPPORT
                <ChevronDown size={16} className="header__nav-arrow" />
              </Link>
              {isSupportOpen && (
                <ul className="header__dropdown">
                  <li className="header__dropdown-item">
                    <Link to="/orders-payment" className="header__dropdown-link">Orders & Payment</Link>
                  </li>
                  <li className="header__dropdown-item">
                    <Link to="/shipping" className="header__dropdown-link">Shipping</Link>
                  </li>
                  <li className="header__dropdown-item">
                    <Link to="/returns" className="header__dropdown-link">Returns</Link>
                  </li>
                  <li className="header__dropdown-item">
                    <Link to="/terms-services" className="header__dropdown-link">Terms and Services</Link>
                  </li>
                  <li className="header__dropdown-item">
                    <Link to="/faqs" className="header__dropdown-link">FAQs</Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className="header__actions">
          <button className="header__icon-btn">
            <Search size={24} />
          </button>
          <button className="header__icon-btn">
            <Heart size={24} />
          </button>
          <button className="header__icon-btn">
            <Bell size={24} />
            <span className="header__notification-badge">0</span>
          </button>
          <button className="header__icon-btn">
            <ShoppingBag size={24} />
          </button>
          {isLoggedIn ? (
            <div className="header__profile-container" onClick={toggleProfileDropdown}>
              <img
                src={getProfileImageUrl()}
                alt="Profile"
                className="header__profile-pic"
                onError={(e) => {
                  console.log('Image failed to load, using default image');
                  e.target.src = '/images/profile-pic.jpg';
                }}
              />
              <ChevronDown
                size={16}
                className={`header__dropdown-arrow ${isProfileDropdownOpen ? 'open' : ''}`}
              />
              {isProfileDropdownOpen && (
                <div className="header__profile-dropdown">
                  <Link to="/profile" className="header__dropdown-item">
                    <User size={16} className="header__dropdown-icon" />
                    My Profile
                  </Link>
                  <Link to="/settings" className="header__dropdown-item">
                    <Settings size={16} className="header__dropdown-icon" />
                    Settings
                  </Link>
                  <div className="header__dropdown-separator"></div>
                  <button className="header__dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} className="header__dropdown-icon" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="header__login-btn header__login-btn--desktop">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="header__mobile">
        <button className="header__menu-btn" onClick={toggleMenu}>
          <Menu size={24} />
        </button>
        
        <div className="header__logo header__logo--mobile">
          <img src="/images/NEWLOGO.svg" alt="GAGAS Logo" className="header__logo-image" />
        </div>
        
        <div className="header__actions--mobile">
          <button className="header__icon-btn">
            <Search size={20} />
          </button>
          <button className="header__icon-btn">
            <Bell size={20} />
            {parseInt(user?.unread_notifications_count, 10) > 0 && (
              <span className="header__notification-badge">
                {user?.unread_notifications_count}
              </span>
            )}
          </button>
          <button className="header__icon-btn">
            <ShoppingBag size={20} />
            {parseInt(user?.cart_count, 10) > 0 && (
              <span className="header__notification-badge">
                {user?.cart_count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <div className={`header__sidebar ${isMenuOpen ? 'header__sidebar--open' : ''}`}>
        <div className="header__sidebar-header">
          <button className="header__close-btn" onClick={toggleMenu}>
            <X size={24} />
          </button>
        </div>
        
        {isLoggedIn ? (
          <div className="header__sidebar-profile">
            <img
              src={getProfileImageUrl()}
              alt="Profile"
              className="header__sidebar-profile-pic"
              onError={(e) => {
                e.target.src = '/images/profile-pic.jpg';
              }}
            />
            <div className="header__sidebar-profile-info">
  <p className="header__sidebar-profile-name">
    {user?.profile?.first_name && user?.profile?.last_name 
      ? `${user.profile.first_name} ${user.profile.last_name}`
      : user?.name || 'User'}
  </p>
  <p className="header__sidebar-profile-email">{user?.email || ''}</p>
</div>
          </div>
        ) : (
          <div className="header__sidebar-login">
            <Link to="/login" className="header__sidebar-login-btn" onClick={toggleMenu}>
              <User size={20} />
              <span>LOGIN / REGISTER</span>
            </Link>
          </div>
        )}
        
        <nav className="header__sidebar-nav">
          <ul className="header__sidebar-nav-list">
            <li className="header__sidebar-nav-item">
              <Link to="/homepage" className="header__sidebar-nav-link" onClick={toggleMenu}>
                HOME
              </Link>
            </li>
            <li className="header__sidebar-nav-item">
              <Link to="/shop" className="header__sidebar-nav-link" onClick={toggleMenu}>
                SHOP
              </Link>
            </li>
            <li className="header__sidebar-nav-item">
              <Link to="/about" className="header__sidebar-nav-link" onClick={toggleMenu}>
                ABOUT US
              </Link>
            </li>
            <li className="header__sidebar-nav-item">
              <Link to="/contact" className="header__sidebar-nav-link" onClick={toggleMenu}>
                CONTACT US
              </Link>
            </li>
            <li className="header__sidebar-nav-item header__sidebar-nav-item--dropdown">
              <div className="header__sidebar-nav-dropdown-toggle" onClick={toggleSupportDropdown}>
                SUPPORT
                <ChevronDown 
                  size={16} 
                  className={`header__sidebar-nav-arrow ${isSupportOpen ? 'open' : ''}`} 
                />
              </div>
              {isSupportOpen && (
                <ul className="header__sidebar-dropdown">
                  <li className="header__sidebar-dropdown-item">
                    <Link to="/orders-payment" className="header__sidebar-dropdown-link" onClick={toggleMenu}>
                      Orders & Payment
                    </Link>
                  </li>
                  <li className="header__sidebar-dropdown-item">
                    <Link to="/shipping" className="header__sidebar-dropdown-link" onClick={toggleMenu}>
                      Shipping
                    </Link>
                  </li>
                  <li className="header__sidebar-dropdown-item">
                    <Link to="/returns" className="header__sidebar-dropdown-link" onClick={toggleMenu}>
                      Returns
                    </Link>
                  </li>
                  <li className="header__sidebar-dropdown-item">
                    <Link to="/terms-services" className="header__sidebar-dropdown-link" onClick={toggleMenu}>
                      Terms and Services
                    </Link>
                  </li>
                  <li className="header__sidebar-dropdown-item">
                    <Link to="/faqs" className="header__sidebar-dropdown-link" onClick={toggleMenu}>
                      FAQs
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
        
        {isLoggedIn && (
          <div className="header__sidebar-actions">
            <Link to="/profile" className="header__sidebar-action-link" onClick={toggleMenu}>
              <User size={20} />
              <span>My Profile</span>
            </Link>
            <Link to="/wishlist" className="header__sidebar-action-link" onClick={toggleMenu}>
              <Heart size={20} />
              <span>My Wishlist</span>
            </Link>
            <Link to="/settings" className="header__sidebar-action-link" onClick={toggleMenu}>
              <Settings size={20} />
              <span>Settings</span>
            </Link>
            <button className="header__sidebar-action-link header__sidebar-logout" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Overlay for when sidebar is open */}
      {isMenuOpen && (
        <div className="header__sidebar-overlay" onClick={toggleMenu}></div>
      )}
    </header>
  );
};

export default Header;