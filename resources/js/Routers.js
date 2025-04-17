import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import pages
import Login from "./components/LoginContent/Login";
import Signup from "./components/LoginContent/Signup";
import AdminDashboard from "./components/AdminContent/AdminDashboard";
import Dashboard from "./components/AdminContent/Dashboard";
import Products from "./components/AdminContent/Products"; // Import Products
import Homepage from "./components/CustomerPage/Homepage";

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

        {/* Homepage Route for regular users */}
        <Route path="/homepage" element={<Homepage />} />

        {/* Admin Dashboard Route with nested routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          {/* Add more nested routes for other admin sections as needed */}
          <Route path="orders" element={<div>Orders Page (Placeholder)</div>} />
          <Route path="inventory" element={<div>Inventory Page (Placeholder)</div>} />
          <Route path="customer" element={<div>Customer Page (Placeholder)</div>} />
          <Route path="users" element={<div>Users Page (Placeholder)</div>} />
          <Route path="transaction" element={<div>Transaction Page (Placeholder)</div>} />
          <Route path="reviews" element={<div>Reviews Page (Placeholder)</div>} />
          <Route path="inbox" element={<div>Inbox Page (Placeholder)</div>} />
          <Route path="customer-support" element={<div>Customer Support Page (Placeholder)</div>} />
          <Route path="reports" element={<div>Reports Page (Placeholder)</div>} />
          <Route path="settings" element={<div>Settings Page (Placeholder)</div>} />
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