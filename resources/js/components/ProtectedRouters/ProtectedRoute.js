import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ requiredRole }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  let userRole = null;

  if (userData) {
    const user = JSON.parse(userData);
    userRole = user.role;
  }

  // If no token or user data, redirect to login
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  // If requiredRole is specified and user role doesn't match, redirect to login
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // If all checks pass, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;