import React from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteDoctors from '../../components/patientDashboard/FavoriteDoctors';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function Favorites() {
  const navigate = useNavigate();
  return (
    <PatientDashboardLayout activeTab="favorites">
      {({
        favoriteDoctors,
        favoriteDoctorIds,
        favoriteActionDoctorIds,
        onToggleFavoriteDoctor,
        openDoctorProfile,
        isFavoritesLoading
      }) => (
        <FavoriteDoctors
          title="Your Favorites"
          showViewAll={false}
          isGridView
          doctors={favoriteDoctors}
          favoriteDoctorIds={favoriteDoctorIds}
          favoriteActionDoctorIds={favoriteActionDoctorIds}
          onToggleFavoriteDoctor={onToggleFavoriteDoctor}
          onScheduleDoctor={(doctor) => openDoctorProfile(doctor?.id, '/dashboard/favorites')}
          onOrderFromStore={(store) => { if (store?.id) navigate(`/dashboard/store/${store.id}?from=/dashboard/favorites`); }}
          isLoading={isFavoritesLoading}
        />
      )}
    </PatientDashboardLayout>
  );
}
