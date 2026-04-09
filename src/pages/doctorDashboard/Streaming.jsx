import React from 'react';
import LiveStreaming from '../../components/doctorDashboard/LiveStreaming';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Streaming() {
  return (
    <DoctorDashboardLayout activeTab="streaming">
      <LiveStreaming />
    </DoctorDashboardLayout>
  );
}
