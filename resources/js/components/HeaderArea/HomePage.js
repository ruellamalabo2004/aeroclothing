import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Slider from 'react-slick';
import { RiHeart3Fill } from 'react-icons/ri';
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from './CartSidebar';

// ShopByCategory and FeaturedItems remain unchanged
const ShopByCategory = () => {
  const navigate = useNavigate();
  const handleCategoryClick = (category) => {
    navigate(`/customer/${category.toLowerCase()}`);
  };
  const categories = [
    { name: "mens", svg: "/imgs/mensc.svg" },
    { name: "womens", svg: "/imgs/womensc.svg" },
    { name: "kids", svg: "/imgs/kidsc.svg" },
  ];
  return (
    <section className="shop-by-category-section">
      <h2>SHOP BY CATEGORY</h2>
      <div className="category-items">
        {categories.map((category) => (
          <div
            key={category.name}
            className="category-item"
            onClick={() => handleCategoryClick(category.name)}
            style={{ cursor: 'pointer' }}
          >
            <img src={category.svg} alt={category.name} className="category-svg" />
            <p className="category-name">{category.name.toUpperCase()}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const FeaturedItems = () => {
  const navigate = useNavigate();
  const handleShopNowClick = (category) => {
    navigate(`/customer/${category.toLowerCase()}`);
  };
  const featuredItems = [
    { name: "womens", title: "WOMEN'S GWEN SLICE DENIM SHIRT", discount: "UP TO 5%", svg: "/imgs/womensf.svg" },
    { name: "mens", title: "MEN'S SLIM-FIT KNIT CARDIGAN", discount: "UP TO 10%", svg: "/imgs/mensf.svg" },
  ];
  return (
    <section className="featured-items-section">
      {featuredItems.map((item) => (
        <div
          key={item.name}
          className="featured-item"
          onClick={() => handleShopNowClick(item.name)}
          style={{ cursor: 'pointer' }}
        >
          <img src={item.svg} alt={item.title} className="featured-svg" />
          <div className="featured-content">
            <p className="featured-category">{item.name.toUpperCase()} CLOTHING</p>
            <p className="featured-title">{item.title}</p>
            <p className="featured-discount">{item.discount}</p>
            <button className="shop-now-button">SHOP NOW</button>
          </div>
        </div>
      ))}
    </section>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({});
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [latestWishlistItem, setLatestWishlistItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

  const items = [];
  const supportItems = [
    { label: "ORDER & PAYMENT", path: "/customer/support/order-payment" },
    { label: "SHIPPING", path: "/customer/support/shipping" },
    { label: "RETURNS", path: "/customer/support/returns" },
    { label: "CONTACT US", path: "/customer/support/contact-us" },
    { label: "TERMS AND SERVICE", path: "/customer/support/terms-and-service" },
  ];

  const profileDropdownItems = [
    { label: "My Profile", path: "/profile" },
    { label: "My Orders", path: "/profile/orders" },
    { label: "Logout", path: "#", onClick: handleLogout },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const profileResponse = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = profileResponse.data.profile;
        const user = {
          id: profileResponse.data.user.id,
          first_name: profileData.first_name || '',
          middle_name: profileData.middle_name || '',
          last_name: profileData.last_name || '',
          suffix: profileData.suffix || '',
          email: profileResponse.data.user?.email || '',
          phone_number: profileData.phone_number || '',
          gender: profileData.gender || '',
          date_of_birth: profileData.date_of_birth || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/Profile.svg',
        };
        setUserProfile(user);

        await Promise.all([
          fetchWishlist(token, user.id),
          fetchCart(token, user.id),
          fetchProducts(token),
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate, BASE_IMAGE_URL]);

  const fetchWishlist = async (token, userId) => {
    try {
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wishlistData = response.data.data || response.data || [];
      const detailedWishlist = wishlistData
        .map(item => ({
          id: item.product_id,
          productName: item.product?.product_name || "Unknown Product",
          price: item.product?.price || 0,
          imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : '/default-image.jpg',
          created_at: item.created_at || new Date().toISOString(),
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      console.log("Updated wishlistedItems from backend:", detailedWishlist);
      if (detailedWishlist.length > 0) {
        setWishlistedItems(detailedWishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist, keeping current state:", error.response?.data || error.message);
    }
  };

  const fetchCart = async (token, userId) => {
    try {
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = response.data.data || response.data || [];
      const detailedCart = cartData.map(item => ({
        id: item.product_id,
        productName: item.product?.product_name || "Unknown Product",
        price: item.product?.price || 0,
        imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : '/default-image.jpg',
        quantity: item.quantity || 1,
      }));
      setCartItems(detailedCart);
    } catch (error) {
      console.error("Error fetching cart:", error.response?.data || error.message);
    }
  };

  const fetchProducts = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const products = Array.isArray(response.data) ? response.data : response.data.data || [];
      const updatedProducts = products
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4)
        .map((product) => ({
          ...product,
          imagePreview: product.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : "/default-image.jpg",
          productName: product.name || product.title || product.product_name || "Unnamed Product",
        }));
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error.message);
    }
  };

  const addToWishlist = async (product) => {
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    try {
      await axios.post(
        `${API_URL}/wishlist`,
        { user_id: userId, product_id: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newWishlistItem = {
        id: product.id,
        productName: product.productName,
        price: product.price,
        imagePreview: product.imagePreview,
        created_at: new Date().toISOString(),
      };
      setLatestWishlistItem(newWishlistItem);
      setWishlistedItems(prev => [newWishlistItem, ...prev.filter(item => item.id !== product.id)]);
      await fetchWishlist(token, userId);
    } catch (error) {
      console.error("Error adding to wishlist:", error.response?.data || error.message);
      if (error.response?.status === 409) await fetchWishlist(token, userId);
    }
  };

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    try {
      await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistedItems(prev => prev.filter(item => item.id !== productId));
      await fetchWishlist(token, userId);
    } catch (error) {
      console.error("Error removing from wishlist:", error.response?.data || error.message);
    }
  };

  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    try {
      await axios.post(`${API_URL}/cart/add`, {
        user_id: userId,
        product_id: product.id,
        quantity: 1,
      }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchCart(token, userId);
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error.message);
    }
  };

  const removeFromCartBackend = async (productId) => {
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    try {
      await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart(token, userId);
    } catch (error) {
      console.error("Error removing from cart:", error.response?.data || error.message);
    }
  };

  const handleAddToCart = (product) => async () => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (!existingItem) await addToCart(product);
    else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    }
  };

  const increaseCartQuantity = (itemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseCartQuantity = (itemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeFromCart = (itemId) => async () => {
    await removeFromCartBackend(itemId);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleWishlistToggle = (product) => async () => {
    const isWishlisted = wishlistedItems.some((item) => item.id === product.id);
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  // Updated handleBuyNow to add to cart and navigate to checkout
  const handleBuyNow = (product) => async () => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (!existingItem) {
      // Add the product to the cart if it's not already there
      await addToCart(product);
    }
    // Navigate to the checkout page with the product details
    navigate('/checkout', { state: { product } });
  };

  useEffect(() => {
    if (latestWishlistItem) {
      const timer = setTimeout(() => setLatestWishlistItem(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [latestWishlistItem]);

  const wishlistCount = wishlistedItems.length;

  const handleRatingChange = (item) => (newRating) => {
    setRatings((prev) => ({ ...prev, [item]: newRating }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === '') setFilteredItems(items);
    else {
      const results = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(results);
    }
  };

  const handleStartShopping = () => {
    navigate('/shop');
    setIsCartVisible(false);
  };

  const handleCloseCart = () => setIsCartVisible(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      const token = localStorage.getItem('token');
      axios.delete(`${API_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => console.error("Error clearing cart:", error));
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setWishlistedItems([]);
      setCartItems([]);
      navigate('/login');
      setIsProfileDropdownOpen(false);
    }
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.notification-container') && !e.target.closest('.header-icon')) setIsNotificationOpen(false);
    if (!e.target.closest('.wishlist-container') && !e.target.closest('.header-icon')) setIsWishlistOpen(false);
    if (!e.target.closest('.support-container') && !e.target.closest('.support-link')) setIsSupportOpen(false);
    if (!e.target.closest('.cart-sidebar') && !e.target.closest('.header-icon')) setIsCartVisible(false);
    if (!e.target.closest('.profile-container') && !e.target.closest('.profile-button')) setIsProfileDropdownOpen(false);
  };

  useEffect(() => {
    if (isNotificationOpen || isWishlistOpen || isSupportOpen || isCartVisible || isProfileDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isNotificationOpen, isWishlistOpen, isSupportOpen, isCartVisible, isProfileDropdownOpen]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    adaptiveHeight: false,
  };

  const handleItemClick = (item) => {
    navigate(`/customer/item/${item.id}`, { state: { item } });
  };

  return (
    <div className="Homepage">
      <Header
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={handleSearchSubmit}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        isWishlistOpen={isWishlistOpen}
        setIsWishlistOpen={setIsWishlistOpen}
        wishlistedItems={wishlistedItems}
        wishlistCount={wishlistCount}
        latestWishlistItem={latestWishlistItem}
        handleWishlistToggle={handleWishlistToggle}
        isSupportOpen={isSupportOpen}
        setIsSupportOpen={setIsSupportOpen}
        supportItems={supportItems}
        isCartVisible={isCartVisible}
        setIsCartVisible={setIsCartVisible}
        cartCount={cartCount}
        userProfile={userProfile}
        isProfileDropdownOpen={isProfileDropdownOpen}
        setIsProfileDropdownOpen={setIsProfileDropdownOpen}
        profileDropdownItems={profileDropdownItems}
      />
      <CartSidebar
        isCartVisible={isCartVisible}
        setIsCartVisible={setIsCartVisible}
        cartItems={cartItems}
        cartCount={cartCount}
        increaseCartQuantity={increaseCartQuantity}
        decreaseCartQuantity={decreaseCartQuantity}
        removeFromCart={removeFromCart}
        navigate={navigate}
      />
      <div className="slider-container">
        <Slider {...sliderSettings}>
          <div><img src="/imgs/slider1.svg" alt="Clothing 1" className="slider-image" /><button className="slider-shop-now-button">SHOP NOW</button></div>
          <div><img src="/imgs/slider2.svg" alt="Clothing 2" className="slider-image" /><button className="slider-shop-now-button">SHOP NOW</button></div>
          <div><img src="/imgs/slider3.svg" alt="Clothing 3" className="slider-image" /><button className="slider-shop-now-button">SHOP NOW</button></div>
        </Slider>
      </div>

      <section className="top-selling-section">
        <h2>NEW ARRIVALS</h2>
        <div className="top-selling-items">
          {(isSearchOpen && filteredItems.length > 0 ? filteredItems : items).map(item => (
            <div
              className="top-selling-item"
              key={item.id}
              onClick={() => handleItemClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="item-header">
                <p className="item-name">{item.name}</p>
                <RiHeart3Fill
                  className={`heart ${wishlistedItems.some(w => w.id === item.id) ? 'wishlisted' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleWishlistToggle(item)(); }}
                />
              </div>
              <div className="price-container">
                <p className="item-price">{item.price}</p>
                {item.discount && <span className="discount">{item.discount}</span>}
              </div>
            </div>
          ))}
          {isSearchOpen && filteredItems.length === 0 && <p className="no-results">No items found</p>}
        </div>
        <div className="new-product-image-containers">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="product-container">
                <div className="product-card">
                  <img src={product.imagePreview || '/default-image.jpg'} alt={product.productName || 'Product'} />
                  <div className="product-actions">
                    <button className="add-to-cart-btn" onClick={handleAddToCart(product)}>
                      <img src="/imgs/addcart.svg" alt="Add to Cart" className="action-icon" />
                    </button>
                    <button className="buy-now-btn" onClick={handleBuyNow(product)}>
                      <img src="/imgs/buynow.svg" alt="Buy Now" className="action-icon" />
                    </button>
                  </div>
                </div>
                <div className="product-name-container">
                  <h3 className="product-name">{product.productName || "Unnamed Product"}</h3>
                  <img
                    src={wishlistedItems.some((w) => w.id === product.id) ? "/imgs/heart-red.svg" : "/imgs/heart.svg"}
                    alt="Wishlist"
                    className="wishlist-button"
                    onClick={handleWishlistToggle(product)}
                  />
                </div>
                <p className="product-price">₱{product.price || "N/A"}</p>
              </div>
            ))
          ) : (
            <p>No products available.</p>
          )}
        </div>
        <ShopByCategory />
        <FeaturedItems />
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;