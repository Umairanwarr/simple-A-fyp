import React from 'react';
import ClinicDashboardLayout from './ClinicDashboardLayout';
import StaffManagement from '../../components/clinicDashboard/StaffManagement';

export default function Staff() {
  return (
    <ClinicDashboardLayout activeTab="staff">
      <StaffManagement />
    </ClinicDashboardLayout>
  );
}
