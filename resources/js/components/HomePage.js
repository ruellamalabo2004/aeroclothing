import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Slider from 'react-slick';
import { RiHeart3Fill } from 'react-icons/ri';
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// StarRating Component
const StarRating = ({ rating: initialRating, onRatingChange }) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div className="star-rating">
      {[...Array(5)].map((star, index) => {
        index += 1;
        return (
          <button
            type="button"
            key={index}
            className={index <= (hover || rating) ? "on" : "off"}
            onClick={() => handleRatingChange(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(rating)}
          >
            <span className="star fs-2">★</span>
          </button>
        );
      })}
    </div>
  );
};

// ShopByCategory Component
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

// FeaturedItems Component
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

// Footer Component
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

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
    { label: "FAQS", path: "/customer/support/faqs" }
  ];

  const profileItems = [
    { label: "My Profile", path: "/profile", icon: "/imgs/myprofile.svg" },
    { label: "My Orders", path: "/customer/orders", icon: "/imgs/myorders.svg" },
    { label: "Logout", path: "/logout", icon: "/imgs/logouts.svg" },
  ];

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/products")
      .then((response) => {
        console.log("Products:", response.data);
        const products = Array.isArray(response.data) ? response.data : response.data.data || [];
        const updatedProducts = products
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4)
          .map((product) => {
            console.log("Product Keys:", Object.keys(product));
            console.log("Full Product:", product);
            return {
              ...product,
              imagePreview: product.image_1
                ? `${BASE_IMAGE_URL}/${product.image_1}`
                : "/default-image.jpg",
              productName: product.name || product.title || product.product_name || "Unnamed Product",
            };
          });
        setProducts(updatedProducts);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, [BASE_IMAGE_URL]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/user/profile")
      .then((response) => {
        setUserProfile(response.data);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, []);

  const handleRatingChange = (item) => (newRating) => {
    setRatings(prev => ({
      ...prev,
      [item]: newRating
    }));
  };

  const handleWishlistClick = (product) => () => {
    setWishlistedItems((prev) => {
      const isWishlisted = prev.some((w) => w.id === product.id);
      if (isWishlisted) {
        return prev.filter((w) => w.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleAddToCart = (product) => () => {
    setCartItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (!exists) {
        return [...prev, { ...product, quantity: 1 }];
      }
      return prev;
    });
    console.log(`${product.productName} added to cart`);
  };

  const handleBuyNow = (product) => () => {
    navigate('/checkout', { state: { product } });
  };

  const handleWishlistToggle = () => {
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
      const results = items.filter(item =>
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

  const handleProfileToggle = (e) => {
    e.preventDefault();
    setIsProfileOpen(!isProfileOpen);
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
    if (!e.target.closest('.profile-container') && !e.target.closest('.profile-button')) {
      setIsProfileOpen(false);
    }
  };

  useEffect(() => {
    if (isNotificationOpen || isWishlistOpen || isSupportOpen || isProfileOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isNotificationOpen, isWishlistOpen, isSupportOpen, isProfileOpen]);

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
              onClick={handleWishlistToggle}
            />
            <div className={`wishlist-dropdown ${!isWishlistOpen ? 'hidden' : ''}`}>
              {wishlistedItems.length > 0 ? (
                wishlistedItems.map(item => (
                  <div key={item.id} className="wishlist-item">
                    <div className="wishlist-item-details">
                      <p>{item.name}</p>
                      <span>{item.price}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-wishlist-items">No items in wishlist</p>
              )}
            </div>
          </div>
          <img src="/imgs/Cart.svg" alt="Cart" className="header-icon" />
          <div className="profile-container">
            <button 
              className={`profile-button ${isProfileOpen ? 'active' : ''}`} 
              onClick={handleProfileToggle}
            >
              {userProfile?.profilePicture ? (
                <img 
                  src={`${BASE_IMAGE_URL}/${userProfile.profilePicture}`} 
                  alt="Profile" 
                  className="profile-pic"
                />
              ) : (
                <img src="/imgs/Profile.svg" alt="Profile" />
              )}
            </button>
            <div className={`profile-dropdown ${!isProfileOpen ? 'hidden' : ''}`}>
              {profileItems.map((item, index) => (
                <React.Fragment key={index}>
                  <Link to={item.path} className="profile-item">
                    <img 
                      src={item.icon} 
                      alt={`${item.label} icon`} 
                      className="profile-item-icon" 
                    />
                    {item.label}
                  </Link>
                  {index === 1 && <hr className="profile-separator" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

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
                    handleWishlistClick(item)();
                  }}
                />
              </div>
              <div className="price-container">
                <p className="item-price">{item.price}</p>
                <StarRating 
                  rating={ratings[item.id]}
                  onRatingChange={handleRatingChange(item.id)}
                />
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
                    onClick={handleWishlistClick(product)}
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