import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { clearRoleSession, hasValidRoleSession } from '../../utils/authSession';

export default function RequireRoleAuth({
  children,
  tokenKey,
  userKey,
  expectedRole,
  redirectTo = '/signin'
}) {
  const location = useLocation();

  const isValidSession = hasValidRoleSession({ tokenKey, userKey, expectedRole });

  if (!isValidSession) {
    clearRoleSession({ tokenKey, userKey });
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  return children;
}
