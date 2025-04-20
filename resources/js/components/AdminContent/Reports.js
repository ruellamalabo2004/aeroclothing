import React from 'react';
import { Download } from 'lucide-react';

const Reports = () => {
  // Hardcoded data for stat cards (matching the screenshot)
  const stats = {
    totalSales: { value: 45231.89, change: 20.1, isPositive: true },
    profitMargin: { value: 32.5, change: 2.4, isPositive: false },
    totalOrders: { value: 1245, change: 12.5, isPositive: false },
  };

  // Hardcoded data for the monthly performance table (matching the screenshot)
  const monthlyPerformance = [
    { month: 'Jan', sales: 4000, profit: 2400, profitMargin: 60.0 },
    { month: 'Feb', sales: 3000, profit: 1398, profitMargin: 46.6 },
    { month: 'Mar', sales: 2000, profit: 980, profitMargin: 49.0 },
    { month: 'Apr', sales: 2780, profit: 3908, profitMargin: 140.6 },
    { month: 'May', sales: 1890, profit: 4800, profitMargin: 254.0 },
    { month: 'Jun', sales: 2390, profit: 3800, profitMargin: 159.0 },
  ];

  const handlePrintSavePDF = () => {
    console.log('Print / Save PDF action not implemented yet');
  };

  return (
    <div className="reports">
      <div className="reports__header">
        <h2 className="reports__title">Reports & Analytics</h2>
        <button className="reports__print-save" onClick={handlePrintSavePDF}>
          <Download className="reports__print-save-icon" size={16} />
          Print / Save PDF
        </button>
      </div>
      <div className="reports__stats">
        <div className="reports__stat-card">
          <div className="reports__stat-content">
            <div className="reports__stat-header">
              <h3>Total Sales</h3>
              <p>Monthly overview</p>
            </div>
            <p className="reports__stat-value">${stats.totalSales.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className={`reports__stat-change ${stats.totalSales.isPositive ? 'positive' : 'negative'}`}>
              {stats.totalSales.isPositive ? '+' : '-'}{stats.totalSales.change}% from last month
            </p>
          </div>
        </div>
        
        <div className="reports__stat-card">
          <div className="reports__stat-content">
            <div className="reports__stat-header">
              <h3>Profit Margin</h3>
              <p>Monthly calculation</p>
            </div>
            <p className="reports__stat-value">{stats.profitMargin.value}%</p>
            <p className={`reports__stat-change ${stats.profitMargin.isPositive ? 'positive' : 'negative'}`}>
              {stats.profitMargin.isPositive ? '+' : '-'}{stats.profitMargin.change}% from last month
            </p>
          </div>
        </div>
        
        <div className="reports__stat-card">
          <div className="reports__stat-content">
            <div className="reports__stat-header">
              <h3>Total Orders</h3>
              <p>Monthly summary</p>
            </div>
            <p className="reports__stat-value">{stats.totalOrders.value.toLocaleString()}</p>
            <p className={`reports__stat-change ${stats.totalOrders.isPositive ? 'positive' : 'negative'}`}>
              {stats.totalOrders.isPositive ? '+' : '-'}{stats.totalOrders.change}% from last month
            </p>
          </div>
        </div>
      </div>
      
      <div className="reports__table-section">
        <div className="reports__table-header">
          <h3>Monthly Performance Table</h3>
          <p>Detailed view of monthly sales and profit data</p>
        </div>
        <div className="reports__table-container">
          <table className="reports__table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Sales ($)</th>
                <th>Profit ($)</th>
                <th>Profit Margin (%)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyPerformance.map((row, index) => (
                <tr key={index}>
                  <td>{row.month}</td>
                  <td>{row.sales.toLocaleString()}</td>
                  <td>{row.profit.toLocaleString()}</td>
                  <td>{row.profitMargin.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;