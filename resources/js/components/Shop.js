import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import { RiHeart3Line } from 'react-icons/ri'; // For wishlist heart icon

const Shop = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [filters, setFilters] = useState({
    productType: [],
    size: [],
    color: [],
    brand: [],
  });

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

  // Sample products (placeholder)
  const sampleProducts = [
    { id: 1, name: 'Green Polo Shirt for Men', price: 599.00, category: 'Tops', type: 'Polos', size: 'Medium', color: 'Grey', brand: 'Uniqlo', rating: 5, imagePreview: '/imgs/polo-grey.jpg' },
    { id: 2, name: 'Green Polo Shirt for Men', price: 599.00, category: 'Tops', type: 'Polos', size: 'Large', color: 'Blue', brand: 'Uniqlo', rating: 5, imagePreview: '/imgs/polo-blue.jpg' },
    { id: 3, name: 'Green Polo Shirt for Men', price: 599.00, category: 'Tops', type: 'Polos', size: 'Medium', color: 'Camo', brand: 'Uniqlo', rating: 5, imagePreview: '/imgs/polo-camo.jpg' },
    { id: 4, name: 'Green Polo Shirt for Men', price: 599.00, category: 'Tops', type: 'Polos', size: 'Large', color: 'Brown', brand: 'Uniqlo', rating: 5, imagePreview: '/imgs/polo-brown.jpg' },
    { id: 5, name: 'Green Polo Shirt for Men', price: 599.00, category: 'Tops', type: 'Polos', size: 'Small', color: 'Brown', brand: 'Uniqlo', rating: 5, imagePreview: '/imgs/polo-brown.jpg' },
    { id: 6, name: 'Green Polo Shirt for Men', price: 599.00, category: 'Tops', type: 'Polos', size: 'Medium', color: 'Camo', brand: 'Uniqlo', rating: 5, imagePreview: '/imgs/polo-camo.jpg' },
    { id: 7, name: 'Green Polo Shirt for Men', price: 599.00, category: 'Tops', type: 'Polos', size: 'Large', color: 'Blue', brand: 'Uniqlo', rating: 5, imagePreview: '/imgs/polo-blue.jpg' },
    { id: 8, name: 'Green Polo Shirt for Men', price: 599.00, category: 'Tops', type: 'Polos', size: 'Medium', color: 'Grey', brand: 'Uniqlo', rating: 5, imagePreview: '/imgs/polo-grey.jpg' },
  ];

  // Filter options (placeholder)
  const filterOptions = {
    productType: ['T-Shirts', 'Shirts', 'Polos', 'Long-Sleeve'],
    size: ['Extra-Small', 'Small', 'Medium', 'Large', 'Extra-Large'],
    color: ['Black', 'White', 'Red', 'Orange', 'Pink', 'Grey', 'Blue', 'Camo', 'Brown'],
    brand: ['Nike', 'Adidas', 'New Balance', 'Guess', 'Uniqlo'],
  };

  const notifications = [
    { id: 1, message: "Your order #1234 has been shipped!", time: "2 hours ago" },
    { id: 2, message: "New collection available now!", time: "5 hours ago" },
  ];

  const supportItems = [
    { label: "ORDER & PAYMENT", path: "/customer/support/order-payment" },
    { label: "SHIPPING", path: "/customer/support/shipping" },
  ];

  const profileDropdownItems = [
    { label: "My Profile", path: "/profile" },
    { label: "My Orders", path: "/profile/orders" },
    { label: "Logout", path: "#", onClick: handleLogout },
  ];

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const profileResponse = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) {
          const profileData = profileResponse.data.profile;
          const user = {
            id: profileResponse.data.user.id,
            first_name: profileData.first_name || '',
            email: profileResponse.data.user?.email || '',
            profile_pic: profileData.profile_pic
              ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
              : '/imgs/Profile.svg',
          };
          setUserProfile(user);
          await Promise.all([fetchCart(token, user.id), fetchWishlist(token, user.id)]);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (mounted) {
          setError("Failed to load shop data. Please try again.");
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [navigate]);

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
      console.error("Error fetching cart:", error);
    }
  };

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
      console.error("Error fetching wishlist:", error);
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
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart(token, userId);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleAddToCart = (product) => async () => {
    await addToCart(product);
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
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    try {
      await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart(token, userId);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const handleWishlistToggle = (product) => async () => {
    const token = localStorage.getItem('token');
    const userId = userProfile?.id;
    const isWishlisted = wishlistedItems.some((item) => item.id === product.id);
    try {
      if (isWishlisted) {
        await axios.delete(`${API_URL}/wishlist/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/wishlist`, {
          user_id: userId,
          product_id: product.id,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchWishlist(token, userId);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const updatedFilter = prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value];
      return { ...prev, [filterType]: updatedFilter };
    });
  };

  const filterProducts = (products) => {
    let filteredProducts = [...products];

    if (filters.productType.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.productType.includes(product.type)
      );
    }

    if (filters.size.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.size.includes(product.size)
      );
    }

    if (filters.color.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.color.includes(product.color)
      );
    }

    if (filters.brand.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.brand.includes(product.brand)
      );
    }

    if (sortBy) {
      filteredProducts.sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
    }

    return filteredProducts;
  };

  const handleSortChange = (e) => setSortBy(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Placeholder for search functionality
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
      setCartItems([]);
      setWishlistedItems([]);
      navigate('/login');
      setIsProfileDropdownOpen(false);
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistedItems.length;

  if (loading) return <div>Loading shop...</div>;
  if (error) return <div>{error}</div>;

  const filteredProducts = filterProducts(sampleProducts);

  return (
    <div className="shop-page">
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
        <div className="shop-content">
          <div className="filter-sidebar">
            <h2>Filter</h2>
            <div className="filter-group">
              <h3>PRODUCT TYPE</h3>
              {filterOptions.productType.map(type => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={filters.productType.includes(type)}
                    onChange={() => handleFilterChange('productType', type)}
                  />
                  {type}
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h3>SIZE</h3>
              {filterOptions.size.map(size => (
                <label key={size}>
                  <input
                    type="checkbox"
                    checked={filters.size.includes(size)}
                    onChange={() => handleFilterChange('size', size)}
                  />
                  {size}
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h3>COLOR</h3>
              {filterOptions.color.map(color => (
                <label key={color}>
                  <input
                    type="checkbox"
                    checked={filters.color.includes(color)}
                    onChange={() => handleFilterChange('color', color)}
                  />
                  {color}
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h3>BRAND</h3>
              {filterOptions.brand.map(brand => (
                <label key={brand}>
                  <input
                    type="checkbox"
                    checked={filters.brand.includes(brand)}
                    onChange={() => handleFilterChange('brand', brand)}
                  />
                  {brand}
                </label>
              ))}
            </div>
          </div>
          <div className="product-section">
            <div className="sort-section">
              <label htmlFor="sort-by">SORT BY</label>
              <select id="sort-by" value={sortBy} onChange={handleSortChange}>
                <option value="">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
            <div className="product-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <img src={product.imagePreview} alt={product.name} />
                      <RiHeart3Line
                        className={`wishlist-icon ${wishlistedItems.some(w => w.id === product.id) ? 'wishlisted' : ''}`}
                        onClick={handleWishlistToggle(product)}
                      />
                    </div>
                    <h3>{product.name}</h3>
                    <p className="price">₱{product.price.toFixed(2)}</p>
                    <div className="rating">
                      {[...Array(product.rating)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <button className="add-to-cart" onClick={handleAddToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                ))
              ) : (
                <p>No products match your filters.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;