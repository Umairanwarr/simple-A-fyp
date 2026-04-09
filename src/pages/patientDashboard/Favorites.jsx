import React from 'react';
import FavoriteDoctors from '../../components/patientDashboard/FavoriteDoctors';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function Favorites() {
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
          title="Favorite Doctors"
          showViewAll={false}
          isGridView
          doctors={favoriteDoctors}
          favoriteDoctorIds={favoriteDoctorIds}
          favoriteActionDoctorIds={favoriteActionDoctorIds}
          onToggleFavoriteDoctor={onToggleFavoriteDoctor}
          onScheduleDoctor={(doctor) => openDoctorProfile(doctor?.id, '/dashboard/favorites')}
          isLoading={isFavoritesLoading}
        />
      )}
    </PatientDashboardLayout>
  );
}
