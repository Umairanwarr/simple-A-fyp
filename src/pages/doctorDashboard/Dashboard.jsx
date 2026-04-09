import React from 'react';
import Analytics from '../../components/doctorDashboard/Analytics';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Dashboard() {
  return (
    <DoctorDashboardLayout activeTab="analytics">
      <Analytics />
    </DoctorDashboardLayout>
  );
}
