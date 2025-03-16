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
import Users from "./Users";
import Transactions from "./Transactions";
import Reviews from "./Reviews";
import Reports from "./Reports";
import HomePage from "./HomePage"; 
import AdminSettings from "./AdminSettings"; 
import Profile from "./Profile";
import Address from "./Address";
import Changepassword from "./Changepassword";
import Mywishlist from "./Mywishlist";
import Myorders from "./Myorders";
import Mycart from "./Mycart";

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

        {/* Customer Routes */}
        <Route
          path="/homepage"
          element={<ProtectedRoute element={<HomePage />} allowedRoles={["customer"]} />}
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
