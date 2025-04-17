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
  Settings 
} from 'lucide-react';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only toggle sidebar on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <div className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="admin-sidebar__nav">
        <div className="admin-sidebar__logo">
          <img src="/images/AEROS.svg" alt="Aeros Logo" className="admin-sidebar__logo-image" />
        </div>
        <ul className="admin-sidebar__list">
          <li className="admin-sidebar__item">
            <Link to="dashboard" className="admin-sidebar__link" onClick={handleLinkClick}>
              <LayoutDashboard className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Dashboard</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="products" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Package className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Products</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="orders" className="admin-sidebar__link" onClick={handleLinkClick}>
              <ShoppingCart className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Orders</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="inventory" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Warehouse className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Inventory</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="customer" className="admin-sidebar__link" onClick={handleLinkClick}>
              <User className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Customer</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="users" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Users className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Users</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="transaction" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Receipt className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Transaction</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="reviews" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Star className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Reviews</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="inbox" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Mail className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Inbox</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="customer-support" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Headphones className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Customer Support</span>
            </Link>
          </li>
          <li className="admin-sidebar__item">
            <Link to="reports" className="admin-sidebar__link" onClick={handleLinkClick}>
              <BarChart className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Reports</span>
            </Link>
          </li>
          <li className="admin-sidebar__separator"></li>
          <li className="admin-sidebar__item">
            <Link to="settings" className="admin-sidebar__link" onClick={handleLinkClick}>
              <Settings className="admin-sidebar__icon" size={20} />
              <span className="admin-sidebar__label">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;