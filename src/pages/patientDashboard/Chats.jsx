import React, { useState } from 'react';
import PatientDashboardLayout from './PatientDashboardLayout';
import ChatScreen from '../../components/shared/ChatScreen';
import StoreChatScreen from '../../components/storeDashboard/StoreChatScreen';

export default function Chats() {
  const [activeChat, setActiveChat] = useState('doctors');

  return (
    <PatientDashboardLayout activeTab="chats">
      <div className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
          <button
            onClick={() => setActiveChat('doctors')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
              activeChat === 'doctors'
                ? 'bg-[#1F2432] text-white shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#1F2432]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Doctors
          </button>
          <button
            onClick={() => setActiveChat('stores')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
              activeChat === 'stores'
                ? 'bg-[#1EBDB8] text-white shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#1F2432]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Medical Stores
          </button>
        </div>

        {/* Chat Screens */}
        {activeChat === 'doctors' ? (
          <ChatScreen role="patient" tokenKey="patientToken" userKey="patient" />
        ) : (
          <StoreChatScreen role="patient" tokenKey="patientToken" userKey="patient" />
        )}
      </div>
    </PatientDashboardLayout>
  );
}
