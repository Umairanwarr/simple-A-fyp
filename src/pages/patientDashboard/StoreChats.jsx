import React from 'react';
import PatientDashboardLayout from './PatientDashboardLayout';
import StoreChatScreen from '../../components/storeDashboard/StoreChatScreen';

export default function PatientStoreChats() {
  return (
    <PatientDashboardLayout activeTab="store-chats">
      <StoreChatScreen role="patient" tokenKey="patientToken" userKey="patient" />
    </PatientDashboardLayout>
  );
}
