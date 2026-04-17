import React from 'react';
import { useNavigate } from 'react-router-dom';
import ExploreScreen from '../../components/patientDashboard/explore/ExploreScreen';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function Explore() {
  const navigate = useNavigate();
  return (
    <PatientDashboardLayout activeTab="explore">
      {({
        favoriteDoctorIds,
        favoriteActionDoctorIds,
        onToggleFavoriteDoctor,
        openDoctorProfile
      }) => (
        <ExploreScreen
          favoriteDoctorIds={favoriteDoctorIds}
          favoriteActionDoctorIds={favoriteActionDoctorIds}
          onToggleFavoriteDoctor={onToggleFavoriteDoctor}
          onScheduleDoctor={(doctor) => openDoctorProfile(doctor?.id, '/dashboard/explore')}
          onOrderFromStore={(store) => { if (store?.id) navigate(`/dashboard/store/${store.id}?from=/dashboard/explore`); }}
        />
      )}
    </PatientDashboardLayout>
  );
}
