import React from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteDoctors from '../../components/patientDashboard/FavoriteDoctors';
import UpcomingAppointments from '../../components/patientDashboard/UpcomingAppointments';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <PatientDashboardLayout activeTab="dashboard">
      {({
        favoriteDoctors,
        favoriteDoctorIds,
        favoriteActionDoctorIds,
        onToggleFavoriteDoctor,
        openDoctorProfile,
        isFavoritesLoading
      }) => (
        <>
          <UpcomingAppointments />
          <FavoriteDoctors
            onViewAll={() => navigate('/dashboard/favorites')}
            doctors={favoriteDoctors}
            favoriteDoctorIds={favoriteDoctorIds}
            favoriteActionDoctorIds={favoriteActionDoctorIds}
            onToggleFavoriteDoctor={onToggleFavoriteDoctor}
            onScheduleDoctor={(doctor) => openDoctorProfile(doctor?.id, '/dashboard')}
            onOrderFromStore={(store) => { if (store?.id) navigate(`/dashboard/store/${store.id}?from=/dashboard`); }}
            isLoading={isFavoritesLoading}
          />
        </>
      )}
    </PatientDashboardLayout>
  );
}
