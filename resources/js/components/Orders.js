import React, { useState, useEffect } from "react";
import axios from "axios";


export default function Orders() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [isArchiving, setIsArchiving] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const API_URL = "http://localhost:8000/api";

  // Fetch orders from API
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`${API_URL}/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((response) => {
        setOrders(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error.response?.data || error.message);
        setError("Failed to fetch orders. Please try again.");
      });
  }, []);

  // Filtered orders based on search & tab
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "All" || order.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = order.id.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Handle page navigation
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Order status counts for cards
  const orderCards = ["PENDING", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELED", "RETURNED"].map(
    (status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
      image: status === "SHIPPING" ? "/imgs/shipped.svg" : `/imgs/${status.toLowerCase()}.svg`,
    })
  );

  // Handle edit form input change
  const handleFormChange = (e) => {
    setSelectedOrder({ ...selectedOrder, [e.target.name]: e.target.value });
  };

  // Handle order update request
  const handleSave = () => {
    const updateData = {
      status: selectedOrder.status,
      payment_method: selectedOrder.payment_method,
      total_amount: selectedOrder.total_amount,
    };
    const token = localStorage.getItem('token');
    axios
      .put(`${API_URL}/orders/${selectedOrder.id}`, updateData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((response) => {
        axios
          .get(`${API_URL}/orders`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          .then((res) => {
            setOrders(res.data);
            setSelectedOrder(null);
            setError(null);
          })
          .catch((err) => {
            console.error("Error refreshing orders:", err.response?.data || err.message);
            setError("Failed to refresh orders after update.");
          });
      })
      .catch((error) => {
        console.error("Error updating order:", error.response?.data || error.message);
        setError("Failed to update order. Please try again.");
      });
  };

  // Fetch order details for viewing
  const handleViewOrder = (order) => {
    const token = localStorage.getItem('token');
    axios
      .get(`${API_URL}/orders/${order.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((response) => {
        setViewOrder(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error("Error fetching order details:", error.response?.data || error.message);
        setError("Failed to fetch order details. Please try again.");
      });
  };

  // Archive Order with Confirmation
  const handleArchiveClick = (order) => {
    setIsArchiving(order);
  };

  const confirmArchive = () => {
    const token = localStorage.getItem('token');
    axios
      .put(`${API_URL}/orders/${isArchiving.id}/archive`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(() => {
        setOrders(orders.filter((order) => order.id !== isArchiving.id));
        setIsArchiving(null);
        setError(null);
      })
      .catch((error) => {
        console.error("Error archiving order:", error.response?.data || error.message);
        setError("Failed to archive order. Please try again.");
        setIsArchiving(null);
      });
  };

  return (
    <main>
      <h1>Orders</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-cards-container">
        {orderCards.map((order) => (
          <div className="orders-card" key={order.status}>
            <img src={order.image} alt={order.status} className="orders-card-image" />
            <div className="orders-card-text">{order.status}</div>
            <div className="orders-card-number">{order.count}</div>
          </div>
        ))}
      </div>

      {/* Order Filters & Search */}
      <div className="orders-links">
        <span className="orders-label">Orders:</span>
        <div className="links-container">
          {["All", "PENDING", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELED", "RETURNED"].map(
            (status) => (
              <a
                href="#"
                key={status}
                className={activeTab === status ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(status);
                  setCurrentPage(1);
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
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="view-order">
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> {viewOrder.id}</p>
          <p><strong>Customer Name:</strong> {viewOrder.customer}</p>
          <p><strong>Payment Method:</strong> {viewOrder.payment_method}</p>
          <p><strong>Total Amount:</strong> ₱{viewOrder.total_amount}</p>
          <p><strong>Date:</strong> {new Date(viewOrder.created_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {viewOrder.status}</p>
          <h3>Products:</h3>
          <ul>
            {viewOrder.products && viewOrder.products.length > 0 ? (
              viewOrder.products.map((product) => (
                <li key={product.id}>
                  {product.product_name} - Quantity: {product.quantity} - ₱{product.price}
                </li>
              ))
            ) : (
              <li>No products found.</li>
            )}
          </ul>
          <button onClick={() => setViewOrder(null)}>Close</button>
        </div>
      )}

      {/* Edit Order Modal */}
      {selectedOrder && (
        <div className="edit-modal" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Order #{selectedOrder.id}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Payment Method</label>
                  <input
                    type="text"
                    name="payment_method"
                    value={selectedOrder.payment_method || ""}
                    onChange={handleFormChange}
                    placeholder="Enter payment method"
                  />
                </div>
                <div className="form-group">
                  <label>Total Amount</label>
                  <input
                    type="number"
                    name="total_amount"
                    value={selectedOrder.total_amount || ""}
                    onChange={handleFormChange}
                    placeholder="Enter total amount"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={selectedOrder.status || ""} onChange={handleFormChange}>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPING">Shipping</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELED">Canceled</option>
                    <option value="RETURNED">Returned</option>
                  </select>
                </div>
                {/* Add an empty div to maintain two-column layout if needed */}
                <div className="form-group"></div>
              </div>
              <div className="form-buttons">
                <button type="submit" className="modal-save-btn">
                  Save Changes
                </button>
                <button type="button" className="modal-cancel-btn" onClick={() => setSelectedOrder(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {isArchiving && (
        <div className="edit-modal" onClick={() => setIsArchiving(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Archive this order?</h2>
            <form onSubmit={(e) => { e.preventDefault(); confirmArchive(); }}>
              <p>Are you sure you want to archive Order ID "{isArchiving.id}"?</p>
              <div className="form-buttons">
                <button type="submit" className="modal-save-btn">
                  Yes
                </button>
                <button type="button" className="modal-cancel-btn" onClick={() => setIsArchiving(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Orders Table and Pagination */}
      {!selectedOrder && !viewOrder && !isArchiving && (
        <>
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
                {currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <img
                        src="/imgs/viewing.svg"
                        alt="View"
                        className="action-img"
                        onClick={() => handleViewOrder(order)}
                        style={{ cursor: "pointer" }}
                      />
                      <img
                        src="/imgs/editing.svg"
                        alt="Edit"
                        className="action-img"
                        onClick={() => setSelectedOrder(order)}
                        style={{ cursor: "pointer" }}
                      />
                      <img
                        src="/imgs/archiving.svg"
                        alt="Archive"
                        className="action-img"
                        onClick={() => handleArchiveClick(order)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td>{order.id}</td>
                    <td>
                      {order.profile && order.profile.first_name && order.profile.last_name
                        ? `${order.profile.first_name} ${order.profile.last_name}`
                        : "Unknown Customer"}
                    </td>
                    <td>{order.payment_method || "N/A"}</td>
                    <td>₱{order.total_amount || 0}</td>
                    <td>{order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <span className={`status-frame status-${order.status?.toLowerCase() || "unknown"}`}>
                        {order.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}