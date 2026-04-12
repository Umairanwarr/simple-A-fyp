import React from 'react';
import StoreDashboardLayout from './StoreDashboardLayout';
import StoreOrders from '../../components/storeDashboard/StoreOrders';

export default function Orders() {
  return (
    <StoreDashboardLayout activeTab="orders">
      <StoreOrders />
    </StoreDashboardLayout>
  );
}
