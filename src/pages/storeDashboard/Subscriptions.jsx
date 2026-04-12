import React from 'react';
import StoreDashboardLayout from './StoreDashboardLayout';
import StoreSubscriptions from '../../components/storeDashboard/StoreSubscriptions';

export default function Subscriptions() {
  return (
    <StoreDashboardLayout activeTab="subscriptions">
      <StoreSubscriptions />
    </StoreDashboardLayout>
  );
}
