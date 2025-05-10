import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; // For the "Continue Shopping" button link

const OrderTrackingItems = ({ order }) => {
  useEffect(() => {
    // Debug logging to see what data we have
    console.log('Order in OrderTrackingItems:', order);
    console.log('Shipping method:', order.shipping_method);
  }, [order]);

  const getImageUrl = (url) => {
    if (!url) return '/images/placeholder.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/storage')) return url;
    return `/storage/products/${url.replace(/^products[\/]/, '')}`;
  };

  const formatPrice = (price) => {
    try {
      return parseFloat(price || 0).toFixed(2);
    } catch (err) {
      return '0.00';
    }
  };
  
  // Get order date and format it
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const orderDate = formatDate(order.order_date || order.created_at);
  
  // Shipping method info - with careful fallbacks
  const shippingMethod = order.shipping_method || {};
  const shippingMethodName = shippingMethod.name || 'Standard Shipping';
  
  // Handle shipping fee with proper fallbacks
  let shippingFee = 0;
  if (shippingMethod && shippingMethod.fee !== undefined) {
    shippingFee = shippingMethod.fee;
  } else if (order.shipping_fee !== undefined) {
    shippingFee = order.shipping_fee;
  }
  
  // Ensure we display the shipping method description properly
  const estimatedDelivery = 
    (shippingMethod && shippingMethod.description) 
      ? shippingMethod.description 
      : 'Estimated delivery time not available';

  return (
    <div className="order-tracking-items">
      <h2>Order Items</h2>
      <div className="order-info">
        <div className="order-info-row">
          <span className="info-label">Order Date:</span>
          <span className="info-value">{orderDate}</span>
        </div>
        <div className="order-info-row">
          <span className="info-label">Delivery Method:</span>
          <span className="info-value">{shippingMethodName}</span>
        </div>
        <div className="order-info-row">
          <span className="info-label">Estimated Delivery:</span>
          <span className="info-value">{estimatedDelivery}</span>
        </div>
      </div>
      
      <div className="items-list">
        {order.order_details?.map((item, index) => (
          <div key={index} className="item-row">
            <img 
              src={getImageUrl(item.product?.image_1)} 
              alt={item.product?.product_name || 'Product'} 
              className="item-image" 
            />
            <div className="item-details">
              <p className="item-name">{item.product?.product_name || 'Product'}</p>
              <p className="item-quantity">Qty: {item.quantity}</p>
              {item.size && <p className="item-size">Size: {item.size}</p>}
              {item.color && <p className="item-color">Color: {item.color}</p>}
            </div>
            <p className="item-price">${formatPrice(item.price)}</p>
          </div>
        ))}
      </div>
      
      <div className="order-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>${formatPrice(order.subtotal || (order.total_amount - shippingFee))}</span>
        </div>
        <div className="summary-row">
          <span>Shipping Fee ({shippingMethodName})</span>
          <span>${formatPrice(shippingFee)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>${formatPrice(order.total_amount)}</span>
        </div>
      </div>
      
      <Link to="/shop" className="continue-shopping-btn">
        Continue Shopping
      </Link>
    </div>
  );
};

export default OrderTrackingItems;