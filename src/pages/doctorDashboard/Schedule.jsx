import React from 'react';
import MySchedulePage from '../../components/doctorDashboard/schedule/MySchedulePage';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Schedule() {
  return (
    <DoctorDashboardLayout activeTab="schedule">
      <MySchedulePage />
    </DoctorDashboardLayout>
  );
}
