import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";


const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:8000/api";
  const BASE_IMAGE_URL = "http://localhost:8000/storage";

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);

      if (!id) {
        // Fetch the most recent order if no ID is provided
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            setError("Please log in to view your order.");
            setLoading(false);
            return;
          }

          const response = await axios.get(`${API_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const ordersData = response.data.data || response.data || [];
          if (ordersData.length === 0) {
            setError("No orders found.");
            setLoading(false);
            return;
          }

          const sortedOrders = ordersData.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          const latestOrder = sortedOrders[0];

          try {
            const statusResponse = await axios.get(
              `${API_URL}/orders/${latestOrder.id}/status-history`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            latestOrder.status_history =
              statusResponse.data.data || statusResponse.data || [];
          } catch (err) {
            console.error("Error fetching status history:", err);
            latestOrder.status_history = [];
          }

          setOrder(latestOrder);
        } catch (error) {
          console.error("Error fetching recent order:", error.response?.data || error.message);
          setError("Failed to fetch order: " + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!id.startsWith("Order")) {
        setError("Invalid order ID format. Please use the format /OrderTracking/Order[ID].");
        setLoading(false);
        navigate("/OrderTracking/Order1");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view your order.");
          setLoading(false);
          return;
        }

        const orderId = id.replace("Order", "");
        if (!orderId || isNaN(orderId)) {
          setError("Invalid order ID. Please provide a numeric ID.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const orderData = response.data.data || response.data;
        if (!orderData) {
          setError("Order not found.");
          setLoading(false);
          return;
        }

        try {
          const statusResponse = await axios.get(
            `${API_URL}/orders/${orderId}/status-history`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          orderData.status_history =
            statusResponse.data.data || statusResponse.data || [];
        } catch (err) {
          console.error("Error fetching status history:", err);
          orderData.status_history = [];
        }

        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order:", error.response?.data || error.message);
        setError("Failed to fetch order: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const statusSteps = [
    { status: "Pending", label: "Order Placed" },
    { status: "Processing", label: "Processing" },
    { status: "Shipped", label: "Shipped" },
    { status: "Delivered", label: "Delivered" },
  ];

  const getCurrentStep = (status) => {
    const stepIndex = statusSteps.findIndex((step) => step.status === status);
    return stepIndex !== -1 ? stepIndex : 0;
  };

  if (loading) return <div className="loading">Loading your order...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="order-tracking">
      <h2>Track Your Order</h2>
      {!order ? (
        <p className="no-order">Order not found.</p>
      ) : (
        <div className="order-card">
          <div className="order-header">
            <h3>Order ID: {order.id}</h3>
            <div className={`status status-${order.status.toLowerCase()}`}>
              {order.status.toUpperCase()}
            </div>
          </div>
          <div className="order-details">
            <p>
              <strong>Payment Method:</strong> {order.payment_method}
            </p>
            <p>
              <strong>Total Amount:</strong> ₱{Number(order.total_amount).toFixed(2)}
            </p>
            <p>
              <strong>Ordered On:</strong>{" "}
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div className="tracking-progress">
            <h4>Order Status</h4>
            <div className="progress-bar">
              {statusSteps.map((step, index) => {
                const currentStep = getCurrentStep(order.status);
                const isActive = index <= currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div
                    key={step.status}
                    className={`progress-step ${isActive ? "active" : ""} ${
                      isCompleted ? "completed" : ""
                    }`}
                  >
                    <div className="step-circle">
                      {isCompleted ? (
                        <span className="checkmark">✔</span>
                      ) : (
                        <span className="step-number">{index + 1}</span>
                      )}
                    </div>
                    <div className="step-label">{step.label}</div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`progress-line ${
                          isActive ? "active-line" : ""
                        }`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="products-section">
            <h4>Products Ordered:</h4>
            {order.order_details && order.order_details.length > 0 ? (
              <ul className="product-list">
                {order.order_details.map((detail) => (
                  <li key={detail.id} className="product-item">
                    <img
                      src={
                        detail.product?.image_1
                          ? `${BASE_IMAGE_URL}/${detail.product.image_1}`
                          : "/default-image.jpg"
                      }
                      alt={detail.product?.product_name || "Product"}
                      className="product-image"
                      onError={(e) => (e.target.src = "/default-image.jpg")}
                    />
                    <div className="product-info">
                      <p className="product-name">
                        {detail.product?.product_name || "Product Not Found"}
                      </p>
                      <p className="product-quantity">
                        Quantity: {detail.quantity} pcs
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No products found in this order.</p>
            )}
          </div>

          <div className="status-timeline">
            <h4>Order Status Timeline:</h4>
            {order.status_history && order.status_history.length > 0 ? (
              <ul className="timeline">
                {order.status_history.map((status, index) => (
                  <li key={index} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <p className="timeline-status">{status.status}</p>
                      <p className="timeline-timestamp">
                        {new Date(status.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No status updates available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;

