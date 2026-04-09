import React from 'react';
import AppointmentHistory from '../../components/patientDashboard/AppointmentHistory';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function History() {
  return (
    <PatientDashboardLayout activeTab="history">
      <AppointmentHistory />
    </PatientDashboardLayout>
  );
}
