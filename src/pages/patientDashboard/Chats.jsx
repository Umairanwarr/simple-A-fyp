import React, { useState } from 'react';
import PatientDashboardLayout from './PatientDashboardLayout';
import ChatScreen from '../../components/shared/ChatScreen';
import StoreChatScreen from '../../components/storeDashboard/StoreChatScreen';
import ClinicChatScreen from '../../components/clinicDashboard/ClinicChatScreen';

export default function Chats() {
  const [activeChat, setActiveChat] = useState(() => {
    const requestedChat = String(new URLSearchParams(window.location.search).get('chat') || '').trim().toLowerCase();
    if (requestedChat === 'stores' || requestedChat === 'clinics' || requestedChat === 'doctors') {
      return requestedChat;
    }
    return 'doctors';
  });

  return (
    <PatientDashboardLayout activeTab="chats">
      <div className="space-y-4">
        {/* Tab Switcher */}
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex min-w-max gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveChat('doctors')}
            className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
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
            className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
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
          <button
            onClick={() => setActiveChat('clinics')}
            className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
              activeChat === 'clinics'
                ? 'bg-[#1EBDB8] text-white shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#1F2432]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M9 9h8"/><path d="M9 13h8"/><path d="M9 17h8"/>
            </svg>
            Clinics
          </button>
          </div>
        </div>

        {/* Chat Screens */}
        {activeChat === 'doctors' ? (
          <ChatScreen role="patient" tokenKey="patientToken" userKey="patient" />
        ) : activeChat === 'stores' ? (
          <StoreChatScreen role="patient" tokenKey="patientToken" userKey="patient" />
        ) : (
          <ClinicChatScreen role="patient" tokenKey="patientToken" userKey="patient" />
        )}
      </div>
    </PatientDashboardLayout>
  );
}
