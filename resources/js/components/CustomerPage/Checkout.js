import React from 'react';
import Header from '../HeaderContent/Header';
import Footer from '../FooterContent/Footer';
import CheckoutForm from './CheckoutForm';
import CheckoutSummary from './CheckoutSummary';

const Checkout = () => {
  return (
    <div className="checkout">
      <Header />
      <div className="checkout-content">
        <h1 className="checkout-title">CONFIRM YOUR ORDER</h1>
        <p className="checkout-description">Review your details and confirm your selections before placing your order.</p>
        <div className="checkout-layout">
          <div className="checkout-form-container">
            <CheckoutForm />
          </div>
          <div className="checkout-summary-container">
            <CheckoutSummary />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;