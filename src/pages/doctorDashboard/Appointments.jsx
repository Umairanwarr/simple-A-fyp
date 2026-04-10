import React from 'react';
import AppointmentsPage from '../../components/doctorDashboard/appointments/AppointmentsPage';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Appointments() {
  return (
    <DoctorDashboardLayout activeTab="appointments">
      <AppointmentsPage />
    </DoctorDashboardLayout>
  );
}
