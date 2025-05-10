import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import RateModal from './RateModal';
import { Star } from 'lucide-react';

const getImageUrl = (url) => {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http')) return url;
  // If the url already starts with /storage, return as is
  if (url.startsWith('/storage')) return url;
  // Otherwise, assume it's a filename and prepend /storage/products/
  return `/storage/products/${url.replace(/^products[\/]/, '')}`;
};

const ProfileOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [cancelling, setCancelling] = useState({});
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [currentProductName, setCurrentProductName] = useState('');
  const [processingAction, setProcessingAction] = useState({});
  const [productReviews, setProductReviews] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to initialize from localStorage for immediate UI update
        try {
          const savedReviews = localStorage.getItem('reviewedProducts');
          if (savedReviews) {
            setProductReviews(JSON.parse(savedReviews));
          }
        } catch (e) {
          console.error('Error loading reviews from localStorage:', e);
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please login.');
          return;
        }

        const response = await axios.get('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('API Response:', response.data);

        if (response.data) {
          setOrders(response.data);
          
          // Collect all product IDs from completed orders
          const productIds = [];
          response.data.forEach(order => {
            if (order.status === 'Completed' && Array.isArray(order.order_details)) {
              order.order_details.forEach(item => {
                if (item.product_id) {
                  productIds.push({
                    orderId: order.id,
                    productId: item.product_id
                  });
                }
              });
            }
          });
          
          // Fetch review status for these product IDs
          if (productIds.length > 0) {
            await checkReviewStatus(productIds, token);
          }
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  
  // Check if products in completed orders have been reviewed by the user
  const checkReviewStatus = async (productItems, token) => {
    try {
      console.log('Checking review status for products:', productItems);
      
      // Get user reviews
      const response = await axios.get('/api/reviews/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('User reviews response:', response.data);
      
      const userReviews = response.data || [];
      
      // Create a map of reviewed products by order
      const reviewedMap = {};
      
      productItems.forEach(item => {
        const key = `${item.orderId}-${item.productId}`;
        const isReviewed = userReviews.some(
          review => Number(review.product_id) === Number(item.productId) && 
                   Number(review.order_id) === Number(item.orderId)
        );
        
        console.log(`Product ${item.productId} in order ${item.orderId} reviewed: ${isReviewed}`);
        reviewedMap[key] = isReviewed;
      });
      
      // Also store the reviewed status in localStorage for persistence
      const localReviewedMap = { ...reviewedMap };
      localStorage.setItem('reviewedProducts', JSON.stringify(localReviewedMap));
      
      setProductReviews(reviewedMap);
    } catch (err) {
      console.error('Error fetching review status:', err);
      console.error('Error details:', err.response?.data);
      
      // Try to recover from localStorage if API fails
      try {
        const savedReviews = localStorage.getItem('reviewedProducts');
        if (savedReviews) {
          setProductReviews(JSON.parse(savedReviews));
        }
      } catch (e) {
        console.error('Error recovering from localStorage:', e);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  const formatPrice = (price) => {
    try {
      return parseFloat(price).toFixed(2);
    } catch (err) {
      console.error('Error formatting price:', err);
      return '0.00';
    }
  };

  const handleImageLoad = (imageId) => {
    console.log('Image loaded:', imageId);
    setLoadedImages(prev => ({
      ...prev,
      [imageId]: true
    }));
  };

  const handleImageError = (imageId, imageUrl) => {
    console.error('Image failed to load:', imageId, imageUrl);
    setLoadedImages(prev => ({
      ...prev,
      [imageId]: false
    }));
  };

  // Cancel order function
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(prev => ({ ...prev, [orderId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/orders/${orderId}/cancel`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Check if the response was successful
      if (response.status === 200) {
        // Update the order status in the UI
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: 'Cancelled' } : order
          )
        );
        // Show success message
        alert('Order has been cancelled successfully!');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Order received function
  const handleOrderReceived = async (orderId) => {
    setProcessingAction(prev => ({ ...prev, [orderId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/orders/${orderId}/received`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Check if the response was successful
      if (response.status === 200) {
        // Update the order status in the UI
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: 'Completed' } : order
          )
        );
        // Show success message
        alert('Order has been marked as received successfully!');
      }
    } catch (err) {
      console.error('Error marking order as received:', err);
      alert(err.response?.data?.message || 'Failed to mark order as received. Please try again.');
    } finally {
      setProcessingAction(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Open rate modal for the selected product
  const openRateModal = (orderId, productId, productName) => {
    console.log(`Opening rate modal for product ${productId} in order ${orderId}`);
    setCurrentOrderId(orderId);
    setCurrentProductId(productId);
    setCurrentProductName(productName);
    setRateModalOpen(true);
  };

  // Handle rating submission
  const handleRatingSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Add order and product IDs to the formData
      formData.append('product_id', currentProductId);
      formData.append('order_id', currentOrderId);
      
      console.log('Submitting review with formData. Product ID:', currentProductId, 'Order ID:', currentOrderId);
      
      // Debug: Print form data
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      // Use the store review endpoint directly
      const response = await axios.post('/api/reviews', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Rating response:', response);
      
      // Check if the response was successful or if the product was already reviewed
      if (response.status === 200 || response.status === 201 || response.status === 409) {
        // Create a key for this product-order combination
        const reviewKey = `${currentOrderId}-${currentProductId}`;
        
        // Update the state
        setProductReviews(prev => {
          const updatedReviews = {
            ...prev,
            [reviewKey]: true
          };
          
          // Also update localStorage for persistence
          try {
            localStorage.setItem('reviewedProducts', JSON.stringify(updatedReviews));
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
          
          return updatedReviews;
        });
        
        // Force re-render of the specific product item
        const ordersClone = [...orders];
        setOrders([]); // Clear orders
        setTimeout(() => {
          setOrders(ordersClone); // Set orders back after a brief delay
        }, 10);
        
        alert('Thank you for your feedback!');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      console.error('Error details:', err.response?.data);
      
      // If the error is that the product was already reviewed (409 Conflict)
      if (err.response?.status === 409) {
        // Still mark the product as reviewed
        const reviewKey = `${currentOrderId}-${currentProductId}`;
        
        // Update state and localStorage
        setProductReviews(prev => {
          const updatedReviews = {
            ...prev,
            [reviewKey]: true
          };
          
          localStorage.setItem('reviewedProducts', JSON.stringify(updatedReviews));
          return updatedReviews;
        });
        
        alert('This product has already been reviewed.');
      } else {
        alert(err.response?.data?.message || 'Failed to submit rating. Please try again.');
      }
    }
  };

  // Check if a product in an order has been reviewed
  const isProductReviewed = (orderId, productId) => {
    const key = `${orderId}-${productId}`;
    
    // First check in state
    if (productReviews[key] === true) {
      return true;
    }
    
    // If not found in state, check localStorage as backup
    try {
      const savedReviews = localStorage.getItem('reviewedProducts');
      if (savedReviews) {
        const reviewMap = JSON.parse(savedReviews);
        if (reviewMap[key] === true) {
          // Update state if found in localStorage but not in state
          setProductReviews(prev => ({
            ...prev,
            [key]: true
          }));
          return true;
        }
      }
    } catch (e) {
      console.error('Error checking localStorage for reviews:', e);
    }
    
    return false;
  };

  // Load initial product review status from localStorage
  useEffect(() => {
    try {
      const savedReviews = localStorage.getItem('reviewedProducts');
      if (savedReviews) {
        setProductReviews(JSON.parse(savedReviews));
        console.log('Loaded reviewed products from localStorage');
      }
    } catch (e) {
      console.error('Error loading reviews from localStorage:', e);
    }
  }, []);

  // Check for updated review status whenever the component renders
  useEffect(() => {
    const reviewedItems = document.querySelectorAll('.profile-orders-reviewed');
    console.log(`Found ${reviewedItems.length} reviewed items in the DOM`);
    
    // Check if the localStorage needs to be synced with the DOM
    try {
      const savedReviews = localStorage.getItem('reviewedProducts');
      if (savedReviews) {
        const reviewMap = JSON.parse(savedReviews);
        // This will trigger rerendering of product items that should be marked as reviewed
        setProductReviews(current => ({ ...current, ...reviewMap }));
      }
    } catch (e) {
      console.error('Error syncing with localStorage:', e);
    }
  }, [orders]);

  if (loading) {
    return (
      <div className="profile-orders">
        <div className="profile-orders-section">
          <h2 className="profile-orders-title">My Orders</h2>
          <p className="profile-orders-loading">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-orders">
        <div className="profile-orders-section">
          <h2 className="profile-orders-title">My Orders</h2>
          <p className="profile-orders-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(orders)) {
    console.error('Orders is not an array:', orders);
    return (
      <div className="profile-orders">
        <div className="profile-orders-section">
          <h2 className="profile-orders-title">My Orders</h2>
          <p className="profile-orders-error">Invalid data format received from server.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-orders">
      <div className="profile-orders-section">
        <h2 className="profile-orders-title">My Orders</h2>
        {orders.length > 0 ? (
          orders.map((order) => {
            if (!order) return null;
            
            return (
              <div key={order.id} className="profile-orders-card">
                <div className="profile-orders-header">
                  <span>Order #{order.id} - {formatDate(order.order_date)}</span>
                  <div>
                    <span className="profile-orders-status">{order.status || 'Unknown'}</span>
                    <Link to={`/order-tracking/${order.id}`} className="profile-orders-view">View Details</Link>
                    {order.status === 'Pending' && (
                      <button
                        className="profile-orders-cancel-btn"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelling[order.id]}
                        style={{
                          marginLeft: '10px',
                          background: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          cursor: cancelling[order.id] ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem',
                        }}
                      >
                        {cancelling[order.id] ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                    {order.status === 'Delivering' && (
                      <button
                        className="profile-orders-received-btn"
                        onClick={() => handleOrderReceived(order.id)}
                        disabled={processingAction[order.id]}
                        style={{
                          marginLeft: '10px',
                          background: '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          cursor: processingAction[order.id] ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem',
                        }}
                      >
                        {processingAction[order.id] ? 'Processing...' : 'Order Received'}
                      </button>
                    )}
                  </div>
                </div>
                {Array.isArray(order.order_details) && order.order_details.map((item) => {
                  if (!item) return null;
                  const imageId = `order-${order.id}-item-${item.id}`;
                  const imageUrl = getImageUrl(item.product?.image_1);
                  const hasBeenReviewed = isProductReviewed(order.id, item.product_id);
                  
                  console.log('Product image URL:', imageUrl);

                  return (
                    <div key={item.id} className="profile-orders-item">
                      <div className="profile-orders-item-image-container">
                        {!loadedImages[imageId] && (
                          <div className="profile-orders-item-image-placeholder">
                            <div className="profile-orders-item-image-loading"></div>
                          </div>
                        )}
                        <img 
                          src={imageUrl}
                          alt={item.product?.product_name || 'Product'} 
                          className={`profile-orders-item-image ${loadedImages[imageId] ? 'loaded' : ''}`}
                          onLoad={() => handleImageLoad(imageId)}
                          onError={() => handleImageError(imageId, imageUrl)}
                          style={{ display: loadedImages[imageId] ? 'block' : 'none' }}
                        />
                      </div>
                      <div className="profile-orders-item-details">
                        <h3>{item.product?.product_name || 'Product'}</h3>
                        <p>Qty: {item.quantity || 0}</p>
                        <p>Size: {item.size || 'N/A'}</p>
                        <p>Color: {item.color || 'N/A'}</p>
                        
                        {order.status === 'Completed' && !hasBeenReviewed && (
                          <button
                            key={`review-btn-${order.id}-${item.product_id}`}
                            className="profile-orders-review-btn"
                            onClick={() => openRateModal(order.id, item.product_id, item.product?.product_name)}
                            style={{
                              marginTop: '8px',
                              background: 'transparent',
                              color: '#3aa6b9',
                              border: '1px solid #3aa6b9',
                              borderRadius: '4px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Star size={16} />
                            Review & Rate
                          </button>
                        )}
                        
                        {order.status === 'Completed' && hasBeenReviewed && (
                          <div 
                            key={`reviewed-${order.id}-${item.product_id}`} 
                            className="profile-orders-reviewed" 
                            style={{
                              marginTop: '8px',
                              color: '#6c757d',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Star size={16} fill="#3aa6b9" stroke="#3aa6b9" />
                            Product reviewed
                          </div>
                        )}
                      </div>
                      <div className="profile-orders-item-price">${formatPrice(item.price)}</div>
                    </div>
                  );
                })}
                {/* Shipping Fee */}
                <div className="profile-orders-shipping-fee" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 16 }}>
                  <span>Shipping Fee</span>
                  <span>
                    ${
                      order.shipping_method?.fee !== undefined
                        ? formatPrice(order.shipping_method.fee)
                        : order.shipping_fee !== undefined
                          ? formatPrice(order.shipping_fee)
                          : '0.00'
                    }
                  </span>
                </div>
                <div className="profile-orders-total">
                  <span>Total</span>
                  <span>${formatPrice(order.total_amount)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="profile-orders-no-orders">No orders found.</p>
        )}
      </div>
      <RateModal 
        isOpen={rateModalOpen} 
        onClose={() => setRateModalOpen(false)} 
        onSubmit={handleRatingSubmit}
        productName={currentProductName}
      />
    </div>
  );
};

export default ProfileOrders;