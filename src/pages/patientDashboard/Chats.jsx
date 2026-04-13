import React from 'react';
import PatientDashboardLayout from './PatientDashboardLayout';
import ChatScreen from '../../components/shared/ChatScreen';

export default function Chats() {
  return (
    <PatientDashboardLayout activeTab="chats">
      <ChatScreen role="patient" tokenKey="patientToken" userKey="patient" />
    </PatientDashboardLayout>
  );
}
