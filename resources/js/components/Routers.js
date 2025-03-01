import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Products from "./Products";
import Orders from "./Orders";
import Inventory from "./Inventory";
import Customers from "./Customers";
import Coupons from "./Coupons";
import Users from "./Users";
import Transactions from "./Transactions";
import Brand from "./Brand"; 
import Inbox from "./Inbox";
import Reviews from "./Reviews";
import Reports from "./Reports";
import HomePage from "./HomePage"; // For customers

// Create a Static Landing Page Component
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Slider from 'react-slick'; // Import react-slick
import 'slick-carousel/slick/slick.css'; // Import slick-carousel CSS
import 'slick-carousel/slick/slick-theme.css'; // Import slick-carousel theme CSS

const LandingPage = () => {
  const navigate = useNavigate(); // Initialize navigate hook

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to /login on click
  };

  // Slider settings for react-slick
  const sliderSettings = {
    dots: true, // Show navigation dots
    infinite: true, // Infinite loop
    speed: 500, // Transition speed
    slidesToShow: 1, // Show one slide at a time
    slidesToScroll: 1, // Scroll one slide at a time
    autoplay: true, // Auto-play slides
    autoplaySpeed: 3000, // Auto-play speed (3 seconds)
    arrows: true, // Show navigation arrows
  };

  return (
    <div className="landing-page">
      <header className="login-header">
        <div className="logo-container">
          <img src="/imgs/logo.svg" alt="Logo" className="logo" />
        </div>
        <nav className="nav-links">
          <a href="#home">HOME</a>
          <a href="#shop">SHOP</a>
          <a href="#about">ABOUT US</a>
          <a href="#support" className="support-link">SUPPORT</a>
        </nav>
        <div className="header-icons">
          <img src="/imgs/Search.svg" alt="Search" className="header-icon" />
          <img src="/imgs/Wish.svg" alt="Wishlist" className="header-icon" />
          <img src="/imgs/Cart.svg" alt="Cart" className="header-icon" />
          <button className="login-button" onClick={handleLoginClick}>
            Login
          </button>
        </div>
      </header>
      <div className="slider-container">
        <Slider {...sliderSettings}>
          <div>
            <img
              src="/imgs/slider1.svg" // Your first clothing image
              alt="Clothing 1"
              className="slider-image"
            />
          </div>
          <div>
            <img
              src="/imgs/slider2.svg" // Add more clothing images as needed
              alt="Clothing 2"
              className="slider-image"
            />
          </div>
          <div>
            <img
              src="/imgs/slider3.svg" // Add more clothing images as needed
              alt="Clothing 3"
              className="slider-image"
            />
          </div>
        </Slider>
      </div>
      
    </div>
  );
};

// 🔒 Protected Route Function
const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("token"); // Get token from localStorage
  const role = localStorage.getItem("role"); // Get user role

  if (!token) {
    return <Navigate to="/login" replace />; // Redirect if not logged in
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />; // Redirect if role is not allowed
  }

  return element;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Static Landing Page Route */}
        <Route path="/" element={<LandingPage />} /> {/* Landing page is shown on '/' */}

        {/* Customer Route */}
        <Route path="/home" element={<ProtectedRoute element={<HomePage />} allowedRoles={["customer"]} />} />  {/* Customer homepage is '/home' */}

        {/* Admin Route & Nested Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["admin"]} />}>
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="users" element={<Users />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="brand" element={<Brand />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
};

// Mount React App
if (document.getElementById("root")) {
  ReactDOM.render(<App />, document.getElementById("root"));
}

export default App;
