import React from 'react';
import ClinicDashboardLayout from './ClinicDashboardLayout';
import ClinicReviews from '../../components/clinicDashboard/ClinicReviews';

export default function Reviews() {
  return (
    <ClinicDashboardLayout activeTab="reviews">
      <ClinicReviews />
    </ClinicDashboardLayout>
  );
}
