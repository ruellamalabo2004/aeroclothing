import React, { useState } from 'react';
import { Pencil, CreditCard, Package, Truck, ChevronDown } from 'lucide-react';

const CheckoutForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234 567 8900',
    streetAddress: '123 Main St',
    city: 'New York',
    region: 'NY',
    postalCode: '10001',
    country: 'USA',
    email: 'john@example.com',
  });
  const [paymentMethod, setPaymentMethod] = useState('debit');
  const [shippingMethod, setShippingMethod] = useState('standard');

  const countries = [
    'USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'India', 'China', 'Brazil', 'Japan'
  ];

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    setSaveAddress(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // Optionally, save the address if saveAddress is true (logic can be added here)
  };

  return (
    <div className="checkout-form">
      <div className="checkout-section">
        <div className="section-header">
          <span className="section-icon"><Package size={28} /></span>
          <h2>Shipping Information</h2>
          <button className="edit-btn" onClick={handleEditToggle}>
            <Pencil size={16} /> Edit Address
          </button>
        </div>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="shipping-form">
            <div className="form-row">
              <div className="form-field">
                <input
                  type="text"
                  name="firstName"
                  value={shippingInfo.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                />
              </div>
              <div className="form-field">
                <input
                  type="text"
                  name="lastName"
                  value={shippingInfo.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full-width">
                <input
                  type="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full-width">
                <input
                  type="text"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full-width">
                <div className="select-wrapper">
                  <select
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
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
                />
              </div>
              <div className="form-field">
                <input
                  type="text"
                  name="region"
                  value={shippingInfo.region}
                  onChange={handleInputChange}
                  placeholder="Region"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full-width">
                <input
                  type="text"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleInputChange}
                  placeholder="Zip Code"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full-width">
                <textarea
                  name="streetAddress"
                  value={shippingInfo.streetAddress}
                  onChange={handleInputChange}
                  placeholder="Street Address (Apt, Suite, etc.)"
                  className="street-address-input"
                  rows="3"
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
              <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
              <p>{shippingInfo.phone}</p>
            </div>
            <p>{shippingInfo.streetAddress}</p>
            <div className="info-row">
              <p>{shippingInfo.city}, {shippingInfo.region}, {shippingInfo.postalCode}</p>
              <p>{shippingInfo.country}</p>
            </div>
            <p>{shippingInfo.email}</p>
          </div>
        )}
      </div>

      <div className="checkout-section">
        <div className="section-header">
          <span className="section-icon"><CreditCard size={28} /></span>
          <h2>Payment Method</h2>
        </div>
        <div className="payment-options">
          <div className="payment-grid">
            <label className={paymentMethod === 'debit' ? 'selected' : ''}>
              <input
                type="radio"
                name="payment"
                value="debit"
                checked={paymentMethod === 'debit'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Debit/Credit Card
            </label>
            <label className={paymentMethod === 'paypal' ? 'selected' : ''}>
              <input
                type="radio"
                name="payment"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              PayPal
            </label>
            <label className={paymentMethod === 'cod' ? 'selected' : ''}>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery (COD)
            </label>
            <label className={paymentMethod === 'gcash' ? 'selected' : ''}>
              <input
                type="radio"
                name="payment"
                value="gcash"
                checked={paymentMethod === 'gcash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              GCash
            </label>
          </div>
        </div>
      </div>

      <div className="checkout-section">
        <div className="section-header">
          <span className="section-icon"><Truck size={28} /></span>
          <h2>Shipping Method</h2>
        </div>
        <div className="shipping-options">
          <label className={shippingMethod === 'standard' ? 'selected' : ''}>
            <input
              type="radio"
              name="shipping"
              value="standard"
              checked={shippingMethod === 'standard'}
              onChange={(e) => setShippingMethod(e.target.value)}
            />
            <div className="shipping-option-details">
              <span className="option-title">Standard Shipping</span>
              <span className="option-description">Estimated 5-7 business days</span>
            </div>
            <span className="option-price">$5.00</span>
          </label>
          <label className={shippingMethod === 'express' ? 'selected' : ''}>
            <input
              type="radio"
              name="shipping"
              value="express"
              checked={shippingMethod === 'express'}
              onChange={(e) => setShippingMethod(e.target.value)}
            />
            <div className="shipping-option-details">
              <span className="option-title">Express Shipping</span>
              <span className="option-description">Estimated 3-5 business days</span>
            </div>
            <span className="option-price">$15.00</span>
          </label>
          <label className={shippingMethod === 'priority' ? 'selected' : ''}>
            <input
              type="radio"
              name="shipping"
              value="priority"
              checked={shippingMethod === 'priority'}
              onChange={(e) => setShippingMethod(e.target.value)}
            />
            <div className="shipping-option-details">
              <span className="option-title">Priority Shipping</span>
              <span className="option-description">Estimated 1-3 days</span>
            </div>
            <span className="option-price">$25.00</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;