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
  // State for all dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    monthlySales: [],
    topSellingProducts: [],
    recentPurchases: []
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/api/dashboard/statistics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare monthly sales data for chart
  const monthlySalesData = {
    labels: dashboardData.monthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Sales ($)',
        data: dashboardData.monthlySales.map(item => item.total),
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
        callbacks: {
          label: function(context) {
            return `$${context.raw.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#333',
          font: {
            family: "'Arial', sans-serif",
          },
          maxRotation: 45,
          minRotation: 45
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

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Dashboard Analytics</h2>
      <div className="dashboard__stats">
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-content">
            <div className="dashboard__stat-header">
              <h3>Total Orders</h3>
            </div>
            <p className="dashboard__stat-value">{dashboardData.totalOrders.toLocaleString()}</p>
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
            <p className="dashboard__stat-value">${dashboardData.totalRevenue.toLocaleString()}</p>
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
            <p className="dashboard__stat-value">{dashboardData.totalProducts.toLocaleString()}</p>
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
            <p className="dashboard__stat-value">{dashboardData.totalUsers.toLocaleString()}</p>
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
            {dashboardData.topSellingProducts.map((product, index) => (
              <div key={index} className="dashboard__product-item">
                <div className="dashboard__product-info">
                  <img 
                    src={`http://127.0.0.1:8000/storage/${product.image}`}
                    alt={product.name}
                    className="dashboard__product-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'http://127.0.0.1:8000/storage/products/default.jpg';
                    }}
                  />
                  <span className="dashboard__product-name">{product.name}</span>
                </div>
                <div className="dashboard__product-bar">
                  <div
                    className="dashboard__product-fill"
                    style={{ width: `${(product.value / Math.max(...dashboardData.topSellingProducts.map(p => p.value))) * 100}%` }}
                  ></div>
                </div>
                <span className="dashboard__product-value">{product.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard__recent-purchases">
        <h3>Recently Purchased Products</h3>
        <div className="dashboard__table-container">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentPurchases.map((purchase, index) => (
                <tr key={index}>
                  <td>
                    <div className="dashboard__product-info">
                      <img 
                        src={`http://127.0.0.1:8000/storage/${purchase.image}`}
                        alt={purchase.product_name} 
                        className="dashboard__product-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'http://127.0.0.1:8000/storage/products/default.jpg';
                        }}
                      />
                      <span>{purchase.product_name}</span>
                    </div>
                  </td>
                  <td>{purchase.customer_name}</td>
                  <td>{purchase.quantity}</td>
                  <td>${purchase.price.toLocaleString()}</td>
                  <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;