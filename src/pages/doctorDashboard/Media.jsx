import React from 'react';
import MediaManagement from '../../components/doctorDashboard/MediaManagement';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Media() {
  return (
    <DoctorDashboardLayout activeTab="media">
      <MediaManagement />
    </DoctorDashboardLayout>
  );
}
