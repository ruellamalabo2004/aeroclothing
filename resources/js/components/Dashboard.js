import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [],
        borderColor: "#d32f2f",
        backgroundColor: "rgba(211, 47, 47, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Monthly Revenue Statistics" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Revenue ($)" } },
      x: { title: { display: true, text: "Month" } },
    },
  };

  const barData = {
    labels: ["Men", "Women", "Kids"],
    datasets: [
      {
        label: "Sales",
        data: [0, 0, 0],
        backgroundColor: "#757575",
        borderColor: "#757575",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Top Selling Categories" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Sales" } },
      x: { title: { display: true, text: "Category" } },
    },
  };

  useEffect(() => {
    const handleResize = () => {
      if (lineChartRef.current) lineChartRef.current.resize();
      if (barChartRef.current) barChartRef.current.resize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDashboardRoot = location.pathname === "/dashboard";

  return (
    <div className="rounded-dashboard-container">
      <div className={`rounded-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/imgs/AdLogo.svg" alt="Logo" className="dashboard-logo" />
          </div>
          {sidebarOpen && (
            <div className="hamburger hamburger-close" onClick={() => setSidebarOpen(false)}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
        <nav className="rounded-nav-links">
          <NavLink
            to="/dashboard"
            end // Ensure exact match for /dashboard only
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Dashboard.svg" alt="Dashboard" className="nav-icon" />
            Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/products"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Products.svg" alt="Products" className="nav-icon" />
            Products
          </NavLink>
          <NavLink
            to="/dashboard/orders"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Orders.svg" alt="Orders" className="nav-icon" />
            Orders
          </NavLink>
          <NavLink
            to="/dashboard/inventory"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Inventory.svg" alt="Inventory" className="nav-icon" />
            Inventory
          </NavLink>
          <NavLink
            to="/dashboard/customers"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Customers.svg" alt="Customers" className="nav-icon" />
            Customers
          </NavLink>
          <NavLink
            to="/dashboard/users"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Users.svg" alt="Users" className="nav-icon" />
            Users
          </NavLink>
          <NavLink
            to="/dashboard/brand"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Brands.svg" alt="Brand" className="nav-icon" />
            Brand
          </NavLink>
          <NavLink
            to="/dashboard/transactions"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Transactions.svg" alt="Transactions" className="nav-icon" />
            Transactions
          </NavLink>
          <NavLink
            to="/dashboard/coupons"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Coupons.svg" alt="Coupons" className="nav-icon" />
            Coupons
          </NavLink>
          <NavLink
            to="/dashboard/inbox"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Inbox.svg" alt="Inbox" className="nav-icon" />
            Inbox
          </NavLink>
          <NavLink
            to="/dashboard/reviews"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Reviews.svg" alt="Reviews" className="nav-icon" />
            Reviews
          </NavLink>
          <NavLink
            to="/dashboard/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setSidebarOpen(false)}
          >
            <img src="/imgs/Reports.svg" alt="Reports" className="nav-icon" />
            Reports
          </NavLink>
          <hr className="separator" />
          <div className="settings-container">
            <div className="settings-header" onClick={() => setSettingsOpen(!settingsOpen)}>
              <img src="/imgs/Settings.svg" alt="Settings" className="nav-icon" />
              <span>Settings</span>
            </div>
            {settingsOpen && (
              <ul className="settings-list">
                <li><a href="/settings/account">Account</a></li>
                <li><a href="/settings/notifications">Notifications</a></li>
                <li><a href="/settings/payments">Payments</a></li>
                <li><a href="/settings/checkout">Checkout</a></li>
                <li><a href="/settings/shipping">Shipping & Delivery</a></li>
              </ul>
            )}
          </div>
        </nav>
      </div>

      <div className="main-content">
        <div className="header-container">
          {!sidebarOpen && (
            <div className="hamburger hamburger-open" onClick={() => setSidebarOpen(true)}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div className="header-right">
            <div className="profile">
              <img src="/imgs/profile.svg" alt="Profile" className="profile-pic" />
              <div className="profile-info">
                <span className="username">Ruella Malabo Jr.</span>
                <span className="role">Admin</span>
              </div>
            </div>
          </div>
        </div>

        <div className="page-content">
          {isDashboardRoot ? (
            <main>
              <h1>Dashboard</h1>
              <div className="card-container">
                <div className="card-body">
                  <div className="card-content">
                    <img src="/imgs/totalo.svg" alt="Total Orders" className="card-image" />
                    <div className="card-text">
                      <div className="card-number">0</div>
                      <div className="card-title">Total Orders</div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-content">
                    <img src="/imgs/newo.svg" alt="New Orders" className="card-image" />
                    <div className="card-text">
                      <div className="card-number">0</div>
                      <div className="card-title">New Orders</div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-content">
                    <img src="/imgs/totalp.svg" alt="Total Products" className="card-image" />
                    <div className="card-text">
                      <div className="card-number">0</div>
                      <div className="card-title">Total Products</div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-content">
                    <img src="/imgs/totalc.svg" alt="Total Customers" className="card-image" />
                    <div className="card-text">
                      <div className="card-number">0</div>
                      <div className="card-title">Total Customers</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="charts-container">
                <div className="line-chart">
                  <Line ref={lineChartRef} data={lineData} options={lineOptions} />
                </div>
                <div className="bar-chart">
                  <Bar ref={barChartRef} data={barData} options={barOptions} />
                </div>
              </div>
            </main>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}