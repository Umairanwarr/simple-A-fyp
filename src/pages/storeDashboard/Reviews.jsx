import React from 'react';
import StoreDashboardLayout from './StoreDashboardLayout';
import StoreReviews from '../../components/storeDashboard/StoreReviews';

export default function Reviews() {
  return (
    <StoreDashboardLayout activeTab="reviews">
      <StoreReviews />
    </StoreDashboardLayout>
  );
}
