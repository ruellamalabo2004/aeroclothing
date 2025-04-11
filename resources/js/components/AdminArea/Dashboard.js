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
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);

  const lineData = {
    labels: monthlySales.length > 0 ? monthlySales.map(item => item.month || "Unknown Month") : ["No Data"],
    datasets: [
      {
        label: "Revenue (₱)",
        data: monthlySales.length > 0 ? monthlySales.map(item => parseFloat(item.total) || 0) : [0],
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
      title: { display: true, text: "Monthly Sales Revenue" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Revenue (₱)" } },
      x: { title: { display: true, text: "Month" } },
    },
  };

  const barData = {
    labels: topProducts.length > 0 ? topProducts.map(item => item.product_name) : ["No Data"],
    datasets: [
      {
        label: "Units Sold",
        data: topProducts.length > 0 ? topProducts.map(item => item.total_quantity || 0) : [0],
        backgroundColor: topProducts.length > 0 
          ? ["#d32f2f", "#757575", "#4caf50"].slice(0, topProducts.length) 
          : ["#757575"],
        borderColor: topProducts.length > 0 
          ? ["#d32f2f", "#757575", "#4caf50"].slice(0, topProducts.length) 
          : ["#757575"],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Top 3 Most Purchased Products" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Units Sold" } },
      x: { title: { display: true, text: "Product" } },
    },
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchTotalProducts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/products/", {
          headers: { Authorization: `Bearer ${token}` }, // Add token if required
        });
        console.log("Products response:", response.data);
        setTotalProducts(response.data.length || 0);
        const map = response.data.reduce((acc, product) => {
          // Try common ID fields: id, product_id
          const productId = product.id || product.product_id;
          if (productId && (product.name || product.product_name)) {
            acc[productId] = product.name || product.product_name;
                    
          } else {
            console.warn("Product missing id or name:", product);
          }
          return acc;
        }, {});
        console.log("Products map:", map);
        setProductsMap(map);
        return map;
      } catch (error) {
        console.error("Error fetching products:", error.response?.data || error.message);
        setTotalProducts(0);
        setProductsMap({});
        return {};
      }
    };

    const fetchTotalUsers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Users response:", response.data);
        setTotalUsers(response.data.length || response.data.count || 0);
      } catch (error) {
        console.error("Error fetching users:", error);
        setTotalUsers(0);
      }
    };

    const fetchOrdersData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Orders response:", response.data);
        const orders = Array.isArray(response.data) ? response.data : [];
        setTotalOrders(orders.length || 0);
        
        const total = orders.reduce((sum, order) => {
          return sum + (parseFloat(order.total_amount) || 0);
        }, 0);
        setTotalSales(total.toFixed(2));

        const monthlyData = {};
        orders.forEach(order => {
          const dateString = order.order_date || (order.created_at ? order.created_at : null);
          if (dateString) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
              console.error("Invalid date found:", dateString);
              return;
            }
            const month = date.toLocaleString('default', { 
              month: 'short', 
              year: 'numeric' 
            });
            monthlyData[month] = (monthlyData[month] || 0) + (parseFloat(order.total_amount) || 0);
          } else {
            console.warn("Skipping order due to missing date:", order);
          }
        });
        
        const monthlyArray = Object.entries(monthlyData)
          .map(([month, total]) => ({
            month,
            total: total.toFixed(2)
          }))
          .sort((a, b) => new Date(a.month) - new Date(b.month));
        
        console.log("Processed monthly sales:", monthlyArray);
        setMonthlySales(monthlyArray);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setTotalOrders(0);
        setTotalSales(0);
        setMonthlySales([]);
      }
    };

    const fetchTopProducts = async (prodMap) => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/order-details/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Order details response:", response.data);
        const orderItems = Array.isArray(response.data) ? response.data : [];
        
        const productData = {};
        orderItems.forEach(item => {
          const productId = item.product_id;
          let productName;
          if (item.product && item.product.name) {
            productName = item.product.name;
          } else if (productId && prodMap[productId]) {
            productName = prodMap[productId];
          } else {
            productName = `Unknown Product (ID: ${productId || 'N/A'})`;
            console.warn(`No name found for product_id ${productId} in productsMap:`, prodMap);
          }
          
          if (item.quantity) {
            productData[productName] = (productData[productName] || 0) + (parseInt(item.quantity, 10) || 0);
          } else {
            console.warn("Skipping item due to missing quantity:", item);
          }
        });
        
        const productsArray = Object.entries(productData)
          .map(([product_name, total_quantity]) => ({ 
            product_name, 
            total_quantity 
          }))
          .sort((a, b) => b.total_quantity - a.total_quantity)
          .slice(0, 3);
        
        console.log("Processed top products:", productsArray);
        setTopProducts(productsArray);
      } catch (error) {
        console.error("Error fetching order items:", error);
        setTopProducts([]);
      }
    };

    const fetchData = async () => {
      const prodMap = await fetchTotalProducts();
      await Promise.all([
        fetchTotalUsers(),
        fetchOrdersData(),
        fetchTopProducts(prodMap),
      ]);
    };
    
    fetchData();

    const handleResize = () => {
      if (lineChartRef.current) lineChartRef.current.resize();
      if (barChartRef.current) barChartRef.current.resize();
      if (window.innerWidth >= 768) setSidebarOpen(false);
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
            <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Dashboard.svg" alt="Dashboard" className="nav-icon" />
              Dashboard
            </NavLink>
            <NavLink to="/dashboard/products" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Products.svg" alt="Products" className="nav-icon" />
              Products
            </NavLink>
            <NavLink to="/dashboard/orders" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Orderings.svg" alt="Orders" className="nav-icon" />
              Orders
            </NavLink>
            <NavLink to="/dashboard/inventory" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Inventory.svg" alt="Inventory" className="nav-icon" />
              Inventory
            </NavLink>
            <NavLink to="/dashboard/customers" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Customers.svg" alt="Customers" className="nav-icon" />
              Customers
            </NavLink>
            <NavLink to="/dashboard/users" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Users.svg" alt="Users" className="nav-icon" />
              Users
            </NavLink>
            <NavLink to="/dashboard/transactions" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Transactions.svg" alt="Transactions" className="nav-icon" />
              Transactions
            </NavLink>
            <NavLink to="/dashboard/reviews" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Reviews.svg" alt="Reviews" className="nav-icon" />
              Reviews
            </NavLink>
            <NavLink to="/dashboard/inbox" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Inbox.svg" alt="Inbox" className="nav-icon" />
              Inbox
            </NavLink>
            <NavLink to="/dashboard/support" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/support.svg" alt="Customer Support" className="nav-icon" />
              Customer Support
            </NavLink>
            <NavLink to="/dashboard/reports" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Reports.svg" alt="Reports" className="nav-icon" />
              Reports
            </NavLink>
            <hr className="separator" />
            <NavLink to="/dashboard/adminsettings" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/Settings.svg" alt="Admin Settings" className="nav-icon" />
              Admin Settings
            </NavLink>
            <NavLink to="/dashboard/accountsettings" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setSidebarOpen(false)}>
              <img src="/imgs/accountSettings.svg" alt="Account Settings" className="nav-icon" />
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
                      <div className="card-number">{totalOrders}</div>
                      <div className="card-title">Total Orders</div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-content">
                    <img src="/imgs/saless.svg" alt="Total Sales" className="card-image" />
                    <div className="card-text">
                      <div className="card-number">₱{totalSales}</div>
                      <div className="card-title">Total Sales</div>
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
                    <img src="/imgs/totalc.svg" alt="Total Users" className="card-image" />
                    <div className="card-text">
                      <div className="card-number">{totalUsers}</div>
                      <div className="card-title">Total Users</div>
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
