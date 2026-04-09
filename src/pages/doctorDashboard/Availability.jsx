import React from 'react';
import { useNavigate } from 'react-router-dom';
import AvailabilityPage from '../../components/doctorDashboard/availability/AvailabilityPage';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Availability() {
  const navigate = useNavigate();

  return (
    <DoctorDashboardLayout activeTab="availability">
      <AvailabilityPage onGoToProfile={() => navigate('/doctor/dashboard/profile')} />
    </DoctorDashboardLayout>
  );
}
