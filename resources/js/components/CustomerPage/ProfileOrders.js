import React from 'react';
import { Link } from 'react-router-dom';

const ProfileOrders = () => {
  const orders = [
    {
      id: 'ORD-12345',
      date: 'April 10, 2023',
      items: [
        { name: 'Classic Denim', quantity: 1, price: 79.99, image: '/images/classic-denim.jpg' },
        { name: 'Essential Cotton Tee', quantity: 1, price: 49.99, image: '/images/cotton-tee.jpg' },
      ],
      status: 'Delivered',
    },
    {
      id: 'ORD-67890',
      date: 'March 25, 2023',
      items: [
        { name: 'Tailored Trousers', quantity: 1, price: 89.99, image: '/images/tailored-trousers.jpg' },
      ],
      status: 'Delivered',
    },
  ];

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  return (
    <div className="profile-orders">
      <div className="profile-orders-section">
        <h2 className="profile-orders-title">My Orders</h2>
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="profile-orders-card">
              <div className="profile-orders-header">
                <span>{order.id} {order.date}</span>
                <div>
                  <span className="profile-orders-status">{order.status}</span>
                  <Link to={`/order/${order.id}`} className="profile-orders-view">View Details</Link>
                </div>
              </div>
              {order.items.map((item) => (
                <div key={item.name} className="profile-orders-item">
                  <img src={item.image} alt={item.name} className="profile-orders-item-image" />
                  <div className="profile-orders-item-details">
                    <h3>{item.name}</h3>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="profile-orders-item-price">${item.price.toFixed(2)}</div>
                </div>
              ))}
              <div className="profile-orders-total">
                <span>Total</span>
                <span>${calculateOrderTotal(order.items)}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="profile-orders-no-orders">No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default ProfileOrders;