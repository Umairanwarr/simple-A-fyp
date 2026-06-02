import React from 'react';
import ClinicSchedule from '../../components/clinicDashboard/ClinicSchedule';
import ClinicDashboardLayout from './ClinicDashboardLayout';

export default function Schedule() {
  return (
    <ClinicDashboardLayout activeTab="schedule">
      <ClinicSchedule />
    </ClinicDashboardLayout>
  );
}
