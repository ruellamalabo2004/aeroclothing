import React from 'react';
import '../../../sass/AddressFormModal.scss';

const AddressFormModal = ({
  showAddressForm,
  setShowAddressForm,
  selectedAddress,
  setSelectedAddress,
  formData,
  setFormData,
  handleInputChange,
  handleAddressSubmit,
  error, // Add error prop to display API errors
}) => {
  if (!showAddressForm) return null;

  const handleCancel = () => {
    setShowAddressForm(false);
    setSelectedAddress(null);
    setFormData({
      first_name: '',
      last_name: '',
      phone_number: '',
      country: '',
      province: '',
      city: '',
      postal_code: '',
      street_address: ''
    });
  };

  return (
    <div className="address-form-modal">
      <div className="modal-content">
        <h2>{selectedAddress ? 'Edit Address' : 'Add New Address'}</h2>
        {error && <div className="error-message">{error}</div>} {/* Display errors */}
        <form onSubmit={handleAddressSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Street Name, Building, House No.</label>
            <textarea
              name="street_address"
              value={formData.street_address}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Enter your street name, building, and house number (e.g., 123 Main St, Apt 4B)"
            />
            <p className="form-description">
              Please provide detailed address information including street name, building name or number, and house/apartment number if applicable.
            </p>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;