import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Menu } from 'lucide-react'; // Import the hamburger menu icon
import { Link, useNavigate } from 'react-router-dom';

const AdminHeader = ({ toggleSidebar, isOpen }) => { // Add the toggleSidebar and isOpen props
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from localStorage (set during login)
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Profile pic or initials
  const profilePicture = user?.profile?.profile_pic
    ? `${import.meta.env.VITE_APP_BACKEND_URL}/storage/${user.profile.profile_pic}`
    : null;

  const userName = user?.profile
    ? `${user.profile.first_name} ${user.profile.last_name}`
    : 'Admin User';

  return (
    <header className="admin-header">
      {/* Hamburger button */}
      <div className="admin-header__hamburger" onClick={toggleSidebar}>
        <Menu size={24} />
      </div>
      <div className="admin-header__actions">
        <div className="admin-header__notification">
          <Bell className="admin-header__icon" size={20} />
          <span className="admin-header__notification-dot"></span>
        </div>
        <div className="admin-header__profile">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="admin-header__profile-picture"
            />
          ) : (
            <div className="admin-header__profile-placeholder">
              {userName ? `${userName.split(' ')[0][0]}${userName.split(' ')[1]?.[0] || ''}` : 'AU'}
            </div>
          )}
          <span className="admin-header__user-name">{userName}</span>
          <ChevronDown
            className={`admin-header__dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
            size={16}
            onClick={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className="admin-header__dropdown-menu">
              <Link to="/profile" className="admin-header__dropdown-item">Profile</Link>
              <Link to="/settings" className="admin-header__dropdown-item">Settings</Link>
              <div className="admin-header__dropdown-separator"></div>
              <button
                className="admin-header__dropdown-item"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
