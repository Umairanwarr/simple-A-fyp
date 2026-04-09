import React from 'react';
import ProfilePage from '../../components/doctorDashboard/profile/ProfilePage';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Profile() {
  return (
    <DoctorDashboardLayout activeTab="profile">
      {({ handleProfileUpdated }) => (
        <ProfilePage onProfileUpdated={handleProfileUpdated} />
      )}
    </DoctorDashboardLayout>
  );
}
