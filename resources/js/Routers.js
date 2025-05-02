import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './components/Notifs/CartContext';
import { WishlistProvider } from './components/Notifs/WishlistContext';

// Import pages
import Login from './components/LoginContent/Login';
import Signup from './components/LoginContent/Signup';
import ForgotPassword from './components/LoginContent/ForgotPassword';
import AdminDashboard from './components/AdminContent/AdminDashboard';
import Dashboard from './components/AdminContent/Dashboard';
import Products from './components/AdminContent/Products';
import Orders from './components/AdminContent/Orders';
import Inventory from './components/AdminContent/Inventory';
import AccountSettings from './components/AdminContent/AccountSettings';
import AdminSettings from './components/AdminContent/AdminSettings';
import Homepage from './components/CustomerPage/Homepage';
import Shop from './components/CustomerPage/Shop';
import Customer from './components/AdminContent/Customer';
import Users from './components/AdminContent/Users';
import Transactions from './components/AdminContent/Transactions';
import Inbox from './components/AdminContent/Inbox';
import Reviews from './components/AdminContent/Reviews';
import CustomerSupport from './components/AdminContent/CustomerSupport';
import Reports from './components/AdminContent/Reports';
import ProductMain from './components/CustomerPage/ProductMain';

// Import ProtectedRoute
import ProtectedRoute from './components/ProtectedRouters/ProtectedRoute';

const App = () => {
  return (
    <CartProvider>
      <WishlistProvider>
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

            {/* Shop Route for regular users */}
            <Route path="/shop" element={<Shop />} />

            {/* Product Route for individual product pages */}
            <Route path="/product/:productId" element={<ProductMain />} />

            {/* Admin Dashboard Route with nested routes, protected by role */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="customer" element={<Customer />} />
                <Route path="users" element={<Users />} />
                <Route path="transaction" element={<Transactions />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="inbox" element={<Inbox />} />
                <Route path="customer-support" element={<CustomerSupport />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Navigate to="settings/account" replace />} />
                <Route path="settings/account" element={<AccountSettings />} />
                <Route path="settings/admin" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
};

// Mount React App
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

export default App;
export { App };