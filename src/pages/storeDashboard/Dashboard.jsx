import React from 'react';
import StoreDashboardLayout from './StoreDashboardLayout';
import StoreAnalytics from '../../components/storeDashboard/StoreAnalytics';

export default function Dashboard() {
  return (
    <StoreDashboardLayout activeTab="analytics">
      <StoreAnalytics />
    </StoreDashboardLayout>
  );
}
