import React from 'react';
import ReviewsPage from '../../components/doctorDashboard/reviews/ReviewsPage';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Reviews() {
  return (
    <DoctorDashboardLayout activeTab="reviews">
      <ReviewsPage />
    </DoctorDashboardLayout>
  );
}
