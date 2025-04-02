import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from '../HeaderArea/CartSidebar';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          Error: {this.state.error?.message || 'Something went wrong'}
        </div>
      );
    }
    return this.props.children;
  }
}

const MyOrders = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    profile_pic: '/imgs/profile.svg',
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [review, setReview] = useState('');

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const profileResponse = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = profileResponse.data.profile || {};
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/profile.svg',
        });

        const ordersResponse = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);

        const cartResponse = await axios.get(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(Array.isArray(cartResponse.data) ? cartResponse.data : []);
      } catch (err) {
        setError(err.message || "An error occurred while fetching data.");
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleReviewSubmit = async (orderId, orderDetailId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found. Please log in.');

      const response = await axios.post(
        `${API_URL}/orders/${orderId}/order-details/${orderDetailId}/review`,
        { review },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Review submitted successfully!');
      setReview('');
    } catch (err) {
      alert(`Error submitting review: ${err.message}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading orders...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  return (
    <ErrorBoundary>
      <div className="MyOrders">
        <Header userProfile={profile} />
        <CartSidebar cartItems={cartItems} />
        <div className="profile-container">
          <h1 className="profile-title">Order History</h1>
          <div className="profile-body">
            <div className="profile-content">
              {orders.length > 0 ? (
                <div className="orders-history">
                  <p>Orders found: {orders.length}</p>
                  <ul>
                    {orders.map(order => (
                      <li key={order.id}>
                        <p>Order #{order.id} - {order.status} - ₱{order.total_amount?.toFixed(2) || '0.00'}</p>
                        {order.details && order.details.map((detail) => (
                          <div key={detail.id}>
                            <p>Product: {detail.product?.name || 'Unknown'}</p>
                            <p>Quantity: {detail.quantity || 0}</p>
                            {order.status === 'DELIVERED' && (
                              <div>
                                <textarea
                                  value={review}
                                  onChange={(e) => setReview(e.target.value)}
                                  placeholder="Write your review here..."
                                />
                                <button onClick={() => handleReviewSubmit(order.id, detail.id)}>
                                  Submit Review
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No orders found in your history.</p>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default MyOrders;