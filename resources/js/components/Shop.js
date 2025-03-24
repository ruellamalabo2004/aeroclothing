import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from './CartSidebar';

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]); // New state for categories
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [latestWishlistItem, setLatestWishlistItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);

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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user profile
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

    // Fetch categories
    axios
      .get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const categoryData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setCategories(categoryData);
        console.log("API Response for Categories:", categoryData);

        // Fetch products
        axios
          .get(`${API_URL}/products`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            console.log("API Response for Products:", response.data);
            const products = Array.isArray(response.data) ? response.data : response.data.data || [];
            const updatedProducts = products
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((product) => {
                // Map category_id to category name
                const category = categoryData.find(cat => cat.id === product.category_id);
                return {
                  ...product,
                  imagePreview: product.image_1
                    ? `${BASE_IMAGE_URL}/${product.image_1}`
                    : "/default-image.jpg",
                  productName: product.name || product.title || product.product_name || "Unnamed Product",
                  category: category ? category.name : 'Uncategorized', // Use category name
                };
              });
            setProducts(updatedProducts);
            setFilteredProducts(updatedProducts);
          })
          .catch((error) => {
            console.error("Error fetching products:", error);
            if (error.response?.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              navigate('/login');
            }
          });
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, [navigate, BASE_IMAGE_URL]);

  const fetchWishlist = async (token, userId) => {
    try {
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wishlistData = response.data.data || response.data || [];
      const detailedWishlist = wishlistData.map(item => ({
        id: item.product_id,
        productName: item.product?.product_name || "Unknown Product",
        price: item.product?.price || 0,
        imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : '/default-image.jpg',
      }));
      setWishlistedItems(detailedWishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error.response?.data || error.message);
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
      setLatestWishlistItem({
        id: product.id,
        productName: product.productName,
        price: product.price,
        imagePreview: product.imagePreview,
      });
      fetchWishlist(token, userId);
    } catch (error) {
      console.error("Error adding to wishlist:", error.response?.data || error.message);
      if (error.response?.status === 409) fetchWishlist(token, userId);
    }
  };

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    try {
      await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWishlist(token, userId);
    } catch (error) {
      console.error("Error removing from wishlist:", error.response?.data || error.message);
    }
  };

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

  const handleAddToCart = (product) => async (e) => {
    e.stopPropagation();
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

  const handleWishlistToggle = (product) => async (e) => {
    e.stopPropagation();
    const isWishlisted = wishlistedItems.some((item) => item.id === product.id);
    if (isWishlisted) await removeFromWishlist(product.id);
    else await addToWishlist(product);
  };

  useEffect(() => {
    if (latestWishlistItem) {
      const timer = setTimeout(() => setLatestWishlistItem(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [latestWishlistItem]);

  const wishlistCount = wishlistedItems.length;

  const handleBuyNow = (product) => (e) => {
    e.stopPropagation();
    navigate('/checkout', { state: { cartItems: [{ ...product, quantity: 1 }] } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implement search functionality if needed
  };

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

  const handleItemClick = (item) => {
    navigate(`/customer/item/${item.id}`, { state: { item } });
  };

  // Sorting and Filtering Logic
  useEffect(() => {
    let updatedProducts = [...products];

    // Apply category filter
    if (filterCategory !== 'all') {
      updatedProducts = updatedProducts.filter(product => 
        product.category && product.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Apply price range filter
    updatedProducts = updatedProducts.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    if (sortOption === 'price-low-high') {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high-low') {
      updatedProducts.sort((a, b) => b.price - a.price);
    } else {
      // Default sorting (by date, newest first)
      updatedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredProducts(updatedProducts);
  }, [products, sortOption, filterCategory, priceRange]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handlePriceRangeChange = (e) => {
    setPriceRange([parseInt(e.target.value.split(',')[0]), parseInt(e.target.value.split(',')[1])]);
  };

  return (
    <div className="Shop">
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
      <div className="shop-container">
        <h1 className="shop-title">Shop</h1>
        <div className="shop-controls">
          <div className="sort-filter">
            <label htmlFor="sort">Sort by: </label>
            <select id="sort" value={sortOption} onChange={handleSortChange}>
              <option value="default">Default</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </div>
          <div className="sort-filter">
            <label htmlFor="category">Filter by Category: </label>
            <select id="category" value={filterCategory} onChange={handleCategoryFilterChange}>
              <option value="all">All</option>
              {categories.map(category => (
                <option key={category.id} value={category.name.toLowerCase()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sort-filter">
            <label>Price Range: ₱{priceRange[0]} - ₱{priceRange[1]}</label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
              style={{ width: '100%' }}
            />
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <section className="top-selling-section">
          <div className="new-product-image-containers">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-container" onClick={() => handleItemClick(product)}>
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
              <p>No products available for this category or price range.</p>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;