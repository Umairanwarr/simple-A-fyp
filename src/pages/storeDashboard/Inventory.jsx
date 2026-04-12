import React from 'react';
import StoreDashboardLayout from './StoreDashboardLayout';
import StoreInventory from '../../components/storeDashboard/StoreInventory';

export default function Inventory() {
  return (
    <StoreDashboardLayout activeTab="inventory">
      <StoreInventory />
    </StoreDashboardLayout>
  );
}
