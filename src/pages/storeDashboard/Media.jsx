import React from 'react';
import StoreDashboardLayout from './StoreDashboardLayout';
import StoreMedia from '../../components/storeDashboard/StoreMedia';

export default function Media() {
  return (
    <StoreDashboardLayout activeTab="media">
      <StoreMedia />
    </StoreDashboardLayout>
  );
}
