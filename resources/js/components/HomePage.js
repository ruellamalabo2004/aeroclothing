import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Slider from 'react-slick';
import { RiHeart3Fill } from 'react-icons/ri';
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ShopByCategory Component (unchanged)
const ShopByCategory = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/customer/${category.toLowerCase()}`);
  };

  const categories = [
    { name: "mens" },
    { name: "womens" },
    { name: "kids" },
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
            <p className="category-name">{category.name.toUpperCase()}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// FeaturedItems Component (unchanged)
const FeaturedItems = () => {
  const navigate = useNavigate();

  const handleShopNowClick = (category) => {
    navigate(`/customer/${category.toLowerCase()}`);
  };

  const featuredItems = [
    {
      name: "womens",
      title: "WOMEN'S GWEN SLICE DENIM SHIRT",
      discount: "UP TO 5%",
    },
    {
      name: "mens",
      title: "MEN'S SLIM-FIT KNIT CARDIGAN",
      discount: "UP TO 10%",
    },
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

// Footer Component (unchanged)
const Footer = () => {
  const footerLinks = [
    { label: "ORDERS & PAYMENTS", path: "/customer/support/order-payment" },
    { label: "SHIPPING", path: "/customer/support/shipping" },
    { label: "RETURNS", path: "/customer/support/returns" },
    { label: "CONTACT US", path: "/customer/support/contact-us" },
    { label: "TERMS AND SERVICES", path: "/customer/support/terms-and-service" },
    { label: "FAQS", path: "/customer/support/faqs" },
  ];

  const socialIcons = [
    { src: '/imgs/instagram.svg', alt: 'Instagram' },
    { src: '/imgs/facebook.svg', alt: 'Facebook' },
    { src: '/imgs/twitter.svg', alt: 'Twitter' },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          {footerLinks.map((link, index) => (
            <Link key={index} to={link.path} className="footer-link">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="footer-socials">
          <span>SOCIALS</span>
          <div className="social-icons">
            {socialIcons.map((icon, index) => (
              <img key={index} src={icon.src} alt={icon.alt} className="social-icon" />
            ))}
          </div>
        </div>
      </div>
      <div className="footer-copyright">
        <p>@2025 AERO. All Rights Reserved.</p>
      </div>
    </footer>
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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user profile to get user_id
    axios
      .get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const profileData = response.data.profile;
        const user = {
          id: response.data.user.id,
          first_name: profileData.first_name || '',
          middle_name: profileData.middle_name || '',
          last_name: profileData.last_name || '',
          suffix: profileData.suffix || '',
          email: response.data.user?.email || '',
          phone_number: profileData.phone_number || '',
          gender: profileData.gender || '',
          date_of_birth: profileData.date_of_birth || '',
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/Profile.svg',
        };
        setUserProfile(user);

        // Fetch wishlist and cart for this user
        fetchWishlist(token, user.id);
        fetchCart(token, user.id);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
      });

    // Fetch products
    axios
      .get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const products = Array.isArray(response.data) ? response.data : response.data.data || [];
        const updatedProducts = products
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4)
          .map((product) => ({
            ...product,
            imagePreview: product.image_1
              ? `${BASE_IMAGE_URL}/${product.image_1}`
              : "/default-image.jpg",
            productName: product.name || product.title || product.product_name || "Unnamed Product",
          }));
        setProducts(updatedProducts);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
      });
  }, [navigate, BASE_IMAGE_URL]);

  // Fetch wishlist for the logged-in user
  const fetchWishlist = async (token, userId) => {
    try {
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Wishlist response:", response.data);
      const wishlistData = response.data.data || response.data || [];
      // Map wishlist items to match expected structure
      const detailedWishlist = wishlistData.map(item => ({
        id: item.product_id,
        productName: item.product?.product_name  || "Unknown Product",
        price: item.product?.price || 0,
        imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : '/default-image.jpg',
      }));
      setWishlistedItems(detailedWishlist);
      console.log("Updated wishlistedItems:", detailedWishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error.response?.data || error.message);
    }
  };

  // Fetch cart for the logged-in user
  const fetchCart = async (token, userId) => {
    try {
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Cart response:", response.data);
      const cartData = response.data.data || response.data || [];
      // Map cart items to match expected structure
      const detailedCart = cartData.map(item => ({
        id: item.product_id,
        productName: item.product?.product_name  || "Unknown Product",
        price: item.product?.price || 0,
        imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : '/default-image.jpg',
        quantity: item.quantity || 1,
      }));
      setCartItems(detailedCart);
      console.log("Updated cartItems:", detailedCart);
    } catch (error) {
      console.error("Error fetching cart:", error.response?.data || error.message);
    }
  };

  // Add to wishlist with user_id
  const addToWishlist = async (product) => {
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    try {
      const response = await axios.post(`${API_URL}/wishlist`, {
        user_id: userId,
        product_id: product.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Add to wishlist response:", response.data);
      setLatestWishlistItem({
        id: product.id,
        productName: product.productName,
        price: product.price,
        imagePreview: product.imagePreview,
      }); // Set notification with full product details
      fetchWishlist(token, userId); // Refresh wishlist
    } catch (error) {
      console.error("Error adding to wishlist:", error.response?.data || error.message);
      if (error.response?.status === 409) {
        fetchWishlist(token, userId); // Refresh even on conflict
      }
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
  const token = localStorage.getItem('token');
  const userId = userProfile?.id;
  try {
    const response = await axios.delete(`${API_URL}/wishlist/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Remove from wishlist response:", response.data);
    fetchWishlist(token, userId);
  } catch (error) {
    console.error("Error removing from wishlist:", error.response?.data || error.message);
  }
};

  // Add to cart with user_id
  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    try {
      const response = await axios.post(`${API_URL}/cart/add`, {
        user_id: userId,
        product_id: product.id,
        quantity: 1,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Add to cart response:", response.data);
      fetchCart(token, userId); // Refresh cart
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error.message);
    }
  };

  // Remove from cart
  const removeFromCartBackend = async (productId) => {
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    try {
      const response = await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Remove from cart response:", response.data);
      fetchCart(token, userId); // Refresh cart
    } catch (error) {
      console.error("Error removing from cart:", error.response?.data || error.message);
    }
  };

  // Cart functions
  const handleAddToCart = (product) => async () => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (!existingItem) {
      await addToCart(product);
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    }
  };

  const increaseCartQuantity = (itemId) => {
    setCartItems((prev) => {
      const updatedCart = prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      );
      console.log("Increased quantity, new cartItems:", updatedCart);
      return updatedCart;
    });
  };

  const decreaseCartQuantity = (itemId) => {
    setCartItems((prev) => {
      const updatedCart = prev.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      console.log("Decreased quantity, new cartItems:", updatedCart);
      return updatedCart;
    });
  };

  const removeFromCart = (itemId) => async () => {
    await removeFromCartBackend(itemId);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Wishlist functions
  const handleWishlistToggle = (product) => async () => {
    const isWishlisted = wishlistedItems.some((item) => item.id === product.id);
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  useEffect(() => {
    if (latestWishlistItem) {
      const timer = setTimeout(() => {
        setLatestWishlistItem(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [latestWishlistItem]);

  const wishlistCount = wishlistedItems.length;

  const handleRatingChange = (item) => (newRating) => {
    setRatings((prev) => ({
      ...prev,
      [item]: newRating,
    }));
  };

  const handleBuyNow = (product) => () => {
    navigate('/checkout', { state: { product } });
  };

  const handleWishlistClick = () => {
    setIsWishlistOpen(!isWishlistOpen);
  };

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchQuery('');
      setFilteredItems(items);
    } else {
      setFilteredItems(items);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredItems(items);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const results = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(results);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleSupportToggle = (e) => {
    e.preventDefault();
    setIsSupportOpen(!isSupportOpen);
  };

  const handleCartClick = () => {
    setIsCartVisible(!isCartVisible);
  };

  const handleStartShopping = () => {
    navigate('/shop');
    setIsCartVisible(false);
  };

  const handleCloseCart = () => {
    setIsCartVisible(false);
  };

  const handleProfileToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    axios.delete(`${API_URL}/cart/clear`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch((error) => console.error("Error clearing cart:", error));

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setWishlistedItems([]);
    setCartItems([]);
    navigate('/login');
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.notification-container') && !e.target.closest('.header-icon')) {
      setIsNotificationOpen(false);
    }
    if (!e.target.closest('.wishlist-container') && !e.target.closest('.header-icon')) {
      setIsWishlistOpen(false);
    }
    if (!e.target.closest('.support-container') && !e.target.closest('.support-link')) {
      setIsSupportOpen(false);
    }
    if (!e.target.closest('.cart-sidebar') && !e.target.closest('.header-icon')) {
      setIsCartVisible(false);
    }
    if (!e.target.closest('.profile-container') && !e.target.closest('.profile-button')) {
      setIsProfileDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isNotificationOpen || isWishlistOpen || isSupportOpen || isCartVisible || isProfileDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
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
      <header className="login-header">
        <div className="logo-container">
          <img src="/imgs/logo.svg" alt="Aero Logo" className="logo" />
        </div>
        <nav className="nav-links">
          <Link to="/homepage">HOME</Link>
          <Link to="/shop">SHOP</Link>
          <Link to="/about">ABOUT US</Link>
          <div className="support-container">
            <Link 
              to="/support" 
              className={`support-link ${isSupportOpen ? 'active' : ''}`} 
              onClick={handleSupportToggle}
            >
              SUPPORT
              <img 
                src="/imgs/DROPDOWN.SVG" 
                alt="Dropdown" 
                className="dropdown-icon" 
              />
            </Link>
            <div className={`support-dropdown ${!isSupportOpen ? 'hidden' : ''}`}>
              {supportItems.map((item, index) => (
                <Link key={index} to={item.path} className="support-item">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <div className="header-icons">
          <div className="search-container">
            {isSearchOpen && (
              <form onSubmit={handleSearchSubmit} className="search-form">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </form>
            )}
            <img 
              src="/imgs/Search.svg" 
              alt="Search" 
              className="header-icon search-icon" 
              onClick={handleSearchClick}
            />
          </div>
          <div className="notification-container">
            <img 
              src="/imgs/notif.svg" 
              alt="Notification" 
              className="header-icon" 
              onClick={handleNotificationClick}
            />
            <div className={`notification-dropdown ${!isNotificationOpen ? 'hidden' : ''}`}>
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <p>{notification.message}</p>
                    <span>{notification.time}</span>
                  </div>
                ))
              ) : (
                <p className="no-notifications">No new notifications</p>
              )}
            </div>
          </div>
          <div className="wishlist-container">
            <img 
              src="/imgs/Wish.svg" 
              alt="Wishlist" 
              className="header-icon" 
              onClick={handleWishlistClick}
            />
            {wishlistCount > 0 && (
              <span className="wishlist-count">{wishlistCount}</span>
            )}
            <div className={`wishlist-dropdown ${!isWishlistOpen ? 'hidden' : ''}`}>
              {wishlistedItems.length === 0 ? (
                <p className="no-wishlist-items">No items in wishlist</p>
              ) : (
                <>
                  {latestWishlistItem && (
                    <div className="wishlist-notification">
                      <img 
                        src={latestWishlistItem.imagePreview || '/default-image.jpg'} 
                        alt={latestWishlistItem.productName} 
                        className="wishlist-item-image"
                        style={{ width: '30px', height: '30px', marginRight: '10px' }}
                      />
                      <p>Added to Wishlist: {latestWishlistItem.productName}</p>
                    </div>
                  )}
                  <div className="wishlist-items">
                    {wishlistedItems.map((item) => (
                      <div key={item.id} className="wishlist-item">
                        <img 
                          src={item.imagePreview || '/default-image.jpg'} 
                          alt={item.productName} 
                          className="wishlist-item-image"
                        />
                        <div className="wishlist-item-details">
                          <h3>{item.productName}</h3>
                          <p>₱{item.price}</p>
                        </div>
                        <button 
                          className="remove-item"
                          onClick={handleWishlistToggle(item)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="cart-icon-container">
            <img 
              src="/imgs/Cart.svg" 
              alt="Cart" 
              className="header-icon" 
              onClick={handleCartClick}
            />
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </div>
          <div className="profile-container">
            <button
              className={`profile-button ${isProfileDropdownOpen ? 'active' : ''}`}
              onClick={handleProfileToggle}
            >
              {userProfile?.profile_pic ? (
                <img
                  src={userProfile.profile_pic}
                  alt="Profile"
                  className="profile-pic"
                />
              ) : (
                <img src="/imgs/Profile.svg" alt="Profile" className="profile-pic" />
              )}
            </button>
            <div className={`profile-dropdown ${!isProfileDropdownOpen ? 'hidden' : ''}`}>
              {profileDropdownItems.map((item, index) => (
                <React.Fragment key={index}>
                  <Link
                    to={item.path}
                    className="profile-item"
                    onClick={item.onClick || undefined}
                  >
                    {item.label}
                  </Link>
                  {index === 1 && <hr className="profile-separator" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className={`cart-sidebar ${isCartVisible ? 'active' : ''}`}>
        <div className="cart-content">
          <div className="cart-header">
            <h2>CART ({cartCount})</h2>
            <span className="close-cart" onClick={handleCloseCart}>
              ×
            </span>
          </div>
          <div className="cart-body">
            {cartItems.length === 0 ? (
              <>
                <img src="/imgs/emptycart.svg" alt="Empty Cart" className="empty-cart-icon" />
                <p>Your cart is currently empty.</p>
                <button className="start-shopping-btn" onClick={handleStartShopping}>
                  START SHOPPING
                </button>
              </>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <img 
                        src={item.imagePreview || '/default-image.jpg'} 
                        alt={item.productName || 'Product'} 
                        className="cart-item-image"
                      />
                      <div className="cart-item-details">
                        <h3>{item.productName || 'Unnamed Product'}</h3>
                        <p>₱{item.price || 0}</p>
                        <div className="quantity-control">
                          <button 
                            onClick={() => decreaseCartQuantity(item.id)}
                            disabled={item.quantity === 1}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => increaseCartQuantity(item.id)}>
                            +
                          </button>
                        </div>
                      </div>
                      <button 
                        className="remove-item"
                        onClick={removeFromCart(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  className="checkout-btn"
                  onClick={() => navigate('/checkout', { state: { cartItems } })}
                >
                  PROCEED TO CHECKOUT
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="slider-container">
        <Slider {...sliderSettings}>
          <div>
            <img src="/imgs/slider1.svg" alt="Clothing 1" className="slider-image" />
            <button className="slider-shop-now-button">SHOP NOW</button>
          </div>
          <div>
            <img src="/imgs/slider2.svg" alt="Clothing 2" className="slider-image" />
            <button className="slider-shop-now-button">SHOP NOW</button>
          </div>
          <div>
            <img src="/imgs/slider3.svg" alt="Clothing 3" className="slider-image" />
            <button className="slider-shop-now-button">SHOP NOW</button>
          </div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle(item)();
                  }}
                />
              </div>
              <div className="price-container">
                <p className="item-price">{item.price}</p>
                {item.discount && <span className="discount">{item.discount}</span>}
              </div>
            </div>
          ))}
          {isSearchOpen && filteredItems.length === 0 && (
            <p className="no-results">No items found</p>
          )}
        </div>
        <div className="new-product-image-containers">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="product-container">
                <div className="product-card">
                  <img 
                    src={product.imagePreview || '/default-image.jpg'} 
                    alt={product.productName || 'Product'} 
                  />
                  <div className="product-actions">
                    <button 
                      className="add-to-cart-btn"
                      onClick={handleAddToCart(product)}
                    >
                      <img src="/imgs/addcart.svg" alt="Add to Cart" className="action-icon" />
                    </button>
                    <button 
                      className="buy-now-btn"
                      onClick={handleBuyNow(product)}
                    >
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