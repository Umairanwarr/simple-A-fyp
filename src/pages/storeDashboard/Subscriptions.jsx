import React from 'react';
import StoreDashboardLayout from './StoreDashboardLayout';
import SubscriptionManager from '../../components/storeDashboard/SubscriptionManager';

export default function Subscriptions() {
  return (
    <StoreDashboardLayout activeTab="subscriptions">
      <SubscriptionManager />
    </StoreDashboardLayout>
  );
}
