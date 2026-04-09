import React from 'react';
import VirtualClinic from '../../components/doctorDashboard/VirtualClinic';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Clinic() {
  return (
    <DoctorDashboardLayout activeTab="clinic">
      <VirtualClinic />
    </DoctorDashboardLayout>
  );
}
