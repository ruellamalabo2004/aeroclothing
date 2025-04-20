import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import pages
import Login from "./components/LoginContent/Login";
import Signup from "./components/LoginContent/Signup";
import ForgotPassword from "./components/LoginContent/ForgotPassword";
import AdminDashboard from "./components/AdminContent/AdminDashboard";
import Dashboard from "./components/AdminContent/Dashboard";
import Products from "./components/AdminContent/Products";
import Orders from "./components/AdminContent/Orders";
import Inventory from "./components/AdminContent/Inventory"; // Added Inventory
import Settings from "./components/AdminContent/Settings";
import Homepage from "./components/CustomerPage/Homepage";
import Customer from "./components/AdminContent/Customer";
import Users from "./components/AdminContent/Users";
import Transactions from "./components/AdminContent/Transactions";
import Inbox from "./components/AdminContent/Inbox";
import Reviews from "./components/AdminContent/Reviews";
import CustomerSupport from "./components/AdminContent/CustomerSupport";
import Reports from "./components/AdminContent/Reports";
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default Redirect to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Signup Route */}
        <Route path="/register" element={<Signup />} />

        {/* Forgot Password Route */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Homepage Route for regular users */}
        <Route path="/homepage" element={<Homepage />} />

        {/* Admin Dashboard Route with nested routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} /> {/* Updated to use Inventory component */}
          <Route path="customer" element={<Customer />} />
          <Route path="users" element={<Users/>} />
          <Route path="transaction" element={<Transactions />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="customer-support" element={<CustomerSupport />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

// Mount React App
if (document.getElementById("root")) {
  ReactDOM.render(<App />, document.getElementById("root"));
}

export default App;
export { App };