import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Package, UsersRound } from 'lucide-react';
import { Bar } from "react-chartjs-2";
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
import axios from "axios";

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

const Dashboard = () => {
  // State for dynamic data (only for products and users)
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // Hardcoded data for orders and revenue (since no backend endpoint)
  const totalOrders = 1284;
  const totalRevenue = 86429;

  // Hardcoded data for charts (since no backend endpoint)
  const topSellingProducts = [
    { name: 'Smartphone Pro', value: 1000 },
    { name: 'Wireless Earbuds', value: 800 },
    { name: 'Smart Watch', value: 600 },
    { name: 'Tablet Air', value: 400 },
    { name: 'Laptop Ultra', value: 300 },
    { name: 'Fitness Tracker', value: 200 },
    { name: 'Bluetooth Speaker', value: 150 },
  ];

  const monthlySalesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [5000, 7000, 6000, 8000, 9000, 7500, 8500, 9500, 7000, 8000, 10000, 11000],
        backgroundColor: '#3AA6B9',
        borderColor: '#2A8291',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Arial', sans-serif",
          },
          color: '#333',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#2A8291',
        titleFont: {
          family: "'Arial', sans-serif",
        },
        bodyFont: {
          family: "'Arial', sans-serif",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#333',
          font: {
            family: "'Arial', sans-serif",
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: '#333',
          font: {
            family: "'Arial', sans-serif",
          },
          callback: (value) => `$${value.toLocaleString()}`,
        },
        grid: {
          color: '#E5E7EB',
        },
        beginAtZero: true,
      },
    },
  };

  // Backend API calls for products and users
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchTotalProducts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/products/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Products response:", response.data);
        setTotalProducts(response.data.length || 0);
      } catch (error) {
        console.error("Error fetching products:", error.response?.data || error.message);
        setTotalProducts(0);
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

    const fetchData = async () => {
      await Promise.all([
        fetchTotalProducts(),
        fetchTotalUsers(),
      ]);
    };
    
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Dashboard Analytics</h2>
      <div className="dashboard__stats">
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-content">
            <div className="dashboard__stat-header">
              <h3>Total Orders</h3>
            </div>
            <p className="dashboard__stat-value">{totalOrders.toLocaleString()}</p>
          </div>
          <div className="dashboard__stat-icon-wrapper">
            <ShoppingBag className="dashboard__stat-icon" size={48} />
          </div>
        </div>
        
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-content">
            <div className="dashboard__stat-header">
              <h3>Total Revenue</h3>
            </div>
            <p className="dashboard__stat-value">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="dashboard__stat-icon-wrapper">
            <DollarSign className="dashboard__stat-icon" size={48} />
          </div>
        </div>
        
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-content">
            <div className="dashboard__stat-header">
              <h3>Total Products</h3>
            </div>
            <p className="dashboard__stat-value">{totalProducts.toLocaleString()}</p>
          </div>
          <div className="dashboard__stat-icon-wrapper">
            <Package className="dashboard__stat-icon" size={48} />
          </div>
        </div>
        
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-content">
            <div className="dashboard__stat-header">
              <h3>Total Users</h3>
            </div>
            <p className="dashboard__stat-value">{totalUsers.toLocaleString()}</p>
          </div>
          <div className="dashboard__stat-icon-wrapper">
            <UsersRound className="dashboard__stat-icon" size={48} />
          </div>
        </div>
      </div>
      
      <div className="dashboard__charts">
        <div className="dashboard__chart">
          <h3>Monthly Sales</h3>
          <div className="dashboard__chart-container">
            <Bar data={monthlySalesData} options={chartOptions} />
          </div>
        </div>
        <div className="dashboard__chart">
          <h3>Top Selling Products</h3>
          <div className="dashboard__top-products">
            {topSellingProducts.map((product, index) => (
              <div key={index} className="dashboard__product-item">
                <span className="dashboard__product-name">{product.name}</span>
                <div className="dashboard__product-bar">
                  <div
                    className="dashboard__product-fill"
                    style={{ width: `${(product.value / 1000) * 100}%` }}
                  ></div>
                </div>
                <span className="dashboard__product-value">{product.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;