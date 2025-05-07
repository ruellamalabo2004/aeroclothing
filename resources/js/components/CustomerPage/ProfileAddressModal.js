
import React, { useState } from 'react';

const ProfileAddressModal = ({ onClose, onAddAddress, countries }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    country_id: '',
    region: '',
    city: '',
    postal_code: '',
    street_address: '',
    is_default: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddAddress(formData);
  };

  return (
    <div className="profile-address-modal-overlay">
      <div className="profile-address-modal">
        <div className="profile-address-modal-header">
          <h2 className="profile-address-modal-title">Add New Address</h2>
          <button className="profile-address-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="profile-address-modal-form" onSubmit={handleSubmit}>
          <div className="profile-address-modal-form-row">
            <div className="profile-address-modal-form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="profile-address-modal-input"
              />
            </div>
            <div className="profile-address-modal-form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="profile-address-modal-input"
              />
            </div>
          </div>
          <div className="profile-address-modal-form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="profile-address-modal-input"
            />
          </div>
          <div className="profile-address-modal-form-row">
            <div className="profile-address-modal-form-group">
              <label>Country</label>
              <select
                name="country_id"
                value={formData.country_id}
                onChange={handleChange}
                required
                className="profile-address-modal-input"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="profile-address-modal-form-group">
              <label>Province/Region</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className="profile-address-modal-input"
              />
            </div>
          </div>
          <div className="profile-address-modal-form-row">
            <div className="profile-address-modal-form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="profile-address-modal-input"
              />
            </div>
            <div className="profile-address-modal-form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                required
                className="profile-address-modal-input"
              />
            </div>
          </div>
          <div className="profile-address-modal-form-group">
            <label>Street Address</label>
            <textarea
              name="street_address"
              value={formData.street_address}
              onChange={handleChange}
              required
              className="profile-address-modal-input profile-address-modal-textarea"
              rows="3"
            ></textarea>
          </div>
          <div className="profile-address-modal-form-group profile-address-modal-checkbox">
            <label>
              <input
                type="checkbox"
                name="is_default"
                checked={formData.is_default}
                onChange={handleChange}
              />
              Set as default shipping address
            </label>
          </div>
          <div className="profile-address-modal-actions">
            <button
              type="button"
              className="profile-address-modal-button profile-address-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="profile-address-modal-button profile-address-modal-submit"
            >
              Add Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileAddressModal;