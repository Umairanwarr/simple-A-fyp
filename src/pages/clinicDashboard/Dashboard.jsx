import React from 'react';
import ClinicDashboardLayout from './ClinicDashboardLayout';
import ClinicAnalytics from '../../components/clinicDashboard/ClinicAnalytics';

export default function Dashboard() {
  return (
    <ClinicDashboardLayout activeTab="analytics">
      <ClinicAnalytics />
    </ClinicDashboardLayout>
  );
}
