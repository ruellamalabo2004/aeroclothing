import React from 'react';

const Dashboard = () => {
  // Static data for demonstration (replace with API data in a real app)
  const stats = {
    totalOrders: { value: 1284, change: 12.5, isPositive: true },
    totalRevenue: { value: 86429, change: 8.2, isPositive: false },
    totalProducts: { value: 384, change: 13.7, isPositive: false },
    totalUsers: { value: 2917, change: 15.3, isPositive: true },
  };

  const topSellingProducts = [
    { name: 'Smartphone Pro', value: 1000 },
    { name: 'Wireless Earbuds', value: 800 },
    { name: 'Smart Watch', value: 600 },
    { name: 'Tablet Air', value: 400 },
    { name: 'Laptop Ultra', value: 300 },
    { name: 'Fitness Tracker', value: 200 },
    { name: 'Bluetooth Speaker', value: 150 },
  ];

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Dashboard Analytics</h2>
      <div className="dashboard__stats">
        <div className="dashboard__stat-card">
          <h3>Total Orders</h3>
          <p className="dashboard__stat-value">{stats.totalOrders.value.toLocaleString()}</p>
          <p className={`dashboard__stat-change ${stats.totalOrders.isPositive ? 'positive' : 'negative'}`}>
            {stats.totalOrders.isPositive ? '+' : '-'}{stats.totalOrders.change}% from last month
          </p>
        </div>
        <div className="dashboard__stat-card">
          <h3>Total Revenue</h3>
          <p className="dashboard__stat-value">${stats.totalRevenue.value.toLocaleString()}</p>
          <p className={`dashboard__stat-change ${stats.totalRevenue.isPositive ? 'positive' : 'negative'}`}>
            {stats.totalRevenue.isPositive ? '+' : '-'}{stats.totalRevenue.change}% from last month
          </p>
        </div>
        <div className="dashboard__stat-card">
          <h3>Total Products</h3>
          <p className="dashboard__stat-value">{stats.totalProducts.value.toLocaleString()}</p>
          <p className={`dashboard__stat-change ${stats.totalProducts.isPositive ? 'positive' : 'negative'}`}>
            {stats.totalProducts.isPositive ? '+' : '-'}{stats.totalProducts.change}% from last month
          </p>
        </div>
        <div className="dashboard__stat-card">
          <h3>Total Users</h3>
          <p className="dashboard__stat-value">{stats.totalUsers.value.toLocaleString()}</p>
          <p className={`dashboard__stat-change ${stats.totalUsers.isPositive ? 'positive' : 'negative'}`}>
            {stats.totalUsers.isPositive ? '+' : '-'}{stats.totalUsers.change}% from last month
          </p>
        </div>
      </div>
      <div className="dashboard__charts">
        <div className="dashboard__chart">
          <h3>Monthly Sales</h3>
          <div className="dashboard__chart-placeholder">
            {/* Placeholder for Monthly Sales bar chart */}
            <p>Monthly Sales Chart (Implement using Chart.js or similar library)</p>
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