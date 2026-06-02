import React from 'react';
import ClinicDashboardLayout from './ClinicDashboardLayout';
import ClinicChatScreen from '../../components/clinicDashboard/ClinicChatScreen';

export default function ClinicChats() {
  return (
    <ClinicDashboardLayout activeTab="chats">
      <ClinicChatScreen role="clinic" tokenKey="clinicToken" userKey="clinic" />
    </ClinicDashboardLayout>
  );
}
