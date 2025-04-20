import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const EditUserModal = ({ isOpen, onClose, userId, token, onUserUpdated }) => {
  const initialFormData = {
    email: '',
    role: 'customer',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    gender: '',
    date_of_birth: '',
    profile_pic: null,
    status: 'active',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
    }
  }, [isOpen, userId]);

  const fetchUserData = async () => {
    setFetchingUser(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = res.data.data;
      console.log('Fetched user data:', userData);
      setFormData({
        email: userData.email || '',
        role: userData.role || 'customer',
        first_name: userData.first_name || '',
        middle_name: userData.middle_name || '',
        last_name: userData.last_name || '',
        suffix: userData.suffix || '',
        gender: userData.gender || '',
        date_of_birth: userData.date_of_birth || '',
        profile_pic: null,
        status: userData.status || 'active',
      });

      if (userData.profile_pic) {
        const imageUrl = `http://localhost:8000/storage/${userData.profile_pic}`;
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => setPreviewImage(imageUrl);
        img.onerror = () => {
          console.error('Failed to load profile picture:', imageUrl);
          setPreviewImage(null);
        };
      } else {
        setPreviewImage(null);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err.response?.data);
      setErrors({ general: 'Failed to load user data. Please try again.' });
    } finally {
      setFetchingUser(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile_pic: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, profile_pic: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = ['The first name field is required.'];
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = ['The last name field is required.'];
    }
    if (!formData.email.trim()) {
      newErrors.email = ['The email field is required.'];
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('middle_name', formData.middle_name || '');
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('suffix', formData.suffix || '');
      formDataToSend.append('gender', formData.gender || '');
      formDataToSend.append('date_of_birth', formData.date_of_birth || '');
      formDataToSend.append('status', formData.status);
      if (formData.profile_pic) {
        formDataToSend.append('profile_pic', formData.profile_pic);
      }
      formDataToSend.append('_method', 'PUT');

      console.log('Sending update data:', Object.fromEntries(formDataToSend));

      const res = await axios.post(
        `http://localhost:8000/api/users/${userId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      console.log('User updated response:', res.data);
      if (res.data.message === 'User updated successfully' && res.data.data) {
        setSuccessMessage('User updated successfully.');
        onUserUpdated(res.data.data);
        setTimeout(onClose, 1500);
      } else {
        throw new Error('Unexpected response: ' + JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to update user:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update user. Please try again.';
      setErrors({
        general: errorMessage,
        ...(err.response?.status === 422 ? err.response.data.errors : {}),
      });
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Edit User</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {fetchingUser ? (
          <div className="loading-spinner">Loading user data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            {errors.general && (
              <div className="form-error" style={{ color: 'red', marginBottom: '10px', fontWeight: 'bold', padding: '10px', background: '#f8d7da', borderRadius: '4px' }}>
                {errors.general}
              </div>
            )}
            {successMessage && (
              <div className="form-success" style={{ color: 'green', marginBottom: '10px', fontWeight: 'bold', padding: '10px', background: '#d4edda', borderRadius: '4px' }}>
                {successMessage}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              />
              {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className={`form-control ${errors.role ? 'is-invalid' : ''}`}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
              {errors.role && <div className="invalid-feedback">{errors.role[0]}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                />
                {errors.first_name && <div className="invalid-feedback">{errors.first_name[0]}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="middle_name">Middle Name</label>
                <input
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  className={`form-control ${errors.middle_name ? 'is-invalid' : ''}`}
                />
                {errors.middle_name && <div className="invalid-feedback">{errors.middle_name[0]}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                />
                {errors.last_name && <div className="invalid-feedback">{errors.last_name[0]}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="suffix">Suffix</label>
                <input
                  type="text"
                  id="suffix"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                  className={`form-control ${errors.suffix ? 'is-invalid' : ''}`}
                />
                {errors.suffix && <div className="invalid-feedback">{errors.suffix[0]}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`form-control ${errors.gender ? 'is-invalid' : ''}`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <div className="invalid-feedback">{errors.gender[0]}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className={`form-control ${errors.date_of_birth ? 'is-invalid' : ''}`}
                />
                {errors.date_of_birth && <div className="invalid-feedback">{errors.date_of_birth[0]}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profile_pic">Profile Picture</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="profile_pic"
                  name="profile_pic"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg"
                  className={`file-input ${errors.profile_pic ? 'is-invalid' : ''}`}
                />
                <label htmlFor="profile_pic" className="file-input-label">
                  Choose File
                </label>
                <span className="file-name">
                  {formData.profile_pic ? formData.profile_pic.name : 'No new file chosen'}
                </span>
              </div>
              {errors.profile_pic && <div className="invalid-feedback">{errors.profile_pic[0]}</div>}
              {previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Preview" className="preview-image" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`form-control ${errors.status ? 'is-invalid' : ''}`}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              {errors.status && <div className="invalid-feedback">{errors.status[0]}</div>}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditUserModal;