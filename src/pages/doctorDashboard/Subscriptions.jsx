import React from 'react';
import SubscriptionManager from '../../components/doctorDashboard/SubscriptionManager';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Subscriptions() {
  return (
    <DoctorDashboardLayout activeTab="subscriptions">
      <SubscriptionManager />
    </DoctorDashboardLayout>
  );
}
