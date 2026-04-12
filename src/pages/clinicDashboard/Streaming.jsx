import React from 'react';
import ClinicDashboardLayout from './ClinicDashboardLayout';
import ClinicLiveStream from '../../components/clinicDashboard/ClinicLiveStream';

export default function Streaming() {
  return (
    <ClinicDashboardLayout activeTab="streaming">
      <ClinicLiveStream />
    </ClinicDashboardLayout>
  );
}
