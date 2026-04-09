import React from 'react';
import ExploreScreen from '../../components/patientDashboard/explore/ExploreScreen';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function Explore() {
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
        />
      )}
    </PatientDashboardLayout>
  );
}
