import React from 'react';
import StoreDashboardLayout from './StoreDashboardLayout';
import StoreChatScreen from '../../components/storeDashboard/StoreChatScreen';

export default function StoreChats() {
  return (
    <StoreDashboardLayout activeTab="chats">
      <StoreChatScreen role="medical-store" tokenKey="medicalStoreToken" userKey="medicalStore" />
    </StoreDashboardLayout>
  );
}
