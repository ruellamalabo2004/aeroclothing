import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/LoginArea/Login";
import Signup from "./components/LoginArea/Signup";
import Dashboard from "./components/AdminArea/Dashboard";
import Products from "./components/AdminArea/Products";
import Orders from "./components/AdminArea/Orders";
import Inventory from "./components/AdminArea/Inventory";
import Customers from "./components/AdminArea/Customers";
import Users from "./components/AdminArea/Users";
import Transactions from "./components/AdminArea/Transactions";
import Reviews from "./components/AdminArea/Reviews";
import Reports from "./components/AdminArea/Reports";
import HomePage from "./components/HeaderArea/HomePage"; 
import AdminSettings from "./components/AdminArea/AdminSettings"; 
import AccountSettings from "./components/AdminArea/AccountSettings"; 
import Profile from "./components/ProfileArea/Profile";
import Address from "./components/ProfileArea/Address";
import Changepassword from "./components/ProfileArea/Changepassword";
import Mywishlist from "./components/ProfileArea/Mywishlist";
import Myorders from "./components/ProfileArea/Myorders";
import Mycart from "./components/ProfileArea/Mycart";
import Checkout from "./components/OrderNav/Checkout";
import Shop from "./components/HeaderArea/Shop";
import OrderDetails from "./components/OrderNav/OrderDetails";
import OrderHistory from "./components/ProfileArea/OrderHistory"; // Import OrderHistory component
import ProductReview from "./components/ProductViews/ProductReview"; // Import ProductReview component
import ProductView from "./components/ProductViews/ProductView"; // Import ProductView component
import ForgotPassword from "./components/PasswordArea/ForgotPassword"; // Import ForgotPassword component
import ResetPassword from "./components/PasswordArea/ResetPassword"; // Import ResetPassword component

// 🔒 Protected Route Function
const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("token"); // Get token from localStorage
  const role = localStorage.getItem("role"); // Get user role

  if (!token) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />; // Redirect unauthorized users
  }

  return element;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Added ForgotPassword route */}
        <Route path="/reset-password" element={<ResetPassword />} /> {/* Added ResetPassword route */}

        {/* Customer Routes */}
        <Route
          path="/homepage"
          element={<ProtectedRoute element={<HomePage />} allowedRoles={["customer"]} />}
        />
         <Route
          path="/shop"
          element={<ProtectedRoute element={<Shop />} allowedRoles={["customer"]} />}
        />
          <Route
  path="/shop/:productId"
  element={<ProtectedRoute element={<ProductView />} allowedRoles={["customer"]} />}
/>
<Route
  path="/orders/:orderId/review"
  element={<ProtectedRoute element={<ProductReview />} allowedRoles={["customer"]} />}
/>
<Route
          path="/order-history" 
          element={<ProtectedRoute element={<OrderHistory />} allowedRoles={["customer"]} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute element={<Profile />} allowedRoles={["customer"]} />}
        />
        <Route
          path="/profile/address" 
          element={<ProtectedRoute element={<Address />} allowedRoles={["customer"]} />}
        />
        <Route
          path="/profile/change-password" 
          element={<ProtectedRoute element={<Changepassword />} allowedRoles={["customer"]} />}
        />
        <Route
          path="/profile/wishlist" 
          element={<ProtectedRoute element={<Mywishlist />} allowedRoles={["customer"]} />}
        />
        <Route
          path="/profile/orders" 
          element={<ProtectedRoute element={<Myorders />} allowedRoles={["customer"]} />}
        />
        <Route
    path="/my-orders/:orderId"
    element={<ProtectedRoute element={<OrderDetails />} allowedRoles={["customer"]} />}
  />
        <Route
          path="/checkout"
          element={<ProtectedRoute element={<Checkout />} allowedRoles={["customer"]} />} 
        />
        <Route
          path="/profile/cart" 
          element={<ProtectedRoute element={<Mycart />} allowedRoles={["customer"]} />}
        />

        {/* Admin Route & Nested Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["admin"]} />}>
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="users" element={<Users />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="reports" element={<Reports />} />
          <Route path="adminsettings" element={<AdminSettings />} />
          <Route path="accountsettings" element={<AccountSettings />} />
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