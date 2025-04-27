import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();
const API_URL = "http://127.0.0.1:8000/api";
const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
const LOCAL_CART_KEY = "guest_shopping_cart"; // key for local storage

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Get cart items - from server if logged in, otherwise from local storage
  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    setIsLoading(true);
    
    if (token) {
      // User is logged in - fetch from server
      try {
        const response = await axios.get(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        const cartItems = response.data.map(item => ({
          id: item.product_id,
          productName: item.product?.product_name || "Unknown Product",
          price: Number(item.product?.price) || 0,
          imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : "/images/placeholder.png",
          quantity: item.quantity,
          size: item.size || "Not specified",
          color: item.color || "Not specified",
        }));
        setCart(cartItems);
      } catch (error) {
        console.error('Error fetching cart:', error.response?.data || error.message);
        setApiError({
          message: 'Failed to fetch cart from server',
          details: error.response?.data || error.message,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          loadLocalCart(); // Fall back to local cart
        }
      }
    } else {
      // User is not logged in - load from local storage
      loadLocalCart();
    }
    setIsLoading(false);
  };

  // Load cart from local storage for guest users
  const loadLocalCart = () => {
    try {
      const localCart = localStorage.getItem(LOCAL_CART_KEY);
      if (localCart) {
        setCart(JSON.parse(localCart));
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error('Error loading local cart:', error);
      setCart([]);
    }
  };

  // Save cart to local storage for guest users
  const saveLocalCart = (cartItems) => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (item) => {
    const token = localStorage.getItem('token');
    setApiError(null);
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.id === parseInt(item.id) && 
      cartItem.size === (item.selectedSize || null) && 
      cartItem.color === (item.selectedColor || null)
    );

    let updatedCart;
    
    if (existingItemIndex >= 0) {
      // Item exists, update quantity
      updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += parseInt(item.quantity) || 1;
    } else {
      // New item, add to cart
      const newItem = {
        id: parseInt(item.id),
        productName: item.productName,
        price: Number(item.price) || 0,
        imagePreview: item.imagePreview,
        quantity: parseInt(item.quantity) || 1,
        size: item.selectedSize || "Not specified",
        color: item.selectedColor || "Not specified",
      };
      updatedCart = [...cart, newItem];
    }

    // Update state
    setCart(updatedCart);
    
    if (token) {
      // User is logged in - also update server
      try {
        await axios.post(
          `${API_URL}/cart/add`,
          {
            product_id: parseInt(item.id),
            size: item.selectedSize || null,
            color: item.selectedColor || null,
            quantity: parseInt(item.quantity) || 1,
          },
          { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' } }
        );
        await fetchCart(); // Refresh cart from server
      } catch (error) {
        console.error('Error adding to cart:', error.response?.data || error.message);
        setApiError({
          message: 'Failed to add item to cart',
          details: error.response?.data || error.message,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Still keep item in local cart
          saveLocalCart(updatedCart);
        }
      }
    } else {
      // User is not logged in - save to local storage
      saveLocalCart(updatedCart);
    }
    
    showNotification(`Added ${item.productName} to cart`);
  };

  const updateQuantity = async (itemId, size, color, newQuantity) => {
    const token = localStorage.getItem('token');
    setApiError(null);
    
    // Find the item in the cart
    const updatedCart = cart.map(item => {
      if (item.id === itemId && item.size === size && item.color === color) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0); // Remove items with quantity 0 or less
    
    // Update state
    setCart(updatedCart);
    
    if (token) {
      // User is logged in - also update server
      try {
        await axios.post(
          `${API_URL}/cart/update`,
          {
            product_id: itemId,
            size,
            color,
            quantity: newQuantity,
          },
          { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' } }
        );
        await fetchCart(); // Refresh cart from server
      } catch (error) {
        console.error('Error updating quantity:', error.response?.data || error.message);
        setApiError({
          message: 'Failed to update cart',
          details: error.response?.data || error.message,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Still keep updates in local cart
          saveLocalCart(updatedCart);
        }
      }
    } else {
      // User is not logged in - save to local storage
      saveLocalCart(updatedCart);
    }
    
    showNotification('Cart updated');
  };

  const removeFromCart = async (itemId, size, color) => {
    const token = localStorage.getItem('token');
    setApiError(null);
    
    // Filter out the item to remove
    const updatedCart = cart.filter(item => 
      !(item.id === itemId && item.size === size && item.color === color)
    );
    
    // Update state
    setCart(updatedCart);
    
    if (token) {
      // User is logged in - also update server
      try {
        await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
          data: { size, color },
        });
        await fetchCart(); // Refresh cart from server
      } catch (error) {
        console.error('Error removing item:', error.response?.data || error.message);
        setApiError({
          message: 'Failed to remove item from cart',
          details: error.response?.data || error.message,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Still keep updates in local cart
          saveLocalCart(updatedCart);
        }
      }
    } else {
      // User is not logged in - save to local storage
      saveLocalCart(updatedCart);
    }
    
    showNotification('Item removed from cart');
  };

  const clearCart = async () => {
    const token = localStorage.getItem('token');
    setApiError(null);
    
    // Clear cart state
    setCart([]);
    
    if (token) {
      // User is logged in - also clear server cart
      try {
        await axios.delete(`${API_URL}/cart/clear`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
      } catch (error) {
        console.error('Error clearing cart:', error.response?.data || error.message);
        setApiError({
          message: 'Failed to clear cart',
          details: error.response?.data || error.message,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    
    // Clear local storage cart
    localStorage.removeItem(LOCAL_CART_KEY);
    showNotification('Cart cleared');
  };

  // Sync local cart with server on login
  const syncCartWithServer = async (token) => {
    const localCart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
    
    if (localCart.length > 0) {
      setIsLoading(true);
      
      // Add each local item to server cart
      for (const item of localCart) {
        try {
          await axios.post(
            `${API_URL}/cart/add`,
            {
              product_id: item.id,
              size: item.size !== "Not specified" ? item.size : null,
              color: item.color !== "Not specified" ? item.color : null,
              quantity: item.quantity,
            },
            { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error syncing item to server cart:', error.response?.data || error.message);
        }
      }
      
      // Clear local cart after syncing
      localStorage.removeItem(LOCAL_CART_KEY);
      
      // Fetch the updated cart from server
      await fetchCart();
      setIsLoading(false);
    }
  };

  const handleLogin = async (token, userData) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Sync local cart with server
      await syncCartWithServer(token);
      
    } catch (error) {
      console.error('Error syncing cart on login:', error.response?.data || error.message);
      setApiError({
        message: 'Failed to sync cart on login',
        details: error.response?.data || error.message,
        status: error.response?.status,
      });
      showNotification('Failed to sync cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Save current cart to local storage before logout
    saveLocalCart(cart);
    
    // Clear authentication
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Keep the cart in state for guest shopping experience
    showNotification('Logged out successfully');
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    notification,
    isLoading,
    apiError,
    handleLogin,
    handleLogout,
    fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};