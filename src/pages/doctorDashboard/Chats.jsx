import React from 'react';
import DoctorDashboardLayout from './DoctorDashboardLayout';
import ChatScreen from '../../components/shared/ChatScreen';

export default function DoctorChats() {
  return (
    <DoctorDashboardLayout activeTab="analytics">
      <ChatScreen role="doctor" tokenKey="doctorToken" userKey="doctor" />
    </DoctorDashboardLayout>
  );
}
