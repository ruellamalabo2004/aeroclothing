import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../HeaderNav/Header';
import Footer from '../FooterNav/Footer';
import CartSidebar from './CartSidebar';

// ⭐ Rating Display Component (Read-Only)
const RatingDisplay = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <div className="rating">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="rating-star full">★</span>
      ))}
      {halfStar ? <span className="rating-star half">★</span> : null}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="rating-star empty">☆</span>
      ))}
    </div>
  );
};

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [latestWishlistItem, setLatestWishlistItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [ratings, setRatings] = useState({}); // ⭐ Store average ratings

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

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

        const categoryResponse = await axios.get(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const categoryData = Array.isArray(categoryResponse.data) ? categoryResponse.data : categoryResponse.data.data || [];
        console.log("Categories Fetched:", categoryData);
        setCategories(categoryData);

        // Fetch all products with pagination handling
        let allProducts = [];
        let page = 1;
        let hasMorePages = true;

        while (hasMorePages) {
          const productResponse = await axios.get(`${API_URL}/products?page=${page}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`Raw Product API Response (Page ${page}):`, productResponse.data);

          const productsData = Array.isArray(productResponse.data)
            ? productResponse.data
            : productResponse.data.data || [];
          allProducts = [...allProducts, ...productsData];

          const { current_page, last_page } = productResponse.data;
          if (current_page && last_page) {
            hasMorePages = current_page < last_page;
            page++;
          } else {
            hasMorePages = false;
          }
        }

        const updatedProducts = allProducts
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((product) => ({
            ...product,
            imagePreview: product.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : "/default-image.jpg",
            productName: product.name || product.title || product.product_name || "Unnamed Product",
            category: categoryData.find(cat => cat.id === product.category_id)?.name || 'Uncategorized',
          }));

        // ⭐ Fetch ratings for each product
        const ratingsData = {};
        await Promise.all(
          updatedProducts.map(async (product) => {
            try {
              const reviewsResponse = await axios.get(`${API_URL}/reviews/${product.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const reviews = reviewsResponse.data || [];
              const averageRating = reviews.length
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                : 0;
              ratingsData[product.id] = averageRating;
            } catch (error) {
              console.error(`Error fetching reviews for product ${product.id}:`, error);
              ratingsData[product.id] = 0; // Default to 0 if fetch fails
            }
          })
        );

        console.log("All Mapped Products:", updatedProducts);
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
        setRatings(ratingsData);

        const notificationResponse = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Raw Notification API Response:", notificationResponse.data);
        const notificationData = Array.isArray(notificationResponse.data)
          ? notificationResponse.data
          : notificationResponse.data.data || [];
        setNotifications(notificationData);

        await Promise.all([
          fetchWishlist(token, user.id),
          fetchCart(token, user.id),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
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
        size: item.size || "Not specified",
        color: item.color || "Not specified",
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
      await axios.post(`${API_URL}/wishlist`, {
        user_id: userId,
        product_id: product.id,
      }, { headers: { Authorization: `Bearer ${token}` } });
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
      await axios.post(`${API_URL}/cart/add`, {
        user_id: userId,
        product_id: product.id,
        qty: 1,
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

  const handleWishlistToggle = (product) => async (e) => {
    e.stopPropagation();
    const isWishlisted = wishlistedItems.some((item) => item.id === product.id);
    if (isWishlisted) await removeFromWishlist(product.id);
    else await addToWishlist(product);
  };

  const handleImageClick = (productId) => () => {
    navigate(`/shop/${productId}`);
  };

  useEffect(() => {
    if (latestWishlistItem) {
      const timer = setTimeout(() => setLatestWishlistItem(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [latestWishlistItem]);

  const wishlistCount = wishlistedItems.length;
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handlePriceRangeChange = (e) => {
    const [min, max] = e.target.value.split(',').map(Number);
    setPriceRange([min, max]);
  };

  useEffect(() => {
    let updatedProducts = [...products];
    console.log("Before Filtering:", updatedProducts.length);

    if (filterCategory !== 'all') {
      updatedProducts = updatedProducts.filter(product =>
        product.category && product.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    updatedProducts = updatedProducts.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (sortOption === 'price-low-high') {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high-low') {
      updatedProducts.sort((a, b) => b.price - a.price);
    } else {
      updatedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    console.log("After Filtering:", updatedProducts.length);
    setFilteredProducts(updatedProducts);
  }, [products, sortOption, filterCategory, priceRange]);

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
        isCartVisible={isCartVisible}
        setIsCartVisible={setIsCartVisible}
        cartCount={cartCount}
        userProfile={userProfile}
      />
      <CartSidebar
        isCartVisible={isCartVisible}
        setIsCartVisible={setIsCartVisible}
        cartItems={cartItems}
        cartCount={cartCount}
        increaseCartQuantity={(itemId) => setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item))}
        decreaseCartQuantity={(itemId) => setCartItems(prev => prev.map(item => item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item))}
        removeFromCart={removeFromCartBackend}
        navigate={navigate}
      />
      <div className="shop-container">
        <div className="shop-layout">
          <aside className="shop-filters">
            <h3>Filters</h3>
            <div className="filter-section">
              <label htmlFor="category">Category</label>
              <select id="category" value={filterCategory} onChange={handleCategoryFilterChange}>
                <option value="all">All</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name.toLowerCase()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-section">
              <label>Price Range: ₱{priceRange[0]} - ₱{priceRange[1]}</label>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              />
            </div>
          </aside>
          <main className="shop-main">
            <h1 className="shop-title">Shop</h1>
            <div className="sort-section">
              <label htmlFor="sort">Sort by: </label>
              <select id="sort" value={sortOption} onChange={handleSortChange}>
                <option value="default">Default</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
            <section className="products-section">
              <div className="new-product-image-containers">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="product-container">
                      <div className="product-card">
                        <img
                          src={product.imagePreview || '/default-image.jpg'}
                          alt={product.productName || 'Product'}
                          onClick={handleImageClick(product.id)}
                          style={{ cursor: 'pointer' }}
                        />
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
                      <RatingDisplay rating={ratings[product.id] || 0} /> {/* ⭐ Added RatingDisplay */}
                      <p className="product-price">₱{product.price || "N/A"}</p>
                    </div>
                  ))
                ) : (
                  <p>No products available for this category or price range.</p>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;