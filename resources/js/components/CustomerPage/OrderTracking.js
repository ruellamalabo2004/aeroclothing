import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../HeaderContent/Header'; // Import Header
import Footer from '../FooterContent/Footer'; // Import Footer
import OrderTrackingStatus from './OrderTrackingStatus'; // Import the status tracker
import OrderTrackingItems from './OrderTrackingItems'; // Import the new items component

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch order details with shipping_method included
        const orderResponse = await axios.get(`/api/orders/${orderId}?include=shipping_method`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Fetch tracking history for this order
        const trackingResponse = await axios.get(`/api/orders/${orderId}/tracking`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Log response to debug
        console.log('Order data:', orderResponse.data);
        console.log('Shipping method:', orderResponse.data.shipping_method);
        
        // Set order data with tracking history
        setOrder({
          ...orderResponse.data,
          tracking_history: trackingResponse.data
        });
        setTrackingHistory(trackingResponse.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId, navigate]);

  // Calculate stepper progress for the bar fill
  let stepperProgress = 0;
  if (order && order.status) {
    const statusList = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERING', 'COMPLETED'];
    const idx = statusList.indexOf(order.status.toUpperCase());
    if (idx >= 0) stepperProgress = idx / (statusList.length - 1);
  }

  if (loading) {
    return (
      <div className="order-tracking-page">
        <Header />
        <div className="order-tracking-content">
          <div className="order-tracking-title">
            <h1>Loading Order Details...</h1>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-page">
        <Header />
        <div className="order-tracking-content">
          <div className="order-tracking-title">
            <h1>Error</h1>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking-page">
        <Header />
        <div className="order-tracking-content">
          <div className="order-tracking-title">
            <h1>Order Not Found</h1>
            <p>The requested order could not be found.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="order-tracking-page">
      <Header />
      <div className="order-tracking-content">
        <div className="order-tracking-title">
          <h1>Order Progress</h1>
          <p>Track the status of your order #{order.id}</p>
        </div>
        <div style={{ '--stepper-progress': stepperProgress }}>
          <OrderTrackingStatus order={order} />
        </div>
        <OrderTrackingItems order={order} />
      </div>
      <Footer />
    </div>
  );
};

export default OrderTracking;