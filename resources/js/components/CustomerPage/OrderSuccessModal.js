import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const OrderSuccessModal = ({ orderId, shippingDescription, onTrackOrder, onShopMore }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <div className="order-success-modal">
      <div className="order-success-modal__content">
        {isLoading ? (
          <>
            <div className="order-success-modal__icon">
              <Loader2 className="order-success-modal__spinner" size={64} />
            </div>
            <p className="order-success-modal__loading-text">Your order is processing, please wait...</p>
          </>
        ) : (
          <>
            <h1 className="order-success-modal__header">THANK YOU FOR YOUR PURCHASE!</h1>
            <div className="order-success-modal__icon">
              <img src="/images/successorder.svg" alt="Order Success" className="order-success-modal__success-image" />
            </div>
            <h2 className="order-success-modal__title">Your order number #{orderId}</h2>
            <p className="order-success-modal__message">
              Your order was placed successfully! You can track the status of your delivery below.
            </p>
            <div className="order-success-modal__buttons">
              <button className="order-success-modal__shop-btn" onClick={onShopMore}>
                Back to Shopping
              </button>
              <button className="order-success-modal__track-btn" onClick={onTrackOrder}>
                Track Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessModal;