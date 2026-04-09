import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DoctorProfileScreen from '../../components/patientDashboard/doctorProfile/DoctorProfileScreen';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { doctorId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const fromPath = String(searchParams.get('from') || '/dashboard/explore').trim();
  const safeFromPath = fromPath.startsWith('/dashboard') ? fromPath : '/dashboard/explore';

  return (
    <PatientDashboardLayout activeTab="doctor-profile">
      <DoctorProfileScreen
        doctorId={doctorId}
        onBack={() => navigate(safeFromPath)}
      />
    </PatientDashboardLayout>
  );
}
