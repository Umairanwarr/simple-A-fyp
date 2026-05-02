import React from 'react';
import ClinicDashboardLayout from './ClinicDashboardLayout';
import ClinicAppointments from '../../components/clinicDashboard/ClinicAppointments';

export default function Appointments() {
  return (
    <ClinicDashboardLayout activeTab="availability">
      <ClinicAppointments />
    </ClinicDashboardLayout>
  );
}
