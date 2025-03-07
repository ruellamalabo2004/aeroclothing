import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Orders() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [isArchiving, setIsArchiving] = useState(null);
  const [orders, setOrders] = useState([]);

  // Fetch orders from API
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/orders")
      .then((response) => setOrders(response.data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  // Filtered orders based on search & tab
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "All" || order.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = order.id.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  // Order status counts for cards
  const orderCards = ["Pending", "Processing", "Shipped", "Delivered", "Canceled", "Returned"].map(
    (status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    })
  );

  // Handle edit form input change
  const handleFormChange = (e) => {
    setSelectedOrder({ ...selectedOrder, [e.target.name]: e.target.value });
  };

  // Handle order update request
  const handleSave = () => {
    axios
      .put(`http://localhost:8000/api/orders/${selectedOrder.id}`, selectedOrder)
      .then(() => {
        setOrders(orders.map((order) => (order.id === selectedOrder.id ? selectedOrder : order)));
        setSelectedOrder(null);
      })
      .catch((error) => console.error("Error updating order:", error));
  };

  // Archive Order with Confirmation
  const handleArchiveClick = (order) => {
    setIsArchiving(order); // Show confirmation popup
  };

  const confirmArchive = () => {
    axios
      .post(`http://localhost:8000/api/orders/${isArchiving.id}/archive`)
      .then(() => {
        setOrders(orders.filter((order) => order.id !== isArchiving.id));
        setIsArchiving(null);
      })
      .catch((error) => {
        console.error("Error archiving order:", error.response ? error.response.data : error.message);
        setIsArchiving(null);
      });
  };

  return (
    <main>
      <h1>Orders</h1>

      <div className="orders-cards-container">
        {orderCards.map((order) => (
          <div className="orders-card" key={order.status}>
            <img src={`/imgs/${order.status}.svg`} alt={order.status} className="orders-card-image" />
            <div className="orders-card-text">{order.status}</div>
            <div className="orders-card-number">{order.count}</div>
          </div>
        ))}
      </div>

      {/* Order Filters & Search */}
      <div className="orders-links">
        <span className="orders-label">Orders:</span>
        <div className="links-container">
          {["All", "Pending", "Processing", "Shipped", "Delivered", "Canceled", "Returned"].map(
            (status) => (
              <a
                href="#"
                key={status}
                className={activeTab === status ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(status);
                }}
              >
                {status}
              </a>
            )
          )}
        </div>
        <input
          type="text"
          className="orders-search"
          placeholder="Search by Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="view-order">
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> {viewOrder.id}</p>
          <p><strong>Customer Name:</strong> {viewOrder.customer.trim()}</p>
          <p><strong>Payment Method:</strong> {viewOrder.payment_method.trim()}</p>
          <p><strong>Total Amount:</strong> {viewOrder.total_amount}</p>
          <p><strong>Date:</strong> {viewOrder.date}</p>
          <p><strong>Status:</strong> {viewOrder.status}</p>
          <button onClick={() => setViewOrder(null)}>Close</button>
        </div>
      )}

      {/* Edit Order Form */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="edit-order-container" onClick={(e) => e.stopPropagation()}>
            <div className="edit-order-content">
              <h2>Edit Order #{selectedOrder.id}</h2>
              <div className="edit-form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  name="customer"
                  value={selectedOrder.customer}
                  onChange={handleFormChange}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="edit-form-group">
                <label>Payment Method</label>
                <input
                  type="text"
                  name="payment_method"
                  value={selectedOrder.payment_method}
                  onChange={handleFormChange}
                  placeholder="Enter payment method"
                />
              </div>
              <div className="edit-form-group">
                <label>Total Amount</label>
                <input
                  type="text"
                  name="total_amount"
                  value={selectedOrder.total_amount}
                  onChange={handleFormChange}
                  placeholder="Enter total amount"
                />
              </div>
              <div className="edit-form-group">
                <label>Status</label>
                <select name="status" value={selectedOrder.status} onChange={handleFormChange}>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Canceled">Canceled</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
              <div className="edit-form-actions">
                <button className="save-btn" onClick={handleSave}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={() => setSelectedOrder(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Popup */}
      {isArchiving && (
        <div className="modal-overlay" onClick={() => setIsArchiving(null)}>
          <div className="archive-confirmation-container" onClick={(e) => e.stopPropagation()}>
            <div className="archive-confirmation-content">
              <h2>Archive this order?</h2>
              <p>Are you sure you want to archive Order ID "{isArchiving.id}"?</p>
              <div className="modal-actions">
                <button type="button" className="save-btn" onClick={confirmArchive}>
                  Yes
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsArchiving(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {!selectedOrder && !viewOrder && !isArchiving && (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Payment Method</th>
                <th>Total Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <img
                      src="/imgs/view.svg"
                      alt="View"
                      className="action-img"
                      onClick={() => setViewOrder(order)}
                      style={{ cursor: "pointer" }}
                    />
                    <img
                      src="/imgs/edit.svg"
                      alt="Edit"
                      className="action-img"
                      onClick={() => setSelectedOrder(order)}
                      style={{ cursor: "pointer" }}
                    />
                    <img
                      src="/imgs/archive.svg"
                      alt="Archive"
                      className="action-img"
                      onClick={() => handleArchiveClick(order)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td>{order.id}</td>
                  <td>{order.customer.trim()}</td>
                  <td>{order.payment_method.trim()}</td>
                  <td>{order.total_amount}</td>
                  <td>{order.date}</td>
                  <td>
                    <span className={`status-frame status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}