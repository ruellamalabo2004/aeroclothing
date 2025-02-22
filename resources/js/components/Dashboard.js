import React, { useState } from "react";

export default function Dashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="rounded-dashboard-container">
      <div className="rounded-sidebar">
        <div className="logo-container">
          <img
            src={`${process.env.PUBLIC_URL}/imgs/logo.png`}
            alt="Logo"
            className="dashboard-logo"
            style={{ width: "214px", height: "58px", marginBottom: "20px" }}
          />
        </div>
        <nav className="rounded-nav-links">
          <a href="/dashboard">
            <img src={`${process.env.PUBLIC_URL}/imgs/dashboard.svg`} alt="Dashboard" className="nav-icon" /> 
            Dashboard
          </a>
          <a href="/products">
            <img src={`${process.env.PUBLIC_URL}/icons/products.png`} alt="Products" className="nav-icon" /> 
            Products
          </a>
          <a href="/orders">
            <img src={`${process.env.PUBLIC_URL}/icons/orders.png`} alt="Orders" className="nav-icon" /> 
            Orders
          </a>
          <a href="/inventory">
            <img src={`${process.env.PUBLIC_URL}/icons/inventory.png`} alt="Inventory" className="nav-icon" /> 
            Inventory
          </a>
          <a href="/customers">
            <img src={`${process.env.PUBLIC_URL}/icons/customers.png`} alt="Customers" className="nav-icon" /> 
            Customers
          </a>
          <a href="/users">
            <img src={`${process.env.PUBLIC_URL}/icons/users.png`} alt="Users" className="nav-icon" /> 
            Users
          </a>
          <a href="/brand">
            <img src={`${process.env.PUBLIC_URL}/icons/brand.png`} alt="Brand" className="nav-icon" /> 
            Brand
          </a>
          <a href="/transactions">
            <img src={`${process.env.PUBLIC_URL}/icons/transactions.png`} alt="Transactions" className="nav-icon" /> 
            Transactions
          </a>
          <a href="/coupons">
            <img src={`${process.env.PUBLIC_URL}/icons/coupons.png`} alt="Coupons" className="nav-icon" /> 
            Coupons
          </a>
          <a href="/inbox">
            <img src={`${process.env.PUBLIC_URL}/icons/inbox.png`} alt="Inbox" className="nav-icon" /> 
            Inbox
          </a>
          <a href="/reviews">
            <img src={`${process.env.PUBLIC_URL}/icons/reviews.png`} alt="Reviews" className="nav-icon" /> 
            Reviews
          </a>
          <a href="/reports">
            <img src="/icons/reports.png" alt="Reports" className="nav-icon" /> 
            Reports
          </a>
          <a href="/settings">
            <img src="/imgs/settings.svg" alt="Settings" className="nav-icon" /> 
            Settings
          </a>
        </nav>
      </div>

      {/* HEADER */}
      <div className="header-container">
        <div className="search-container">
          <input type="text" placeholder="Search..." className="search-bar" />
          <img src={`${process.env.PUBLIC_URL}/icons/search.png`} alt="Search" className="search-icon" />
        </div>

        <div className="header-right">
          <div className="profile">
            <img src={`${process.env.PUBLIC_URL}/imgs/profile.jpg`} alt="Profile" className="profile-pic" />
            <div className="profile-info">
              <span className="username">Ruella Malabo Jr.</span>
              <span className="role">Admin</span>
            </div>
            <div className="dropdown-arrow" onClick={() => setDropdownOpen(!dropdownOpen)}>
              ▼
            </div>
            {dropdownOpen && (
              <div className="dropdown-content">
                <p>Profile</p>
                <p>Settings</p>
                <p>Logout</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

