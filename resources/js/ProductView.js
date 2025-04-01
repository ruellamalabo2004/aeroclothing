import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import CartSidebar from "./CartSidebar";

const ProductView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const API_URL = "http://127.0.0.1:8000/api";

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

  const notifications = [
    { id: 1, message: "Your order #1234 has been shipped!", time: "2 hours ago" },
    { id: 2, message: "New collection available now!", time: "5 hours ago" },
    { id: 3, message: "20% off sale ends tomorrow!", time: "1 day ago" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [productResponse, profileResponse, wishlistResponse, cartResponse] = await Promise.all([
          axios.get(`${API_URL}/products/${productId}`, config),
          axios.get(`${API_URL}/profile`, config),
          axios.get(`${API_URL}/wishlist`, config),
          axios.get(`${API_URL}/cart`, config),
        ]);

        // Product Data
        if (!productResponse.data || Object.keys(productResponse.data).length === 0) {
          throw new Error("No product data returned");
        }
        setProduct(productResponse.data);
        setSelectedSize(productResponse.data.sizes?.[0] || "");
        setSelectedColor(productResponse.data.colors?.[0] || "");

        // User Profile
        const profileData = profileResponse.data.profile;
        const user = {
          id: profileResponse.data.user.id,
          first_name: profileData.first_name || "",
          middle_name: profileData.middle_name || "",
          last_name: profileData.last_name || "",
          suffix: profileData.suffix || "",
          email: profileResponse.data.user?.email || "",
          phone_number: profileData.phone_number || "",
          gender: profileData.gender || "",
          date_of_birth: profileData.date_of_birth || "",
          profile_pic: profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : "/imgs/Profile.svg",
        };
        setUserProfile(user);

        // Wishlist
        const wishlistData = wishlistResponse.data.data || wishlistResponse.data || []; // Fallback to empty array
        console.log("Wishlist Data:", wishlistData); // Debug log
        const detailedWishlist = wishlistData.map(item => ({
          id: item.product_id,
          productName: item.product?.product_name || "Unknown Product",
          price: item.product?.price || 0,
          imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : "/default-image.jpg",
          created_at: item.created_at || new Date().toISOString(),
        }));
        setWishlistedItems(detailedWishlist);
        setIsWishlisted(detailedWishlist.some(item => item.id === parseInt(productId))); // Safely set isWishlisted

        // Cart
        const cartData = cartResponse.data.data || cartResponse.data || []; // Fallback to empty array
        const detailedCart = cartData.map(item => ({
          id: item.product_id,
          productName: item.product?.product_name || "Unknown Product",
          price: item.product?.price || 0,
          imagePreview: item.product?.image_1 ? `${BASE_IMAGE_URL}/${item.product.image_1}` : "/default-image.jpg",
          quantity: item.quantity || 1,
        }));
        setCartItems(detailedCart);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load product");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [productId, navigate]);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleSizeSelect = (size) => setSelectedSize(size);
  const handleColorSelect = (color) => setSelectedColor(color);

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem("token");
    const userId = userProfile?.id;
    if (!token || !userId) return;

    try {
      if (isWishlisted) {
        await axios.delete(`${API_URL}/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistedItems(prev => prev.filter(item => item.id !== parseInt(productId)));
      } else {
        await axios.post(
          `${API_URL}/wishlist`,
          { user_id: userId, product_id: productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistedItems(prev => [
          {
            id: parseInt(productId),
            productName: product.product_name,
            price: product.price,
            imagePreview: product.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : "/default-image.jpg",
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      setIsWishlisted(prev => !prev);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const userId = userProfile?.id;
    if (!token || !userId) return;

    try {
      await axios.post(
        `${API_URL}/cart/add`,
        { user_id: userId, product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newCartItem = {
        id: parseInt(productId),
        productName: product.product_name,
        price: product.price,
        imagePreview: product.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : "/default-image.jpg",
        quantity,
      };
      setCartItems(prev => {
        const existing = prev.find(item => item.id === newCartItem.id);
        if (existing) {
          return prev.map(item =>
            item.id === newCartItem.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        return [...prev, newCartItem];
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleBuyNow = () => {
    navigate("/checkout", { state: { product, quantity, selectedSize, selectedColor } });
  };

  const increaseCartQuantity = (itemId) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseCartQuantity = (itemId) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const removeFromCart = (itemId) => async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setWishlistedItems([]);
      setCartItems([]);
      navigate("/login");
      setIsProfileDropdownOpen(false);
    }
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest(".notification-container") && !e.target.closest(".header-icon")) setIsNotificationOpen(false);
    if (!e.target.closest(".wishlist-container") && !e.target.closest(".header-icon")) setIsWishlistOpen(false);
    if (!e.target.closest(".support-container") && !e.target.closest(".support-link")) setIsSupportOpen(false);
    if (!e.target.closest(".cart-sidebar") && !e.target.closest(".header-icon")) setIsCartVisible(false);
    if (!e.target.closest(".profile-container") && !e.target.closest(".profile-button")) setIsProfileDropdownOpen(false);
  };

  useEffect(() => {
    if (isNotificationOpen || isWishlistOpen || isSupportOpen || isCartVisible || isProfileDropdownOpen) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isNotificationOpen, isWishlistOpen, isSupportOpen, isCartVisible, isProfileDropdownOpen]);

  if (!product && !error) return <div className="spinner">Loading...</div>;
  if (error) return <p className="error-message">{error}</p>;

  const imageUrl = product?.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : "https://via.placeholder.com/150";
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistedItems.length;

  return (
    <div className="ProductView">
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
        handleWishlistToggle={(product) => handleWishlistToggle} // Pass the function directly
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
      <div className="product-view">
        <div className="product-section">
          <div className="image-container">
            <img src={imageUrl} alt={product?.product_name} className="product-image" />
          </div>
          <div className="details-container">
            <h1 className="product-name">{product?.product_name || "Unnamed Product"}</h1>
            <p className="product-price">₱{product?.price ?? "N/A"}</p>

            <div className="option-container">
              <label className="label">Color</label>
              <div className="color-container">
                {product?.colors?.length > 0 ? (
                  product.colors.map((color) => (
                    <button
                      key={color}
                      className={`color-button ${selectedColor === color ? "selected" : ""}`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    />
                  ))
                ) : (
                  <div className="color-box">N/A</div>
                )}
              </div>
            </div>

            <div className="option-container">
              <label className="label">Size</label>
              <div className="size-container">
                {product?.sizes?.length > 0 ? (
                  product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-button ${selectedSize === size ? "selected" : ""}`}
                      onClick={() => handleSizeSelect(size)}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <span>No sizes available</span>
                )}
              </div>
            </div>

            <div className="option-container">
              <label className="label">Quantity</label>
              <div className="quantity-container">
                <button className="quantity-button" onClick={decreaseQuantity}>-</button>
                <span className="quantity">{quantity}</span>
                <button className="quantity-button" onClick={increaseQuantity}>+</button>
              </div>
            </div>

            <div className="button-container">
              <button className="add-to-cart-button" onClick={handleAddToCart}>
                Add to cart - ₱{(product?.price * quantity).toFixed(2) || "N/A"}
              </button>
              <button className="buy-now-button" onClick={handleBuyNow}>
                BUY IT NOW
              </button>
            </div>

            <button className="wishlist-button" onClick={handleWishlistToggle}>
              <span className="heart-icon">{isWishlisted ? "❤️" : "♡"}</span> Add to Wishlist
            </button>
          </div>
        </div>

        <div className="description-section">
          <h2 className="description-title">Description</h2>
          <p className="description-text">{product?.description || "No description available."}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductView;
