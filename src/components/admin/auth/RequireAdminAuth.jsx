import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAdminAuth({ children }) {
  const location = useLocation();
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
