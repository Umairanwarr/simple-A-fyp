import React from 'react';
import PatientDashboardLayout from './PatientDashboardLayout';
import PatientLiveStreams from '../../components/patientDashboard/PatientLiveStreams';

export default function LiveStreams() {
  return (
    <PatientDashboardLayout activeTab="livestreams">
      <PatientLiveStreams />
    </PatientDashboardLayout>
  );
}
