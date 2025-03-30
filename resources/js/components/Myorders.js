import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please log in to view your order details.");

        const response = await axios.get(`${API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrder(response.data);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(err.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">Order not found.</div>;

  return (
    <div className="OrderDetails">
      <Header />
      <div className="order-container">
        <h1>Order #{order.id}</h1>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total Amount:</strong> ₱{order.total_amount.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> {order.payment_method}</p>
        <p><strong>Order Date:</strong> {new Date(order.date).toLocaleDateString()}</p>

        <h2>Ordered Products</h2>
        <div className="order-products">
          {order.products.map((product) => (
            <div key={product.id} className="order-product">
              <img 
                src={product.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : "/default-image.jpg"} 
                alt={product.product_name} 
                className="product-image"
              />
              <div className="product-details">
                <h3>{product.product_name}</h3>
                <p>Price: ₱{product.price.toFixed(2)}</p>
                <p>Quantity: {product.pivot?.quantity || 1}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => navigate("/profile/orders")} className="back-button">
          Back to My Orders
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetails;
