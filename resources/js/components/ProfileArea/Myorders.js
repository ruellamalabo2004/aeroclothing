import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from '../HeaderArea/CartSidebar';

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
  const [activeMenuItem, setActiveMenuItem] = useState('orders');

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No authentication token found. Please log in.");

        // Fetch Profile
        const profileResponse = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = profileResponse.data.profile;
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/profile.svg',
        });

        // Fetch Orders
        const ordersResponse = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure ordersData is an array to prevent crashes
        const ordersData = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
        setOrders(ordersData);
        console.log("Fetched Orders:", ordersData);

        // Fetch Cart
        const cartResponse = await axios.get(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartData = Array.isArray(cartResponse.data) ? cartResponse.data : [];
        setCartItems(cartData);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err.message || "An error occurred.");
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="MyOrders">
      <Header userProfile={profile} />
      <CartSidebar cartItems={cartItems} />

      <div className="profile-container">
        <h1 className="profile-title">Order History</h1>
        <div className="profile-body">
          <div className="sidebar">
            <div className="user-info">
              <img src={profile.profile_pic} alt="Profile" className="profile-pic" />
              <h2>{profile.first_name} {profile.last_name}</h2>
            </div>
            <ul className="nav-menu">
              <li className={activeMenuItem === 'orders' ? 'active' : ''} onClick={() => navigate('/profile/orders')}>
                <img src="/imgs/myorder.svg" alt="My Orders" /> My Orders
              </li>
              <li className="logout" onClick={handleLogout}>
                <img src="/imgs/mylogout.svg" alt="Logout" /> Logout
              </li>
            </ul>
          </div>

          <div className="profile-content">
            {orders.length > 0 ? (
              <div className="orders-history">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Total Amount</th>
                      <th>Order Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.status}</td>
                        <td>₱{order.total_amount ? order.total_amount.toFixed(2) : '0.00'}</td>
                        <td>{order.order_date ? new Date(order.order_date).toLocaleString() : 'N/A'}</td>
                        <td>
                          <button onClick={() => navigate(`/my-orders/${order.id}`)} className="view-details-button">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No orders found in your history.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyOrders;
