import React from 'react';
import UpcomingAppointments from '../../components/patientDashboard/UpcomingAppointments';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function Appointments() {
  return (
    <PatientDashboardLayout activeTab="appointments">
      <UpcomingAppointments />
    </PatientDashboardLayout>
  );
}
