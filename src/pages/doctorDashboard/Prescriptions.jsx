import React from 'react';
import DigitalPrescription from '../../components/doctorDashboard/DigitalPrescription';
import DoctorDashboardLayout from './DoctorDashboardLayout';

export default function Prescriptions() {
  return (
    <DoctorDashboardLayout activeTab="prescriptions">
      <DigitalPrescription />
    </DoctorDashboardLayout>
  );
}
