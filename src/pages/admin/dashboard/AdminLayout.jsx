import React, { useState } from 'react';
import AdminSidebar from '../../../components/admin/dashboard/AdminSidebar';
import AdminHeader from '../../../components/admin/dashboard/AdminHeader';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex">
      {/* Sidebar handles its own fixed positioning and responsive states */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content Wrapper - margins push content aside on desktop */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-[260px]">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}