import React, { useState } from 'react';
import ClinicSidebar from '../../components/clinicDashboard/ClinicSidebar';
import ClinicHeader from '../../components/clinicDashboard/ClinicHeader';
import ClinicAnalytics from '../../components/clinicDashboard/ClinicAnalytics';
import StaffManagement from '../../components/clinicDashboard/StaffManagement';
import ClinicSubscription from '../../components/clinicDashboard/ClinicSubscription';
import PromotionalMedia from '../../components/clinicDashboard/PromotionalMedia';
import ClinicLiveStream from '../../components/clinicDashboard/ClinicLiveStream';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics': return <ClinicAnalytics />;
      case 'staff': return <StaffManagement />;
      case 'subscriptions': return <ClinicSubscription />;
      case 'media': return <PromotionalMedia />;
      case 'streaming': return <ClinicLiveStream />;
      default: return <ClinicAnalytics />;
    }
  };

  return (
    <div className="flex bg-[#FAFAFB] min-h-screen font-sans overflow-x-hidden">
      <ClinicSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 ml-0 lg:ml-[260px] flex flex-col relative h-screen w-full">
        <div className="px-5 sm:px-10 lg:px-14 flex-1 h-full overflow-y-auto overflow-x-hidden pb-10 custom-scrollbar">
          <ClinicHeader 
            onMenuClick={() => setIsSidebarOpen(true)} 
            activeTab={activeTab}
          />
          
          <main className="mt-2 md:mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </main>
        </div>

        {/* Global Floating Action Button */}
        <button className="fixed bottom-8 right-10 w-[72px] h-[72px] bg-[#1EBDB8] hover:bg-[#1CAAAE] rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 z-50 group">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-[#FAFAFB] text-[10px] font-bold flex items-center justify-center">5</span>
        </button>
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
