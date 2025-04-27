import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WishlistContext = createContext();
const API_URL = "http://127.0.0.1:8000/api";
const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
const LOCAL_WISHLIST_KEY = "guest_wishlist";

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [notification, setNotification] = useState('');
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const retry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    setIsLoading(true);
    setApiError(null);

    if (token) {
      try {
        const response = await retry(() =>
          axios.get(`${API_URL}/wishlist`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          })
        );

        const wishlistData = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        const wishlistItems = wishlistData
          .filter((item) => item.product_id && item.product)
          .map((item) => ({
            id: item.product_id,
            productName: item.product.product_name || 'Unknown Product',
            price: Number(item.product.price) || 0,
            imagePreview: item.product.image_1
              ? `${BASE_IMAGE_URL}/${item.product.image_1}`
              : '/images/placeholder.png',
          }));

        setWishlist(wishlistItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error.response?.data || error.message);
        setApiError({
          message: 'Failed to fetch wishlist from server',
          details: error.response?.data || error.message,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          loadLocalWishlist();
        }
      }
    } else {
      loadLocalWishlist();
    }
    setIsLoading(false);
  };

  const loadLocalWishlist = () => {
    try {
      const localWishlist = localStorage.getItem(LOCAL_WISHLIST_KEY);
      if (localWishlist) {
        setWishlist(JSON.parse(localWishlist));
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error loading local wishlist:', error);
      setWishlist([]);
    }
  };

  const saveLocalWishlist = (wishlistItems) => {
    try {
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving local wishlist:', error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const isProductInWishlist = (productId) => {
    return wishlist.some((item) => parseInt(item.id) === parseInt(productId));
  };

  const addToWishlist = async (item) => {
    const token = localStorage.getItem('token');
    setApiError(null);
  
    const productId = parseInt(item.id);
  
    if (isProductInWishlist(productId)) {
      showNotification(`${item.productName} is already in your wishlist`);
      return;
    }
  
    const newItem = {
      id: productId,
      productName: item.productName,
      price: Number(item.price) || 0,
      imagePreview: item.imagePreview,
    };
  
    const updatedWishlist = [...wishlist, newItem];
    setWishlist(updatedWishlist);
  
    if (token) {
      try {
        await retry(() =>
          axios.post(
            `${API_URL}/wishlist`,
            { product_id: productId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }
          )
        );
        await fetchWishlist();
      } catch (error) {
        console.error('Error adding to wishlist:', error.response?.data || error.message);
        setApiError({
          message: error.response?.status === 409 ? 'Product already in wishlist' : 'Failed to add item to wishlist',
          details: error.response?.data || error.message,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          saveLocalWishlist(updatedWishlist);
        } else if (error.response?.status !== 409) {
          setWishlist(wishlist);
        }
      }
    } else {
      saveLocalWishlist(updatedWishlist);
    }
  
    if (!apiError || apiError.status !== 409) {
      showNotification(`Added ${item.productName} to wishlist`);
    }
  };

  const removeFromWishlist = async (itemId) => {
    const token = localStorage.getItem('token');
    setApiError(null);

    const productId = parseInt(itemId);
    const itemToRemove = wishlist.find((item) => parseInt(item.id) === productId);
    const updatedWishlist = wishlist.filter((item) => parseInt(item.id) !== productId);

    setWishlist(updatedWishlist);

    if (token) {
      try {
        await retry(() =>
          axios.delete(`${API_URL}/wishlist/${productId}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          })
        );
        await fetchWishlist();
      } catch (error) {
        console.error('Error removing from wishlist:', error.response?.data || error.message);
        setApiError({
          message: 'Failed to remove item from wishlist',
          details: error.response?.data || error.message,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          saveLocalWishlist(updatedWishlist);
        }
      }
    } else {
      saveLocalWishlist(updatedWishlist);
    }

    showNotification(`${itemToRemove ? itemToRemove.productName : 'Item'} removed from wishlist`);
  };

  const syncWishlistWithServer = async (token) => {
    const localWishlist = JSON.parse(localStorage.getItem(LOCAL_WISHLIST_KEY) || '[]');

    if (localWishlist.length > 0) {
      setIsLoading(true);

      for (const item of localWishlist) {
        try {
          await retry(() =>
            axios.post(
              `${API_URL}/wishlist`,
              { product_id: parseInt(item.id) },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
              }
            )
          );
        } catch (error) {
          console.error('Error syncing item to server wishlist:', error.response?.data || error.message);
        }
      }

      localStorage.removeItem(LOCAL_WISHLIST_KEY);
      await fetchWishlist();
      setIsLoading(false);
    }
  };

  const handleLogin = async (token, userData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      await syncWishlistWithServer(token);
    } catch (error) {
      console.error('Error syncing wishlist on login:', error.response?.data || error.message);
      setApiError({
        message: 'Failed to sync wishlist on login',
        details: error.response?.data || error.message,
        status: error.response?.status,
      });
      showNotification('Failed to sync wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    saveLocalWishlist(wishlist);
    showNotification('Wishlist saved locally');
  };

  const showNotification = (message) => {
    setNotificationQueue((prev) => [...prev, message]);
  };

  const clearNotification = () => {
    setNotification('');
    setNotificationQueue([]);
  };

  useEffect(() => {
    if (notificationQueue.length > 0 && !notification) {
      setNotification(notificationQueue[0]);
      setNotificationQueue((prev) => prev.slice(1));
      setTimeout(() => {
        setNotification('');
      }, 3000);
    }
  }, [notificationQueue, notification]);

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isProductInWishlist,
    notification,
    isLoading,
    apiError,
    handleLogin,
    handleLogout,
    fetchWishlist,
    clearNotification,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;