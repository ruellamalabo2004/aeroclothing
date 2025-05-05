import React, { useState } from 'react';
import { Pencil, Archive, Check, X } from 'lucide-react';
import ProfileAddressModal from './ProfileAddressModal';

const ProfileAddress = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'John Doe',
      address_line1: '123 Main Street, Apt 4B',
      address_line2: '',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      is_default: true,
      isEditing: false,
    },
    {
      id: 2,
      name: 'John Doe',
      address_line1: '456 Oak Avenue',
      address_line2: '',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'United States',
      phone: '+1 (555) 987-6543',
      is_default: false,
      isEditing: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleOpenModal = () => {
    setFormData({}); // Reset form data for a new address
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddAddress = (newAddress) => {
    setAddresses((prevAddresses) => [
      ...prevAddresses,
      {
        ...newAddress,
        id: prevAddresses.length + 1, // Simple ID generation
        name: `${newAddress.first_name} ${newAddress.last_name}`, // Combine first and last name
        address_line1: newAddress.street_name,
        address_line2: newAddress.address_line2 || '', // Use provided address_line2 or empty string
        isEditing: false,
        is_default: prevAddresses.length === 0, // Set as default if it's the first address
      },
    ]);
    setIsModalOpen(false);
  };

  const toggleEditMode = (addressId) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((addr) => {
        if (addr.id === addressId) {
          return { ...addr, isEditing: !addr.isEditing };
        } else {
          return { ...addr, isEditing: false }; // Close any other open edit forms
        }
      })
    );
  };

  const handleInputChange = (addressId, field, value) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((addr) =>
        addr.id === addressId ? { ...addr, [field]: value } : addr
      )
    );
  };

  const handleSetDefault = (addressId) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((addr) => ({
        ...addr,
        is_default: addr.id === addressId,
      }))
    );
  };

  const handleArchive = (addressId) => {
    setAddresses((prevAddresses) =>
      prevAddresses.filter((addr) => addr.id !== addressId)
    );
  };

  return (
    <div className="profile-address">
      <div className="profile-address-section">
        <div className="profile-address-header">
          <h2 className="profile-address-title">My Addresses</h2>
          <button className="profile-address-add-button" onClick={handleOpenModal}>
            + Add New Address
          </button>
        </div>
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div 
              className={`profile-address-card ${address.is_default ? 'is-default' : 'not-default'}`} 
              key={address.id}
            >
              {address.isEditing ? (
                <div className="profile-address-edit-form">
                  <div className="profile-address-form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={address.name}
                      onChange={(e) => handleInputChange(address.id, 'name', e.target.value)}
                      className="profile-address-input"
                    />
                  </div>
                  <div className="profile-address-form-group">
                    <label>Address Line 1</label>
                    <input
                      type="text"
                      value={address.address_line1}
                      onChange={(e) => handleInputChange(address.id, 'address_line1', e.target.value)}
                      className="profile-address-input"
                    />
                  </div>
                  <div className="profile-address-form-group">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      value={address.address_line2 || ''}
                      onChange={(e) => handleInputChange(address.id, 'address_line2', e.target.value)}
                      className="profile-address-input"
                    />
                  </div>
                  <div className="profile-address-form-row">
                    <div className="profile-address-form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => handleInputChange(address.id, 'city', e.target.value)}
                        className="profile-address-input"
                      />
                    </div>
                    <div className="profile-address-form-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => handleInputChange(address.id, 'state', e.target.value)}
                        className="profile-address-input"
                      />
                    </div>
                    <div className="profile-address-form-group">
                      <label>ZIP</label>
                      <input
                        type="text"
                        value={address.zip}
                        onChange={(e) => handleInputChange(address.id, 'zip', e.target.value)}
                        className="profile-address-input"
                      />
                    </div>
                  </div>
                  <div className="profile-address-form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => handleInputChange(address.id, 'country', e.target.value)}
                      className="profile-address-input"
                    />
                  </div>
                  <div className="profile-address-form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={address.phone}
                      onChange={(e) => handleInputChange(address.id, 'phone', e.target.value)}
                      className="profile-address-input"
                    />
                  </div>
                  <div className="profile-address-edit-actions">
                    <button 
                      className="profile-address-action-button profile-address-save"
                      onClick={() => toggleEditMode(address.id)}
                    >
                      <Check size={16} /> Save
                    </button>
                    <button 
                      className="profile-address-action-button profile-address-cancel"
                      onClick={() => toggleEditMode(address.id)}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="profile-address-details">
                    <h3 className="profile-address-name">{address.name}</h3>
                    <p className="profile-address-line">{address.address_line1}</p>
                    {address.address_line2 && (
                      <p className="profile-address-line">{address.address_line2}</p>
                    )}
                    <p className="profile-address-line">{address.city}, {address.state} {address.zip}</p>
                    <p className="profile-address-line">{address.country}</p>
                    <p className="profile-address-phone">{address.phone}</p>
                  </div>
                  {address.is_default && (
                    <span className="profile-address-default">✓ Default</span>
                  )}
                  <div className="profile-address-actions">
                    {!address.is_default && (
                      <button 
                        className="profile-address-action-button" 
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <Check size={16} /> Set as Default
                      </button>
                    )}
                    <button 
                      className="profile-address-action-button profile-address-edit"
                      onClick={() => toggleEditMode(address.id)}
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button 
                      className="profile-address-action-button profile-address-delete"
                      onClick={() => handleArchive(address.id)}
                    >
                      <Archive size={16} /> Archive
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="profile-address-no-address">No addresses found.</p>
        )}
      </div>
      {isModalOpen && (
        <ProfileAddressModal onClose={handleCloseModal} onAddAddress={handleAddAddress} />
      )}
    </div>
  );
};

export default ProfileAddress;
