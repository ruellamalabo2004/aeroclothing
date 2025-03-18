import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_URL = "http://127.0.0.1:8000/api";
const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

// Header Component (unchanged)
const Header = ({ userProfile, cartCount, handleLogout, handleProfileToggle, isProfileDropdownOpen }) => {
  const navigate = useNavigate();

  return (
    <header className="login-header">
      <div className="logo-container">
        <img src="/imgs/logo.svg" alt="Aero Logo" className="logo" />
      </div>
      <nav className="nav-links">
        <Link to="/homepage">HOME</Link>
        <Link to="/shop">SHOP</Link>
        <Link to="/about">ABOUT US</Link>
        <Link to="/support">SUPPORT</Link>
      </nav>
      <div className="header-icons">
        <div className="cart-icon-container">
          <img 
            src="/imgs/Cart.svg" 
            alt="Cart" 
            className="header-icon" 
            onClick={() => navigate('/cart')}
          />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </div>
        <div className="profile-container">
          <button
            className={`profile-button ${isProfileDropdownOpen ? 'active' : ''}`}
            onClick={handleProfileToggle}
          >
            {userProfile?.profile_pic ? (
              <img src={userProfile.profile_pic} alt="Profile" className="profile-pic" />
            ) : (
              <img src="/imgs/Profile.svg" alt="Profile" className="profile-pic" />
            )}
          </button>
          <div className={`profile-dropdown ${!isProfileDropdownOpen ? 'hidden' : ''}`}>
            <Link to="/profile" className="profile-item">My Profile</Link>
            <Link to="/profile/orders" className="profile-item">My Orders</Link>
            <hr className="profile-separator" />
            <button className="profile-item" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Footer Component (unchanged)
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/customer/support/order-payment">ORDERS & PAYMENTS</Link>
          <Link to="/customer/support/shipping">SHIPPING</Link>
          <Link to="/customer/support/returns">RETURNS</Link>
          <Link to="/customer/support/contact-us">CONTACT US</Link>
          <Link to="/customer/support/terms-and-service">TERMS AND SERVICES</Link>
          <Link to="/customer/support/faqs">FAQS</Link>
        </div>
      </div>
      <div className="footer-copyright">
        <p>@2025 AERO. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

// Checkout Component
const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card"); // Default payment method

  // Available payment methods (can be fetched from an API if dynamic)
  const paymentOptions = [
    { value: "Credit Card", label: "Credit Card" },
    { value: "PayPal", label: "PayPal" },
    { value: "Cash on Delivery", label: "Cash on Delivery" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfile(token);
  }, [navigate]);

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = response.data.profile;
      const user = {
        id: response.data.user.id,
        first_name: profileData.first_name || "",
        profile_pic: profileData.profile_pic
          ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
          : "/imgs/Profile.svg",
      };

      setUserProfile(user);
      fetchCart(token);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
    }
  };

  const fetchCart = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const cartData = response.data?.data || [];
      if (!Array.isArray(cartData)) {
        throw new Error("Invalid cart data received");
      }

      const formattedCartItems = cartData.map((item) => ({
        id: item.id,
        productName: item.product_name || item.name || "Unknown Product", // Adjust based on API
        price: item.price || 0,
        quantity: item.quantity || 1,
      }));

      console.log("Formatted Cart Items:", formattedCartItems); // Debug log
      setCartItems(formattedCartItems);
    } catch (error) {
      console.error("Fetch Cart Error:", error);
      setError("Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const newTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(newTotal);
  }, [cartItems]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/orders`,
        {
          shipping_id: 1, // You might want to make this dynamic later
          payment_method: paymentMethod,
          cart_items: cartItems.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      alert("Checkout successful!");
      setCartItems([]);
      setTotalPrice(0);
      navigate("/orders");
    } catch (error) {
      console.error("Checkout error:", error.response?.data || error.message);
      const errorMsg =
        error.response?.data?.message || "Checkout failed. Please try again.";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setCartItems([]);
    navigate("/login");
  };

  const handleProfileToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="Checkout">
      <Header
        userProfile={userProfile}
        cartCount={cartCount}
        handleLogout={handleLogout}
        handleProfileToggle={handleProfileToggle}
        isProfileDropdownOpen={isProfileDropdownOpen}
      />

      <div className="checkout-content" style={{ padding: "20px" }}>
        <h2>Checkout</h2>

        {loading && <p>Loading cart...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && cartItems.length === 0 ? (
          <p>No items to checkout.</p>
        ) : (
          !loading &&
          !error && (
            <>
              {/* Cart Items */}
              <div className="cart-items" style={{ marginBottom: "20px" }}>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="cart-item"
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <p>
                      <strong>{item.productName}</strong>
                    </p>
                    <p>Price: ₱{item.price.toFixed(2)}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Subtotal: ₱{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Payment Method Selection */}
              <div className="payment-methods" style={{ marginBottom: "20px" }}>
                <h3>Select Payment Method</h3>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ padding: "5px", fontSize: "16px" }}
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total and Checkout Button */}
              <h3>Total: ₱{totalPrice.toFixed(2)}</h3>
              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: loading ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Processing..." : "Confirm Checkout"}
              </button>
            </>
          )
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;