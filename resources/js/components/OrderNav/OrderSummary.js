import React from 'react';
import SecureBadge from './SecureBadge';

const OrderSummary = ({ orderDetails, onPayment }) => {
  return (
    <div className="order-summary">
      <h2>Order Summary</h2>
      
      <div className="order-items">
        {orderDetails.items.map((item) => (
          <div key={item.id} className="order-item">
            <img src={item.image} alt={item.name} className="item-image" />
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="item-price">${item.price}</p>
              <p className="item-quantity">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="price-breakdown">
        <div className="price-row">
          <span>Subtotal</span>
          <span>${orderDetails.subtotal}</span>
        </div>
        <div className="price-row">
          <span>Shipping</span>
          <span>${orderDetails.shipping}</span>
        </div>
        {orderDetails.discount > 0 && (
          <div className="price-row discount">
            <span>Discount</span>
            <span>-${orderDetails.discount}</span>
          </div>
        )}
        <div className="price-row total">
          <span>Total</span>
          <span>${orderDetails.total}</span>
        </div>
      </div>

      <button 
        className="pay-now-button"
        onClick={onPayment}
      >
        Pay Now
      </button>

      <SecureBadge />
    </div>
  );
};

export default OrderSummary;