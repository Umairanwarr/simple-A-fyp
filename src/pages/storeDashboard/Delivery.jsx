import React from 'react';
import StoreDashboardLayout from './StoreDashboardLayout';
import StoreDelivery from '../../components/storeDashboard/StoreDelivery';

export default function Delivery() {
  return (
    <StoreDashboardLayout activeTab="delivery">
      <StoreDelivery />
    </StoreDashboardLayout>
  );
}
