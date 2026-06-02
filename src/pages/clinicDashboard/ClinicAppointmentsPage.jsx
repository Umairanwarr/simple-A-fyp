import React from 'react';
import ClinicAppointmentsView from '../../components/clinicDashboard/ClinicAppointmentsView';
import ClinicDashboardLayout from './ClinicDashboardLayout';

export default function ClinicAppointmentsPage() {
  return (
    <ClinicDashboardLayout activeTab="appointments">
      <ClinicAppointmentsView />
    </ClinicDashboardLayout>
  );
}
