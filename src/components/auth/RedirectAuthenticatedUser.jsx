import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthenticatedDashboardPathByRoles } from '../../utils/authSession';

export default function RedirectAuthenticatedUser({ children, roles = [] }) {
  const dashboardPath = getAuthenticatedDashboardPathByRoles(roles);

  if (dashboardPath) {
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}
