import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from '../HeaderArea/CartSidebar';

const MyWishlist = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    profile_pic: '/imgs/profile.svg',
  });
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeMenuItem, setActiveMenuItem] = useState('wishlist');

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

  const notifications = [
    { id: 1, message: "Your order #1234 has been shipped!", time: "2 hours ago" },
    { id: 2, message: "New collection available now!", time: "5 hours ago" },
    { id: 3, message: "20% off sale ends tomorrow!", time: "1 day ago" },
  ];

  const supportItems = [
    { label: "ORDER & PAYMENT", path: "/customer/support/order-payment" },
    { label: "SHIPPING", path: "/customer/support/shipping" },
    { label: "RETURNS", path: "/customer/support/returns" },
    { label: "CONTACT US", path: "/customer/support/contact-us" },
    { label: "TERMS AND SERVICE", path: "/customer/support/terms-and-service" },
    { label: "FAQS", path: "/customer/support/faqs" },
  ];

  const profileDropdownItems = [
    { label: "My Profile", path: "/profile" },
    { label: "My Orders", path: "/profile/orders" },
    { label: "Logout", path: "#", onClick: handleLogout },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No authentication token found. Please log in.");

        const profileResponse = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = profileResponse.data.profile;
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/profile.svg',
        });

        const wishlistResponse = await axios.get(`${API_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const wishlistData = wishlistResponse.data.data || wishlistResponse.data || [];
        const detailedWishlist = wishlistData.map(item => ({
          id: item.product_id,
          productName: item.product?.product_name || "Unknown Product",
          price: item.product?.price || 0,
          imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : '/default-image.jpg',
        }));
        setWishlistedItems(detailedWishlist);

        const cartResponse = await axios.get(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartData = cartResponse.data.data || cartResponse.data || [];
        const detailedCart = cartData.map(item => ({
          id: item.product_id,
          productName: item.product?.product_name || "Unknown Product",
          price: item.product?.price || 0,
          imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : '/default-image.jpg',
          quantity: item.quantity || 1,
        }));
        setCartItems(detailedCart);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err.message || "An error occurred.");
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    setActiveMenuItem('logout');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleMenuClick = (menuItem, path) => {
    setActiveMenuItem(menuItem);
    navigate(path);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?query=${searchQuery}`);
  };

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistedItems(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      console.error("Error removing from wishlist:", error.response?.data || error.message);
    }
  };

  const wishlistCount = wishlistedItems.length;
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (loading) return <div className="loading">Loading wishlist...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="MyWishlist">
      <Header
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={handleSearchSubmit}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        notifications={notifications}
        isWishlistOpen={isWishlistOpen}
        setIsWishlistOpen={setIsWishlistOpen}
        wishlistedItems={wishlistedItems}
        wishlistCount={wishlistCount}
        isSupportOpen={isSupportOpen}
        setIsSupportOpen={setIsSupportOpen}
        supportItems={supportItems}
        isCartVisible={isCartVisible}
        setIsCartVisible={setIsCartVisible}
        cartCount={cartCount}
        userProfile={profile}
        isProfileDropdownOpen={isProfileDropdownOpen}
        setIsProfileDropdownOpen={setIsProfileDropdownOpen}
        profileDropdownItems={profileDropdownItems}
      />
      <CartSidebar
        isCartVisible={isCartVisible}
        setIsCartVisible={setIsCartVisible}
        cartItems={cartItems}
        cartCount={cartCount}
        increaseCartQuantity={(itemId) => setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item))}
        decreaseCartQuantity={(itemId) => setCartItems(prev => prev.map(item => item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item))}
        removeFromCart={(itemId) => async () => {
          await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setCartItems(prev => prev.filter(item => item.id !== itemId));
        }}
        navigate={navigate}
      />
      <div className="profile-container">
        <h1 className="profile-title">My Wishlist</h1>
        <div className="profile-body">
          <div className="sidebar">
            <div className="user-info">
              <img src={profile.profile_pic} alt="Profile" className="profile-pic" />
              <h2>{profile.first_name} {profile.last_name}</h2>
            </div>
            <ul className="nav-menu">
              <li className={activeMenuItem === 'profile' ? 'active' : ''} onClick={() => handleMenuClick('profile', '/profile')}>
                <img src="/imgs/myprofile.svg" alt="My Profile" /> My Profile
              </li>
              <li className={activeMenuItem === 'address' ? 'active' : ''} onClick={() => handleMenuClick('address', '/profile/address')}>
                <img src="/imgs/myaddress.svg" alt="My Address" /> My Address
              </li>
              <li className={activeMenuItem === 'password' ? 'active' : ''} onClick={() => handleMenuClick('password', '/profile/change-password')}>
                <img src="/imgs/mypassword.svg" alt="Change Password" /> Change Password
              </li>
              <li className={activeMenuItem === 'wishlist' ? 'active' : ''} onClick={() => handleMenuClick('wishlist', '/profile/wishlist')}>
                <img src="/imgs/mywishlist.svg" alt="My Wishlist" /> My Wishlist
              </li>
              <li className={activeMenuItem === 'orders' ? 'active' : ''} onClick={() => handleMenuClick('orders', '/profile/orders')}>
                <img src="/imgs/myorder.svg" alt="My Orders" /> My Orders
              </li>
              <li className={activeMenuItem === 'cart' ? 'active' : ''} onClick={() => handleMenuClick('cart', '/profile/cart')}>
                <img src="/imgs/mycarts.svg" alt="My Cart" /> My Cart
              </li>
              <li className={activeMenuItem === 'logout' ? 'active' : ''} onClick={handleLogout}>
                <img src="/imgs/mylogout.svg" alt="Logout" /> Logout
              </li>
            </ul>
          </div>
          <div className="profile-content">
            {wishlistedItems.length > 0 ? (
              <div className="wishlist-products">
                {wishlistedItems.map(item => (
                  <div key={item.id} className="wishlist-product">
                    <img src={item.imagePreview} alt={item.productName} className="wishlist-product-image" />
                    <div className="wishlist-product-details">
                      <h3>{item.productName}</h3>
                      <p>Price: ${item.price}</p>
                      <button onClick={() => removeFromWishlist(item.id)} className="remove-button">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No items in your wishlist.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyWishlist;