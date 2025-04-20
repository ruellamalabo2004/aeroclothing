import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Menu, User, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminHeader = ({ toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found.');
          return;
        }

        const response = await axios.get('http://127.0.0.1:8000/api/profile', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Profile fetched:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Get user name from the data
  const userName =
    user?.profile?.first_name || user?.profile?.last_name
      ? `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim()
      : user?.name || 'Admin User';
  
  // Get profile picture URL using the profile_pic field from the profiles table
  const getProfileImageUrl = () => {
    console.log('Profile structure:', user?.profile);
    
    if (!user || !user.profile || !user.profile.profile_pic) {
      return '/path/to/default-avatar.jpg'; // Default fallback image
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

  return (
    <header className="admin-header">
      {/* Hamburger button */}
      <div className="admin-header__hamburger" onClick={toggleSidebar}>
        <Menu size={24} />
      </div>

      <div className="admin-header__actions">
        {/* Bell notification */}
        <div className="admin-header__notification">
          <Bell className="admin-header__icon" size={20} />
          <span className="admin-header__notification-dot"></span>
        </div>

        {/* Profile section */}
        <div className="admin-header__profile" onClick={toggleDropdown}>
          {/* Always show profile picture */}
          <img
            src={getProfileImageUrl()}
            alt="Profile"
            className="admin-header__profile-picture"
            onError={(e) => {
              console.log('Image failed to load, trying default image');
              e.target.src = 'http://127.0.0.1:8000/images/default-avatar.jpg';
            }}
          />

          <span className="admin-header__user-name">{userName}</span>

          <ChevronDown
            className={`admin-header__dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
            size={16}
          />

          {isDropdownOpen && (
            <div className="admin-header__dropdown-menu">
              <Link to="/admin-dashboard/settings" className="admin-header__dropdown-item">
                <User className="admin-header__dropdown-icon" size={16} />
                Profile
              </Link>
              <Link to="/admin-dashboard/settings" className="admin-header__dropdown-item">
                <Settings className="admin-header__dropdown-icon" size={16} />
                Settings
              </Link>
              <div className="admin-header__dropdown-separator"></div>
              <button
                className="admin-header__dropdown-item"
                onClick={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                  navigate('/login');
                }}
              >
                <LogOut className="admin-header__dropdown-icon" size={16} />
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