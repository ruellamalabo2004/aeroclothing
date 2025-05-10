import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import Success from '../LoginContent/Success'; // Assuming this is the correct path

const OrdersModal = ({ isOpen, onClose, orderId, token, onOrderUpdated }) => {
  const initialFormData = {
    orderId: '',
    totalAmount: '',
    status: 'Pending',
    datePlaced: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderData();
    }
  }, [isOpen, orderId]);

  const fetchOrderData = async () => {
    setFetchingOrder(true);
    try {
      const res = await axios.get(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API Response for Order:', res);
      const orderData = res.data;
      
      if (!orderData) {
        throw new Error('No order data returned from API');
      }

      console.log('Fetched order data:', orderData);
      setFormData({
        orderId: orderData.id || '',
        totalAmount: orderData.total_amount || '',
        status: orderData.status || 'Pending', // Keep original case
        datePlaced: orderData.order_date || '',
      });
    } catch (err) {
      console.error('Failed to fetch order data:', err);
      console.error('Error details:', err.response?.data || err.message);
      setErrors({ general: 'Failed to load order data. Please try again.' });
    } finally {
      setFetchingOrder(false);
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.status.trim()) {
      newErrors.status = ['The status field is required.'];
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

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('status', formData.status); // Send status as is, no need to transform
      formDataToSend.append('_method', 'PUT');

      const res = await axios.post(
        `/api/orders/${orderId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      console.log('Order updated response:', res.data);
      if (res.data.status) {
        setSuccessMessage('Order updated successfully!');
        setIsSuccessVisible(true);
        onOrderUpdated(res.data);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error('Unexpected response: ' + JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to update order:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update order. Please try again.';
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
    <div className="orders-modal__overlay">
      <div className="orders-modal">
        <div className="orders-modal__header">
          <h3 className="orders-modal__title">Edit Order</h3>
          <button className="orders-modal__close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {fetchingOrder ? (
          <div className="loading-spinner">Loading order data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="orders-modal__form">
            {errors.general && (
              <div className="form-error" style={{ color: 'red', marginBottom: '10px', fontWeight: 'bold', padding: '10px', background: '#f8d7da', borderRadius: '4px' }}>
                {errors.general}
              </div>
            )}
            <Success
              message={successMessage}
              isVisible={isSuccessVisible}
              onClose={() => setIsSuccessVisible(false)}
            />

            <div className="orders-modal__field">
              <label htmlFor="orderId">Order ID</label>
              <input
                type="text"
                id="orderId"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                readOnly
                className="orders-modal__field-input"
              />
            </div>

            <div className="orders-modal__field">
              <label htmlFor="totalAmount">Total Amount</label>
              <input
                type="text"
                id="totalAmount"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                readOnly
                className="orders-modal__field-input"
              />
            </div>

            <div className="orders-modal__field">
              <label htmlFor="datePlaced">Date Placed</label>
              <input
                type="text"
                id="datePlaced"
                name="datePlaced"
                value={formData.datePlaced}
                onChange={handleChange}
                readOnly
                className="orders-modal__field-input"
              />
            </div>

            <div className="orders-modal__field">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`orders-modal__field-input ${errors.status ? 'is-invalid' : ''}`}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivering">Delivering</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
                <option value="Returned">Returned</option>
              </select>
              {errors.status && <div className="orders-modal__error">{errors.status[0]}</div>}
            </div>

            <div className="orders-modal__actions">
              <button
                type="button"
                className="orders-modal__button orders-modal__button--secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="orders-modal__button orders-modal__button--primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrdersModal;