import React from 'react';
import PatientDashboardLayout from './PatientDashboardLayout';

export default function Chats() {
  return (
    <PatientDashboardLayout activeTab="chats">
      <div className="bg-white border border-gray-100 rounded-[24px] p-8 text-center">
        <h3 className="text-[20px] font-bold text-[#1F2937]">Chats</h3>
        <p className="text-[14px] text-[#9CA3AF] mt-2">Doctor chats will appear here soon.</p>
      </div>
    </PatientDashboardLayout>
  );
}
