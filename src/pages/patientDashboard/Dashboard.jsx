import React, { useState } from 'react';
import Sidebar from '../../components/patientDashboard/Sidebar';
import Header from '../../components/patientDashboard/Header';
import UpcomingAppointments from '../../components/patientDashboard/UpcomingAppointments';
import FavoriteDoctors from '../../components/patientDashboard/FavoriteDoctors';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#FAFAFB] min-h-screen font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 ml-0 lg:ml-[260px] flex flex-col relative h-screen w-full">
        <div className="px-5 sm:px-10 lg:px-14 flex-1 h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="mt-2 md:mt-4">
            <UpcomingAppointments />
            <FavoriteDoctors />
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="absolute bottom-8 right-10 w-[72px] h-[72px] bg-[#1EBDB8] hover:bg-[#1CAAAE] rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-105 z-50">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
