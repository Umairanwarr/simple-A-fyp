import React from 'react';
import ProfilePage from '../../components/patientDashboard/profile/ProfilePage';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function Profile() {
  return (
    <PatientDashboardLayout activeTab="profile">
      {({ handleProfileUpdated }) => (
        <ProfilePage onProfileUpdated={handleProfileUpdated} />
      )}
    </PatientDashboardLayout>
  );
}
