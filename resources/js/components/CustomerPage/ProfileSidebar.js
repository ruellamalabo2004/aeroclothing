import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, MapPin, ShoppingCart, Package, Heart, ShoppingBag } from 'lucide-react';

const ProfileSidebar = () => {
  const navLinks = [
    { path: '/profile', icon: <User size={18} />, label: 'My Profile' },
    { path: '/profile/address', icon: <MapPin size={18} />, label: 'My Address' },
    { path: '/profile/cart', icon: <ShoppingCart size={18} />, label: 'My Cart' },
    { path: '/profile/orders', icon: <Package size={18} />, label: 'My Orders' },
    { path: '/profile/wishlist', icon: <Heart size={18} />, label: 'My Wishlist' },
  ];

  return (
    <div className="profile-sidebar">
      <nav className="profile-sidebar-nav">
        <ul className="profile-sidebar-nav-list">
          {navLinks.map((link, index) => (
            <li key={index} className="profile-sidebar-nav-item">
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `profile-sidebar-nav-link ${isActive ? 'active' : ''}`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ProfileSidebar;