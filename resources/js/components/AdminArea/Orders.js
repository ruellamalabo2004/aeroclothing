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

  const API_URL = "http://127.0.0.1:8000/api";

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await axios.get(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setOrders(response.data);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to fetch orders. Please try again.");
      }
      setOrders([]);
    }
  };

  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders();
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

      {/* Edit Order Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="edit-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-content">
              <h2>Edit Order #{selectedOrder.id}</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="product-form">
                <div className="form-content">
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      name="customer"
                      placeholder="Enter customer name"
                      value={selectedOrder.customer || ""}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      name="payment_method"
                      value={selectedOrder.payment_method || ""}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Payment Method</option>
                      <option value="CASH">Cash</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Total Amount</label>
                    <input
                      type="number"
                      name="total_amount"
                      placeholder="Enter total amount"
                      value={selectedOrder.total_amount || ""}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="created_at"
                      value={selectedOrder.created_at ? new Date(selectedOrder.created_at).toISOString().split('T')[0] : ""}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      name="status" 
                      value={selectedOrder.status || ""} 
                      onChange={handleFormChange}
                    >
                      <option value="">Select Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPING">Shipping</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELED">Canceled</option>
                      <option value="RETURNED">Returned</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setSelectedOrder(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="publish-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className="modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="edit-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-content">
              <h2>Order Details #{viewOrder.id}</h2>
              <div className="form-content">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={viewOrder.customer || ""}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <input
                    type="text"
                    value={viewOrder.payment_method || ""}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Total Amount</label>
                  <input
                    type="text"
                    value={`₱${viewOrder.total_amount || "0"}`}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="text"
                    value={viewOrder.created_at ? new Date(viewOrder.created_at).toLocaleDateString() : ""}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <input
                    type="text"
                    value={viewOrder.status || ""}
                    disabled
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setViewOrder(null)}>
                  Close
                </button>
              </div>
            </div>
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
      <td>{order.customer || "Unknown Customer"}</td>
      <td>{order.payment_method || "N/A"}</td>
      <td>₱{order.total_amount || 0}</td>
      <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}</td>
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
