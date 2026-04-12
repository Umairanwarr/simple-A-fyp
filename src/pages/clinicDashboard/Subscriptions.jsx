import React from 'react';
import ClinicDashboardLayout from './ClinicDashboardLayout';
import ClinicSubscription from '../../components/clinicDashboard/ClinicSubscription';

export default function Subscriptions() {
  return (
    <ClinicDashboardLayout activeTab="subscriptions">
      <ClinicSubscription />
    </ClinicDashboardLayout>
  );
}
