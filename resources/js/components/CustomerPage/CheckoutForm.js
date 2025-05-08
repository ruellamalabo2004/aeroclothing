  import React, { useState, useEffect } from 'react';
  import { Pencil, CreditCard, Package, Truck, ChevronDown, Phone } from 'lucide-react';
  import axios from 'axios';

  const CheckoutForm = ({ onStepComplete, onMethodsChange }) => {
    const [isEditing, setIsEditing] = useState(true);
    const [saveAddress, setSaveAddress] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
      recipient_name: '',
      phone_number: '',
      street_address: '',
      city: '',
      region: '',
      postal_code: '',
      country_id: '',
      email: '',
    });
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState({
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      gcashMobile: '',
    });
    const [errors, setErrors] = useState({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });
    const [shippingMethod, setShippingMethod] = useState(null);
    const [hasInteractedWithShipping, setHasInteractedWithShipping] = useState(false);
    const [countries, setCountries] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [shippingMethods, setShippingMethods] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [renderError, setRenderError] = useState(null);
    const [prevShippingInfoValid, setPrevShippingInfoValid] = useState(false);
    const [prevShippingMethodValid, setPrevShippingMethodValid] = useState(false);
    const [prevPaymentMethodValid, setPrevPaymentMethodValid] = useState(false);

    const authAxios = axios.create({
      baseURL: 'http://127.0.0.1:8000/api',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const publicAxios = axios.create({
      baseURL: 'http://127.0.0.1:8000/api',
    });

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.warn('No auth token found');
            setError('Please log in to continue.');
            return;
          }

          console.log('Fetching addresses...');
          const addressesResponse = await authAxios.get('/addresses').catch(err => {
            console.error('Addresses API error:', err.response?.data, err.message);
            return { data: [] };
          });
          console.log('Addresses Response:', addressesResponse.data);
          const addresses = addressesResponse.data || [];
          const addressData = Array.isArray(addresses) ? addresses : addresses.data || [];
          const defaultAddress = addressData.find(addr => addr.is_default) || {};
          console.log('Addresses:', addressData);

          let userId = defaultAddress.user_id || addressData[0]?.user_id;

          let userData = {};
          if (userId) {
            console.log(`Fetching user with ID: ${userId}`);
            const userResponse = await authAxios.get(`/users/${userId}`).catch(err => {
              console.error('User API error:', err.response?.data, err.message);
              return { data: {} };
            });
            console.log('User Response:', userResponse.data);
            userData = userResponse.data?.data || userResponse.data || {};
          } else {
            console.log('Fetching all users (fallback)...');
            const usersResponse = await authAxios.get('/users').catch(err => {
              console.error('Users API error:', err.response?.data, err.message);
              return { data: [] };
            });
            console.log('Users Response:', usersResponse.data);
            const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data?.data || [];
            userData = users[0] || {};
          }
          console.log('User data:', userData);

          if (userData.email) {
            setShippingInfo(prev => ({
              ...prev,
              email: userData.email,
            }));
          }

          if (defaultAddress) {
            setShippingInfo(prev => ({
              ...prev,
              recipient_name: defaultAddress.recipient_name || '',
              phone_number: defaultAddress.phone_number || '',
              street_address: defaultAddress.street_address || '',
              city: defaultAddress.city || '',
              region: defaultAddress.region || '',
              postal_code: defaultAddress.postal_code || '',
              country_id: defaultAddress.country_id ? String(defaultAddress.country_id) : '',
            }));
            setSaveAddress(defaultAddress.is_default || false);
          }

          console.log('Fetching countries...');
          const countriesResponse = await publicAxios.get('/countries').catch(err => {
            console.error('Countries API error:', err.response?.data, err.message);
            return { data: [] };
          });
          console.log('Countries Response:', countriesResponse.data);
          const countriesData = Array.isArray(countriesResponse.data) ? countriesResponse.data : countriesResponse.data?.data || [];
          setCountries(countriesData);
          console.log('Countries:', countriesData);

          console.log('Fetching payment methods...');
          const paymentMethodsResponse = await publicAxios.get('/payment-methods').catch(err => {
            console.error('Payment Methods API error:', err.response?.data, err.message);
            return { data: [] };
          });
          console.log('Payment Methods Response:', paymentMethodsResponse.data);
          const paymentMethodsData = Array.isArray(paymentMethodsResponse.data) ? paymentMethodsResponse.data : paymentMethodsResponse.data?.data || [];
          setPaymentMethods(paymentMethodsData);
          if (paymentMethodsData.length > 0 && paymentMethodsData[0]?.id) {
            setPaymentMethod(Number(paymentMethodsData[0].id));
          }
          console.log('Payment methods:', paymentMethodsData);

          console.log('Fetching shipping methods...');
          const shippingMethodsResponse = await publicAxios.get('/shipping-methods').catch(err => {
            console.error('Shipping Methods API error:', err.response?.data, err.message);
            return { data: [] };
          });
          console.log('Raw Shipping Methods Response:', shippingMethodsResponse.data);
          const shippingMethodsData = Array.isArray(shippingMethodsResponse.data) ? shippingMethodsResponse.data : shippingMethodsResponse.data?.data || [];
          setShippingMethods(shippingMethodsData);
          if (shippingMethodsData.length > 0 && shippingMethodsData[0]?.id) {
            setShippingMethod(Number(shippingMethodsData[0].id));
            setHasInteractedWithShipping(true);
          }
          console.log('Shipping methods:', shippingMethodsData);

          setError(null);
        } catch (error) {
          console.error('General API error:', error.response?.data, error.message);
          if (error.response?.status === 401) {
            setError('Unauthorized: Please log in again.');
            localStorage.removeItem('token');
          } else {
            setError(`Failed to load checkout data: ${error.message}`);
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, []);

    useEffect(() => {
      if (onMethodsChange && shippingMethod) {
        const selectedMethod = shippingMethods.find(method => method.id === shippingMethod);
        const shippingFee = selectedMethod ? Number(selectedMethod.fee) : 0;
        onMethodsChange({ shippingMethod, paymentMethod, shippingFee });
      }
    }, [shippingMethod, paymentMethod, shippingMethods, onMethodsChange]);

    const validateShippingInfo = () => {
      return (
        shippingInfo.recipient_name &&
        shippingInfo.phone_number &&
        shippingInfo.street_address &&
        shippingInfo.city &&
        shippingInfo.region &&
        shippingInfo.postal_code &&
        shippingInfo.country_id &&
        shippingInfo.email
      );
    };

    const validatePaymentDetails = () => {
      if (!paymentMethod) return false;
      const selectedMethod = paymentMethods.find(method => method.id === paymentMethod);
      if (!selectedMethod) return false;

      const methodName = selectedMethod.name.toLowerCase();
      if (methodName.includes('credit') || methodName.includes('debit')) {
        const cardNumberValid = /^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''));
        const expiryValid = /^(0[1-9]|1[0-2])\/([2-9][0-9])$/.test(paymentDetails.expiryDate);
        const cvvValid = /^\d{3,4}$/.test(paymentDetails.cvv);
        const [month, year] = paymentDetails.expiryDate.split('/').map(Number);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        const isNotExpired = !(year < currentYear || (year === currentYear && month < currentMonth));
        return (
          cardNumberValid &&
          expiryValid &&
          cvvValid &&
          isNotExpired &&
          paymentDetails.cardholderName
        );
      } else if (methodName.includes('gcash')) {
        return paymentDetails.gcashMobile && /^\d{11}$/.test(paymentDetails.gcashMobile);
      } else if (methodName.includes('cod') || methodName.includes('cash on delivery')) {
        return true;
      }
      return false;
    };

    useEffect(() => {
      const isValid = validateShippingInfo();
      if (isValid !== prevShippingInfoValid) {
        try {
          console.log('Calling onStepComplete for shippingInfo:', isValid);
          onStepComplete('shippingInfo', isValid);
          setPrevShippingInfoValid(isValid);
        } catch (err) {
          console.error('onStepComplete shippingInfo error:', err.message);
        }
      }
    }, [shippingInfo, onStepComplete, prevShippingInfoValid]);

    useEffect(() => {
      if (hasInteractedWithShipping !== prevShippingMethodValid) {
        try {
          console.log('Calling onStepComplete for shippingMethod:', hasInteractedWithShipping);
          onStepComplete('shippingMethod', hasInteractedWithShipping);
          setPrevShippingMethodValid(hasInteractedWithShipping);
        } catch (err) {
          console.error('onStepComplete shippingMethod error:', err.message);
        }
      }
    }, [hasInteractedWithShipping, onStepComplete, prevShippingMethodValid]);

    useEffect(() => {
      const isValid = validatePaymentDetails();
      if (isValid !== prevPaymentMethodValid) {
        try {
          console.log('Calling onStepComplete for paymentMethod:', isValid);
          onStepComplete('paymentMethod', isValid);
          setPrevPaymentMethodValid(isValid);
        } catch (err) {
          console.error('onStepComplete paymentMethod error:', err.message);
        }
      }
    }, [paymentMethod, paymentDetails, paymentMethods, onStepComplete, prevPaymentMethodValid]);

    const handleEditToggle = () => setIsEditing(!isEditing);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentInputChange = (e) => {
      const { name, value } = e.target;
      setPaymentDetails(prev => ({ ...prev, [name]: value }));

      if (name === 'cardNumber') {
        if (!/^\d{16}$/.test(value.replace(/\s/g, ''))) {
          setErrors(prev => ({ ...prev, cardNumber: 'Card number must be 16 digits' }));
        } else {
          setErrors(prev => ({ ...prev, cardNumber: '' }));
        }
      }
      if (name === 'expiryDate') {
        const regex = /^(0[1-9]|1[0-2])\/([2-9][0-9])$/;
        if (!regex.test(value)) {
          setErrors(prev => ({ ...prev, expiryDate: 'Enter valid date (MM/YY)' }));
        } else {
          const [month, year] = value.split('/').map(Number);
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear() % 100;
          const currentMonth = currentDate.getMonth() + 1;
          if (year < currentYear || (year === currentYear && month < currentMonth)) {
            setErrors(prev => ({ ...prev, expiryDate: 'Card has expired' }));
          } else {
            setErrors(prev => ({ ...prev, expiryDate: '' }));
          }
        }
      }
      if (name === 'cvv') {
        if (!/^\d{3,4}$/.test(value)) {
          setErrors(prev => ({ ...prev, cvv: 'CVV must be 3 or 4 digits' }));
        } else {
          setErrors(prev => ({ ...prev, cvv: '' }));
        }
      }
    };

    const handleCheckboxChange = (e) => {
      setSaveAddress(e.target.checked);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsEditing(false);

      if (saveAddress) {
        try {
          console.log('Saving address:', shippingInfo);
          await authAxios.post('/addresses', {
            recipient_name: shippingInfo.recipient_name,
            phone_number: shippingInfo.phone_number,
            country_id: shippingInfo.country_id,
            region: shippingInfo.region,
            city: shippingInfo.city,
            postal_code: shippingInfo.postal_code,
            street_address: shippingInfo.street_address,
            is_default: saveAddress,
          });
          setError(null);
        } catch (error) {
          console.error('Address save error:', error.response?.data, error.message);
          if (error.response?.status === 401) {
            setError('Unauthorized: Please log in again.');
            localStorage.removeItem('token');
          } else {
            setError(`Error saving address: ${error.message}`);
          }
        }
      }
    };

    const handleShippingMethodChange = (e) => {
      setShippingMethod(Number(e.target.value));
      setHasInteractedWithShipping(true);
    };

    try {
      console.log('Rendering CheckoutForm', {
        isLoading,
        error,
        shippingMethods,
        shippingMethod,
        hasInteractedWithShipping,
        countries,
        paymentMethods,
      });

      if (isLoading) {
        return <div className="loading">Loading checkout data...</div>;
      }

      if (error) {
        return <div className="error" style={{ color: 'red' }}>{error}</div>;
      }

      return (
        <div className="checkout-form">
          <div className="checkout-section">
            <div className="section-header">
              <span className="section-icon"><Package size={28} /></span>
              <h2>Shipping Information</h2>
            </div>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="shipping-form">
                <div className="form-row">
                  <div className="form-field full-width">
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full-width">
                    <input
                      type="text"
                      name="recipient_name"
                      value={shippingInfo.recipient_name}
                      onChange={handleInputChange}
                      placeholder="Recipient Name"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full-width">
                    <input
                      type="text"
                      name="phone_number"
                      value={shippingInfo.phone_number}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full-width">
                    <div className="select-wrapper">
                      <select
                        name="country_id"
                        value={shippingInfo.country_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>Select Country</option>
                        {Array.isArray(countries) && countries.length > 0 ? (
                          countries.map((country) => (
                            <option key={country.id} value={country.id}>
                              {country.name || 'Unknown'}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No countries available</option>
                        )}
                      </select>
                      <ChevronDown className="select-icon" size={18} />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <input
                      type="text"
                      name="region"
                      value={shippingInfo.region}
                      onChange={handleInputChange}
                      placeholder="Region"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full-width">
                    <input
                      type="text"
                      name="postal_code"
                      value={shippingInfo.postal_code}
                      onChange={handleInputChange}
                      placeholder="Postal Code"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full-width">
                    <textarea
                      name="street_address"
                      value={shippingInfo.street_address}
                      onChange={handleInputChange}
                      placeholder="Street Address (Apt, Suite, etc.)"
                      className="street-address-input"
                      rows="3"
                      required
                    />
                  </div>
                </div>
                <div className="form-row checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={handleCheckboxChange}
                    />
                    Save this address for future orders
                  </label>
                </div>
                <button type="submit">Save</button>
              </form>
            ) : (
              <div className="shipping-info">
                <div className="info-row">
                  <p>{shippingInfo.recipient_name || 'N/A'}</p>
                  <p>{shippingInfo.phone_number || 'N/A'}</p>
                </div>
                <p><strong>Email:</strong> {shippingInfo.email || 'N/A'}</p>
                <p>{shippingInfo.street_address || 'N/A'}</p>
                <div className="info-row">
                  <p>{[shippingInfo.city, shippingInfo.region, shippingInfo.postal_code].filter(Boolean).join(', ') || 'N/A'}</p>
                  <p>{countries.find(country => country.id === Number(shippingInfo.country_id))?.name || 'N/A'}</p>
                </div>
                <button className="edit-btn" onClick={handleEditToggle}>
                  <Pencil size={16} /> Edit Address
                </button>
              </div>
            )}
          </div>

          <div className="checkout-section">
            <div className="section-header">
              <span className="section-icon"><Truck size={28} /></span>
              <h2>Shipping Method</h2>
            </div>
            <div className="shipping-options">
              {Array.isArray(shippingMethods) && shippingMethods.length > 0 && shippingMethods.every(method => method && method.id && method.name) ? (
                shippingMethods.map(method => (
                  <label key={method.id} className={shippingMethod === method.id ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={handleShippingMethodChange}
                    />
                    <div className="shipping-option-details">
                      <span className="option-title">{method.name || 'N/A'}</span>
                      <span className="option-description">{method.description || 'No description'}</span>
                    </div>
                    <span className="option-price">${Number(method.fee || 0).toFixed(2)}</span>
                  </label>
                ))
              ) : (
                <p>No valid shipping methods available. Please contact support.</p>
              )}
            </div>
          </div>

          <div className="checkout-section">
            <div className="section-header">
              <span className="section-icon"><CreditCard size={28} /></span>
              <h2>Payment Method</h2>
            </div>
            <div className="payment-options modern">
              <div className="payment-tabs">
                {Array.isArray(paymentMethods) && paymentMethods.length > 0 && paymentMethods.every(method => method && method.id && method.name) ? (
                  paymentMethods.map(method => (
                    <button
                      key={method.id}
                      className={`payment-tab ${paymentMethod === method.id ? 'active' : ''}`}
                      onClick={() => setPaymentMethod(Number(method.id))}
                    >
                      {method.name.toLowerCase().includes('credit') || method.name.toLowerCase().includes('debit') ? (
                        <CreditCard size={18} />
                      ) : method.name.toLowerCase().includes('gcash') ? (
                        <Phone size={18} />
                      ) : (
                        <Package size={18} />
                      )}
                      {method.name || 'N/A'}
                    </button>
                  ))
                ) : (
                  <p>No payment methods available. Please contact support.</p>
                )}
              </div>

              {Array.isArray(paymentMethods) && paymentMethods.map(method => {
                if (!method || paymentMethod !== method.id) return null;
                const methodName = method.name?.toLowerCase() || '';

                if (methodName.includes('credit') || methodName.includes('debit')) {
                  return (
                    <div key={method.id} className="payment-details-form">
                      <div className="form-group">
                        <label htmlFor="cardholderName">Name on Card</label>
                        <input
                          type="text"
                          id="cardholderName"
                          name="cardholderName"
                          value={paymentDetails.cardholderName}
                          onChange={handlePaymentInputChange}
                          placeholder="Enter card name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentDetails.cardNumber}
                          onChange={handlePaymentInputChange}
                          placeholder="Enter card number"
                        />
                        {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiryDate">Expiry Date</label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentDetails.expiryDate}
                            onChange={handlePaymentInputChange}
                            placeholder="MM/YY"
                          />
                          {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentDetails.cvv}
                            onChange={handlePaymentInputChange}
                            placeholder="***"
                          />
                          {errors.cvv && <span className="error">{errors.cvv}</span>}
                        </div>
                      </div>
                      <button type="button" className="save-payment-btn">Save Payment Details</button>
                    </div>
                  );
                } else if (methodName.includes('gcash')) {
                  return (
                    <div key={method.id} className="payment-details-form">
                      <div className="form-group">
                        <label htmlFor="gcashMobile">GCash Mobile Number</label>
                        <input
                          type="tel"
                          id="gcashMobile"
                          name="gcashMobile"
                          value={paymentDetails.gcashMobile}
                          onChange={handlePaymentInputChange}
                          placeholder="09XX XXX XXXX"
                        />
                      </div>
                    </div>
                  );
                } else if (methodName.includes('cod') || methodName.includes('cash on delivery')) {
                  return (
                    <div key={method.id} className="payment-details-form cod-message">
                      <p>Pay with cash upon delivery.</p>
                      <p>Please have the exact amount ready for our delivery personnel.</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      );
    } catch (err) {
      setRenderError(err.message);
      return (
        <div style={{ color: 'red', padding: '20px' }}>
          <h1>Rendering Error</h1>
          <p>{err.message || 'An error occurred while rendering the checkout form'}</p>
        </div>
      );
    }
  };

  export default CheckoutForm;