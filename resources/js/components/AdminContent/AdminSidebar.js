import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  User, 
  Users, 
  Receipt, 
  Star, 
  Mail, 
  Headphones, 
  BarChart, 
  Settings,
  UserCog,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle settings dropdown
  const toggleSettingsDropdown = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Handle link click for mobile
  const handleLinkClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <div className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="admin-sidebar__nav">
        <div className="admin-sidebar__logo">
          <img src="/images/aero026.svg" alt="Aeros Logo" className="admin-sidebar__logo-image" />
        </div>
        <ul className="admin-sidebar__list">
          <li className="admin-sidebar__item">
            <Link to="dashboard" className="admin-sidebar__link" onClick={handleLinkClick}>
              <LayoutDashboard className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Dashboard</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="products" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Package className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Products</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="orders" className="admin-sidebar__link" onClick={handleLinkClick}>
              <ShoppingCart className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Orders</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="inventory" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Warehouse className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Inventory</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="customer" className="admin-sidebar__link" onClick={handleLinkClick}>
              <User className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Customer</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="users" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Users className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Users</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="transaction" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Receipt className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Transaction</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="reviews" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Star className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Reviews</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="inbox" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Mail className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Inbox</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="customer-support" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Headphones className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Customer Support</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="reports" className="admin-sidebar__link" onClick={handleLinkClick}>
              <BarChart className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Reports</span>
            </Link>
          </li>
          <li className="admin-sidebar__separator"></li>
          <li className="admin-sidebar__item">
            <div className="admin-sidebar__link" onClick={toggleSettingsDropdown}>
              <Settings className="admin-sidebar__icon" size={16} />
              <span className="admin-sidebar__label">Settings</span>
              {isSettingsOpen ? (
                <ChevronDown className="admin-sidebar__dropdown-icon" size={16} />
              ) : (
                <ChevronRight className="admin-sidebar__dropdown-icon" size={16} />
              )}
            </div>
            {isSettingsOpen && (
              <ul className="admin-sidebar__dropdown">
                <li className="admin-sidebar__dropdown-item">
                  <Link
                    to="settings/account"
                    className="admin-sidebar__link admin-sidebar__link--dropdown"
                    onClick={handleLinkClick}
                  >
                    <UserCog className="admin-sidebar__icon" size={14} />
                    <span className="admin-sidebar__label">Account Settings</span>
                  </Link>
                </li>
                <li className="admin-sidebar__dropdown-item">
                  <Link
                    to="settings/admin"
                    className="admin-sidebar__link admin-sidebar__link--dropdown"
                    onClick={handleLinkClick}
                  >
                    <SlidersHorizontal className="admin-sidebar__icon" size={14} />
                    <span className="admin-sidebar__label">Admin Settings</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;