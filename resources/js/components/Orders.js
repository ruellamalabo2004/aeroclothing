import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Orders() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [isArchiving, setIsArchiving] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view orders.");
          return;
        }

        const response = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ordersData = response.data.data || response.data || [];
        const ordersWithCustomer = await Promise.all(
          ordersData.map(async (order) => {
            try {
              const profileResponse = await axios.get(
                `${API_URL}/profiles/${order.profile_id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const profile = profileResponse.data.data || profileResponse.data;
              return {
                ...order,
                customer: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
              };
            } catch (err) {
              console.error(`Error fetching profile for order ${order.id}:`, err);
              return { ...order, customer: "Unknown" };
            }
          })
        );

        setOrders(ordersWithCustomer);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === "All" || order.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = order.id.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const paginatedOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const orderCards = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Canceled",
    "Returned",
  ].map((status) => ({
    status,
    count: orders.filter((o) => o.status.toLowerCase() === status.toLowerCase()).length,
  }));

  const handleFormChange = (e) => {
    setSelectedOrder({ ...selectedOrder, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to update orders.");
        return;
      }

      const updatedOrderData = {
        payment_method: selectedOrder.payment_method,
        total_amount: Number(selectedOrder.total_amount),
        status: selectedOrder.status,
      };

      const response = await axios.put(
        `${API_URL}/orders/${selectedOrder.id}`,
        updatedOrderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id ? { ...order, ...response.data.data } : order
        )
      );
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating order:", error);
      setError("Failed to update order: " + (error.response?.data?.message || error.message));
    }
  };

  const handleArchiveClick = (order) => {
    setIsArchiving(order);
  };

  const confirmArchive = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to archive orders.");
        return;
      }

      await axios.post(
        `${API_URL}/orders/${isArchiving.id}/archive`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== isArchiving.id)
      );
      setIsArchiving(null);
    } catch (error) {
      console.error("Error archiving order:", error);
      setError("Failed to archive order: " + (error.response?.data?.message || error.message));
      setIsArchiving(null);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <main>
      <h1>Orders</h1>

      <div className="orders-cards-container">
        {orderCards.map((order) => (
          <div className="orders-card" key={order.status}>
            <img
              src={`/imgs/${order.status.toLowerCase()}.svg`}
              alt={order.status}
              className="orders-card-image"
              onError={(e) => (e.target.src = "/imgs/default.svg")}
            />
            <div className="orders-card-text">{order.status}</div>
            <div className="orders-card-number">{order.count}</div>
          </div>
        ))}
      </div>

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

      {loading && <div className="loading">Loading orders...</div>}
      {error && <div className="error-message">{error}</div>}

      {viewOrder && (
        <div className="modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="view-order" onClick={(e) => e.stopPropagation()}>
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> {viewOrder.id}</p>
            <p><strong>Customer Name:</strong> {viewOrder.customer || "N/A"}</p>
            <p><strong>Payment Method:</strong> {viewOrder.payment_method || "N/A"}</p>
            <p><strong>Total Amount:</strong> ₱{Number(viewOrder.total_amount).toFixed(2)}</p>
            <p><strong>Date:</strong> {new Date(viewOrder.created_at).toLocaleDateString() || "N/A"}</p>
            <p><strong>Status:</strong> {viewOrder.status || "N/A"}</p>
            <button onClick={() => setViewOrder(null)}>Close</button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="edit-order-container" onClick={(e) => e.stopPropagation()}>
            <div className="edit-order-content">
              <h2>Edit Order #{selectedOrder.id}</h2>
              <div className="edit-form-group">
                <label>Payment Method</label>
                <input
                  type="text"
                  name="payment_method"
                  value={selectedOrder.payment_method || ""}
                  onChange={handleFormChange}
                  placeholder="Enter payment method"
                />
              </div>
              <div className="edit-form-group">
                <label>Total Amount</label>
                <input
                  type="number"
                  name="total_amount"
                  value={selectedOrder.total_amount || ""}
                  onChange={handleFormChange}
                  placeholder="Enter total amount"
                  step="0.01"
                />
              </div>
              <div className="edit-form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={selectedOrder.status || ""}
                  onChange={handleFormChange}
                >
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

      {!loading && !error && !selectedOrder && !viewOrder && !isArchiving && (
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
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <img
                          src="/imgs/viewing.svg"
                          alt="View"
                          className="action-img"
                          onClick={() => setViewOrder(order)}
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
                          search="/imgs/archiving.svg"
                          alt="Archive"
                          className="action-img"
                          onClick={() => handleArchiveClick(order)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td>{order.id}</td>
                      <td>{order.customer || "N/A"}</td>
                      <td>{order.payment_method || "N/A"}</td>
                      <td>₱{Number(order.total_amount).toFixed(2)}</td>
                      <td>{new Date(order.created_at).toLocaleDateString() || "N/A"}</td>
                      <td>
                        <span
                          className={`status-frame status-${order.status.toLowerCase()}`}
                        >
                          {order.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
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