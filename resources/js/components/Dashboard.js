import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: "#d32f2f",
        backgroundColor: "rgba(211, 47, 47, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
    maintainAspectRatio: false,
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
    const fetchTotalProducts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/products/");
        setTotalProducts(response.data.length);
      } catch (error) {
        console.error("Error fetching products:", error);
        setTotalProducts(0);
      }
    };

    const fetchTotalCustomers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/customers");
        // Assuming the API returns an array of customers or a count object
        const count = Array.isArray(response.data) ? response.data.length : response.data.count || 0;
        setTotalCustomers(count);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setTotalCustomers(0);
      }
    };

    // Execute both fetch calls
    fetchTotalProducts();
    fetchTotalCustomers();  
    const handleResize = () => {
      if (lineChartRef.current) lineChartRef.current.resize();
      if (barChartRef.current) barChartRef.current.resize();
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      navigate("/login");
      setSidebarOpen(false);
    }
  };

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
        <div className="sidebar-content">
          <nav className="rounded-nav-links">
            <NavLink
              to="/dashboard"
              end
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
              <img src="/imgs/Orderings.svg" alt="Orders" className="nav-icon" />
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
              to="/dashboard/transactions"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setSidebarOpen(false)}
            >
              <img src="/imgs/Transactions.svg" alt="Transactions" className="nav-icon" />
              Transactions
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
            <NavLink
              to="/dashboard/adminsettings"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setSidebarOpen(false)}
            >
              <img src="/imgs/Settings.svg" alt="Admin Settings" className="nav-icon" />
              Admin Settings
            </NavLink>
            <NavLink
              to="/dashboard/accountsettings"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setSidebarOpen(false)}
            >
              <img src="/imgs/Settings.svg" alt="Account Settings" className="nav-icon" />
              Account Settings
            </NavLink>
            <div className="nav-link logout" onClick={handleLogout}>
              <img src="/imgs/Logout.svg" alt="Log Out" className="nav-icon" />
              Log Out
            </div>
          </nav>
        </div>
      </div>

      <div className="main-content">
        {!sidebarOpen && (
          <div className="hamburger hamburger-open" onClick={() => setSidebarOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div className="page-content">
          {isDashboardRoot ? (
            <main>
              <h1 className="dashboard-header">Dashboard</h1>
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
                      <div className="card-number">{totalProducts}</div>
                      <div className="card-title">Total Products</div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-content">
                    <img src="/imgs/totalc.svg" alt="Total Customers" className="card-image" />
                    <div className="card-text">
                      <div className="card-number">{totalCustomers}</div>
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