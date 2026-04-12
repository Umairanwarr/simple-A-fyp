import React from 'react';
import ClinicDashboardLayout from './ClinicDashboardLayout';
import PromotionalMedia from '../../components/clinicDashboard/PromotionalMedia';

export default function Media() {
  return (
    <ClinicDashboardLayout activeTab="media">
      <PromotionalMedia />
    </ClinicDashboardLayout>
  );
}
