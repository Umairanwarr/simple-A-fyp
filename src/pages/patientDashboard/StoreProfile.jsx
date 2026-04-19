import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import StoreProfileScreen from '../../components/patientDashboard/storeProfile/StoreProfileScreen';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function StoreProfile() {
  const navigate = useNavigate();
  const { storeId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const fromPath = String(searchParams.get('from') || '/dashboard/explore').trim();
  const safeFromPath = fromPath.startsWith('/dashboard') ? fromPath : '/dashboard/explore';

  return (
    <PatientDashboardLayout activeTab="store-profile">
      <StoreProfileScreen
        storeId={storeId}
        onBack={() => navigate(safeFromPath)}
      />
    </PatientDashboardLayout>
  );
}
