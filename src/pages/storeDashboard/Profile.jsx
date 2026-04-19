import React from 'react';
import StoreDashboardLayout from './StoreDashboardLayout';
import StoreProfile from '../../components/storeDashboard/StoreProfile';

export default function Profile() {
  return (
    <StoreDashboardLayout activeTab="profile">
      <StoreProfile />
    </StoreDashboardLayout>
  );
}
