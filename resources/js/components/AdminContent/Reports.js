import React, { useEffect, useRef, useState } from 'react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/transactions', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          setOrders(data);
        } catch (err) {
          setOrders([]);
        }
      };
      fetchOrders();
    } else if (activeTab === 'product-sales') {
      const fetchProductSales = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/reports/product-sales', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          setProductSales(data);
        } catch (err) {
          setProductSales([]);
        }
      };
      fetchProductSales();
    }
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports">
      <div className="reports__header">
        <h2 className="reports__title">Reports</h2>
        <div className="reports__tabs">
          <button className={`reports__tab${activeTab === 'orders' ? ' active' : ''}`} onClick={() => setActiveTab('orders')}>Orders Report</button>
          <button className={`reports__tab${activeTab === 'product-sales' ? ' active' : ''}`} onClick={() => setActiveTab('product-sales')}>Product Sales Report</button>
        </div>
        <button className="reports__print-save" onClick={handlePrint}>
          Print / Save PDF
        </button>
      </div>
      {activeTab === 'orders' && (
        <div className="reports__table-section" ref={printRef}>
          <div className="reports__table-header">
            <h3>Order Report Table</h3>
            <p>All orders with details</p>
          </div>
          <div className="reports__table-container">
            <table className="reports__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Order Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date}</td>
                      <td>{row.transaction_id}</td>
                      <td>{row.customer_name}</td>
                      <td>${parseFloat(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td>{row.payment_method}</td>
                      <td>{row.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'product-sales' && (
        <div className="reports__table-section" ref={printRef}>
          <div className="reports__table-header">
            <h3>Product Sales Report</h3>
            <p>Aggregated sales by product</p>
          </div>
          <div className="reports__table-container">
            <table className="reports__table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Total Quantity Sold</th>
                  <th>Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {productSales.length > 0 ? (
                  productSales.map((row) => (
                    <tr key={row.id}>
                      <td>{row.product_name}</td>
                      <td>{row.total_quantity}</td>
                      <td>${parseFloat(row.total_sales).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;