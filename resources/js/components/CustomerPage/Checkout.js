import React, { useState, useCallback, useEffect } from 'react';
import Header from '../HeaderContent/Header';
import CheckoutForm from './CheckoutForm';
import CheckoutSummary from './CheckoutSummary';
import axios from 'axios';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px' }}>
          <h1>Checkout Error</h1>
          <p>{this.state.error?.message || 'An error occurred in the checkout component'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Checkout = () => {
  const [stepsCompleted, setStepsCompleted] = useState({
    shippingInfo: false,
    shippingMethod: false,
    paymentMethod: false,
  });
  const [shippingMethod, setShippingMethod] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [profileId, setProfileId] = useState(null);
  const [error, setError] = useState(null);

  const authAxios = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAxios.get('/profile');
        console.log('Profile Response:', response.data);
        if (response.data && response.data.profile && response.data.profile.id) {
          setProfileId(response.data.profile.id);
        } else {
          setError('Failed to fetch profile data. Please log in again.');
        }
      } catch (err) {
        console.error('Profile API error:', err.response?.data, err.message);
        setError('Failed to fetch profile data. Please log in again.');
      }
    };
    fetchProfile();
  }, []);

  const handleStepCompletion = useCallback((step, isCompleted) => {
    console.log(`handleStepCompletion called: ${step} = ${isCompleted}`);
    if (!['shippingInfo', 'shippingMethod', 'paymentMethod'].includes(step)) {
      console.error(`Invalid step: ${step}`);
      return;
    }
    setStepsCompleted((prev) => {
      if (prev[step] === isCompleted) {
        console.log(`No change for ${step}, skipping state update`);
        return prev;
      }
      const newState = { ...prev, [step]: isCompleted };
      console.log('New stepsCompleted state:', newState);
      return newState;
    });
  }, []);

  const handleMethodsChange = useCallback(({ shippingMethod, paymentMethod, shippingFee }) => {
    console.log('Methods changed:', { shippingMethod, paymentMethod, shippingFee });
    setShippingMethod(shippingMethod);
    setPaymentMethod(paymentMethod);
    setShippingFee(shippingFee || 0);
  }, []);

  console.log('Rendering Checkout', { stepsCompleted, shippingMethod, paymentMethod, shippingFee, profileId });

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  }

  return (
    <ErrorBoundary>
      <div className="checkout">
        <Header />
        <div className="checkout-content">
          <h1 className="checkout-title">CHECKOUT</h1>
          <div className="progress-tracker">
            <div className={`progress-step ${stepsCompleted.shippingInfo ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping Information</span>
            </div>
            <div className="progress-connector"></div>
            <div className={`progress-step ${stepsCompleted.shippingMethod ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Shipping Method</span>
            </div>
            <div className="progress-connector"></div>
            <div className={`progress-step ${stepsCompleted.paymentMethod ? 'completed' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Payment Method</span>
            </div>
          </div>
          <div className="checkout-layout">
            <div className="checkout-form-container">
              <CheckoutForm
                onStepComplete={handleStepCompletion}
                onMethodsChange={handleMethodsChange}
              />
            </div>
            <div className="checkout-summary-container">
              <CheckoutSummary
                shippingMethod={shippingMethod}
                paymentMethod={paymentMethod}
                shippingFee={shippingFee}
                profileId={profileId}
                stepsCompleted={stepsCompleted}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Checkout;