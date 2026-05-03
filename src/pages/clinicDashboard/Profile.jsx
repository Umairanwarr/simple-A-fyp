import React from 'react';
import ClinicDashboardLayout from './ClinicDashboardLayout';
import ClinicProfile from '../../components/clinicDashboard/ClinicProfile';

export default function Profile() {
  return (
    <ClinicDashboardLayout activeTab="profile">
      <ClinicProfile />
    </ClinicDashboardLayout>
  );
}
