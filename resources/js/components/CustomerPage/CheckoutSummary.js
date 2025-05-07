import React, { useState } from 'react';
import { useCart } from '../Notifs/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle, Package, ShoppingBag } from 'lucide-react';

const OrderSuccessModal = ({ orderId, shippingDescription, onTrackOrder, onShopMore }) => (
  <div className="order-success-modal">
    <div className="order-success-modal__content">
      <div className="order-success-modal__icon">
        <CheckCircle size={64} color="#4CAF50" />
      </div>
      <h2 className="order-success-modal__title">YOUR ORDER HAS BEEN PLACED!</h2>
      <p className="order-success-modal__order-number">Order #{orderId}</p>
      <p className="order-success-modal__shipping-info">
        {shippingDescription ? shippingDescription : 'Please wait for your order to arrive'}
      </p>
      <div className="order-success-modal__buttons">
        <button className="order-success-modal__track-btn" onClick={onTrackOrder}>
          <Package size={20} />
          Track Order
        </button>
        <button className="order-success-modal__shop-btn" onClick={onShopMore}>
          <ShoppingBag size={20} />
          Shop More
        </button>
      </div>
    </div>
  </div>
);

const LoadingModal = () => (
  <div className="loading-modal">
    <div className="loading-modal__content">
      <Loader2 className="loading-modal__spinner" size={48} />
      <p className="loading-modal__text">Your order is processing, please wait...</p>
    </div>
  </div>
);

const CheckoutSummary = ({ shippingMethod, paymentMethod, shippingFee, profileId, stepsCompleted }) => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [shippingDescription, setShippingDescription] = useState('');

  const authAxios = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const calculateSubtotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = calculateSubtotal() + (shippingFee || 0);

  const handleViewCart = () => navigate('/cart');
  const handleTrackOrder = () => navigate(`/profile/orders/${orderId}`);
  const handleShopMore = () => navigate('/shop');

  // Helper to extract delivery info from shippingMethod (if it's an object)
  const getShippingDescription = () => {
    if (shippingMethod && typeof shippingMethod === 'object' && shippingMethod.description) {
      return shippingMethod.description;
    }
    // If shippingMethod is just an ID, fallback
    return 'Please wait for your order to arrive';
  };

  const handleConfirmCheckout = async () => {
    if (!profileId) {
      setError('Please log in to place an order.');
      return;
    }
    if (!shippingMethod || !paymentMethod) {
      setError('Please select shipping and payment methods.');
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (!Object.values(stepsCompleted).every(Boolean)) {
      setError('Please complete all checkout steps.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        profile_id: profileId,
        shipping_method_id: typeof shippingMethod === 'object' ? shippingMethod.id : shippingMethod,
        payment_method_id: paymentMethod,
        total_amount: total,
        order_details: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
          size: item.size,
          color: item.color,
        })),
      };

      const response = await authAxios.post('/orders', orderData);
      setOrderId(response.data.order_id);
      setShippingDescription(getShippingDescription());
      clearCart();
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="checkout-summary">
        <div className="summary-header">
          <h2>Order Summary</h2>
        </div>
        {error && <div className="error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        {cart.length === 0 ? (
          <p>No items in cart</p>
        ) : (
          <div className="summary-items">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="summary-item">
                <img
                  src={item.imagePreview || '/images/placeholder.png'}
                  alt={item.productName}
                  className="item-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.png';
                  }}
                />
                <div className="item-details">
                  <h3>{item.productName}</h3>
                  <div className="item-specs">
                    <p>Qty: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                    <p>Color: {item.color}</p>
                  </div>
                </div>
                <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
        <div className="summary-totals">
          <div className="total-row">
            <span>Subtotal</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Shipping</span>
            <span>${(shippingFee || 0).toFixed(2)}</span>
          </div>
          <div className="total-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="summary-actions">
          <button className="view-cart-btn" onClick={handleViewCart}>View Cart</button>
          <button
            className="confirm-btn"
            onClick={handleConfirmCheckout}
            disabled={isLoading || cart.length === 0 || !Object.values(stepsCompleted).every(Boolean)}
          >
            {isLoading ? 'Processing...' : 'Confirm Checkout'}
          </button>
        </div>
        <p className="terms-note">
          By placing your order, you agree to our Terms and Conditions and Privacy Policy.
        </p>
      </div>
      {isLoading && <LoadingModal />}
      {showSuccessModal && (
        <OrderSuccessModal
          orderId={orderId}
          shippingDescription={shippingDescription}
          onTrackOrder={handleTrackOrder}
          onShopMore={handleShopMore}
        />
      )}
    </>
  );
};

export default CheckoutSummary;