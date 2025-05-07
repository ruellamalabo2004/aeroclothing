import React, { useState, useEffect } from 'react';
import { Pencil, Archive, Check, X } from 'lucide-react';
import axios from 'axios';
import ProfileAddressModal from './ProfileAddressModal';

const ProfileAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState(null);

  // Axios instance for authenticated requests
  const authAxios = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  // Axios instance for public requests
  const publicAxios = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
  });

  // Fetch addresses and countries on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await authAxios.get('/addresses');
        setAddresses(response.data.map(addr => ({
          ...addr,
          isEditing: false
        })));
        setError(null);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setError('Unauthorized: Please log in again.');
          localStorage.removeItem('token');
          // Optionally redirect to login page
          // window.location.href = '/login';
        } else {
          setError('Error fetching addresses: ' + error.message);
        }
      }
    };

    const fetchCountries = async () => {
      try {
        const response = await publicAxios.get('/countries');
        setCountries(response.data);
      } catch (error) {
        setError('Error fetching countries: ' + error.message);
      }
    };

    fetchAddresses();
    fetchCountries();
  }, []);

  const handleOpenModal = () => {
    setFormData({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddAddress = async (newAddress) => {
    try {
      const response = await authAxios.post('/addresses', {
        recipient_name: `${newAddress.first_name} ${newAddress.last_name}`,
        phone_number: newAddress.phone_number,
        country_id: newAddress.country_id,
        region: newAddress.region,
        city: newAddress.city,
        postal_code: newAddress.postal_code,
        street_address: newAddress.street_address,
        is_default: newAddress.is_default || addresses.length === 0
      });
      setAddresses((prevAddresses) => [
        ...prevAddresses,
        { ...response.data, isEditing: false }
      ]);
      setIsModalOpen(false);
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Unauthorized: Please log in again.');
        localStorage.removeItem('token');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        setError('Error adding address: ' + error.message);
      }
    }
  };

  const toggleEditMode = (addressId) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((addr) => {
        if (addr.id === addressId) {
          return { ...addr, isEditing: !addr.isEditing };
        } else {
          return { ...addr, isEditing: false };
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

  const handleUpdateAddress = async (addressId) => {
    try {
      const address = addresses.find(addr => addr.id === addressId);
      await authAxios.put(`/addresses/${addressId}`, {
        recipient_name: address.recipient_name,
        phone_number: address.phone_number,
        country_id: address.country_id,
        region: address.region,
        city: address.city,
        postal_code: address.postal_code,
        street_address: address.street_address,
        is_default: address.is_default
      });
      toggleEditMode(addressId);
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Unauthorized: Please log in again.');
        localStorage.removeItem('token');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        setError('Error updating address: ' + error.message);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await authAxios.patch(`/addresses/${addressId}/set-default`);
      setAddresses((prevAddresses) =>
        prevAddresses.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId
        }))
      );
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Unauthorized: Please log in again.');
        localStorage.removeItem('token');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        setError('Error setting default address: ' + error.message);
      }
    }
  };

  const handleArchive = async (addressId) => {
    try {
      await authAxios.delete(`/addresses/${addressId}`);
      setAddresses((prevAddresses) =>
        prevAddresses.filter((addr) => addr.id !== addressId)
      );
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Unauthorized: Please log in again.');
        localStorage.removeItem('token');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        setError('Error archiving address: ' + error.message);
      }
    }
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
        {error && <p className="profile-address-error" style={{ color: 'red' }}>{error}</p>}
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
                      value={address.recipient_name}
                      onChange={(e) => handleInputChange(address.id, 'recipient_name', e.target.value)}
                      className="profile-address-input"
                    />
                  </div>
                  <div className="profile-address-form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      value={address.street_address}
                      onChange={(e) => handleInputChange(address.id, 'street_address', e.target.value)}
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
                      <label>Region</label>
                      <input
                        type="text"
                        value={address.region}
                        onChange={(e) => handleInputChange(address.id, 'region', e.target.value)}
                        className="profile-address-input"
                      />
                    </div>
                    <div className="profile-address-form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        value={address.postal_code}
                        onChange={(e) => handleInputChange(address.id, 'postal_code', e.target.value)}
                        className="profile-address-input"
                      />
                    </div>
                  </div>
                  <div className="profile-address-form-group">
                    <label>Country</label>
                    <select
                      value={address.country_id}
                      onChange={(e) => handleInputChange(address.id, 'country_id', e.target.value)}
                      className="profile-address-input"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="profile-address-form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={address.phone_number}
                      onChange={(e) => handleInputChange(address.id, 'phone_number', e.target.value)}
                      className="profile-address-input"
                    />
                  </div>
                  <div className="profile-address-edit-actions">
                    <button 
                      className="profile-address-action-button profile-address-save"
                      onClick={() => handleUpdateAddress(address.id)}
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
                    <h3 className="profile-address-name">{address.recipient_name}</h3>
                    <p className="profile-address-line">{address.street_address}</p>
                    <p className="profile-address-line">{address.city}, {address.region} {address.postal_code}</p>
                    <p className="profile-address-line">
                      {countries.find(c => c.id === address.country_id)?.name || 'Unknown Country'}
                    </p>
                    <p className="profile-address-phone">{address.phone_number}</p>
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
        <ProfileAddressModal 
          onClose={handleCloseModal} 
          onAddAddress={handleAddAddress}
          countries={countries}
        />
      )}
    </div>
  );
};

export default ProfileAddress;
