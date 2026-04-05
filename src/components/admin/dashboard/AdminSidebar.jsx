import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUsersOpen, setIsUsersOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-[260px] bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out font-sans flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo Area */}
        <div className="h-[72px] flex items-center px-6 border-b border-gray-100 shrink-0">
          <a href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="h-8 w-auto"
              style={{ filter: 'invert(52%) sepia(85%) saturate(417%) hue-rotate(128deg) brightness(97%) contrast(93%)' }}
            />
            <span className="text-[20px] font-bold text-[#1EBDB8] tracking-wide pt-0.5">Admin</span>
          </a>
          <button 
            className="ml-auto lg:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <nav className="flex flex-col gap-2">
            
            {/* Dashboard Link */}
            <a 
              href="/admin/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[14.5px] ${isActive('/admin/dashboard') ? 'bg-[#1EBDB8]/10 text-[#1EBDB8]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9"></rect>
                <rect x="14" y="3" width="7" height="5"></rect>
                <rect x="14" y="12" width="7" height="9"></rect>
                <rect x="3" y="16" width="7" height="5"></rect>
              </svg>
              Overview
            </a>

            {/* Users Dropdown */}
            <div className="flex flex-col">
              <button 
                onClick={() => setIsUsersOpen(!isUsersOpen)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-[14.5px] ${location.pathname.includes('/admin/users') && !isUsersOpen ? 'bg-gray-50 text-[#1EBDB8]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Users Management
                </div>
                <svg 
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform duration-200 ${isUsersOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Dropdown Items */}
              <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${isUsersOpen ? 'max-h-[200px] mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                <a 
                  href="/admin/users/patients"
                  className={`pl-[46px] pr-4 py-2.5 rounded-xl transition-all font-semibold text-[13.5px] ${isActive('/admin/users/patients') ? 'text-[#1EBDB8] bg-[#1EBDB8]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  Patients
                </a>
                <a 
                  href="/admin/users/doctors"
                  className={`pl-[46px] pr-4 py-2.5 rounded-xl transition-all font-semibold text-[13.5px] ${isActive('/admin/users/doctors') ? 'text-[#1EBDB8] bg-[#1EBDB8]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  Doctors
                </a>
                <a 
                  href="/admin/users/clinics"
                  className={`pl-[46px] pr-4 py-2.5 rounded-xl transition-all font-semibold text-[13.5px] ${isActive('/admin/users/clinics') ? 'text-[#1EBDB8] bg-[#1EBDB8]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  Clinics
                </a>
                <a 
                  href="/admin/users/stores"
                  className={`pl-[46px] pr-4 py-2.5 rounded-xl transition-all font-semibold text-[13.5px] ${isActive('/admin/users/stores') ? 'text-[#1EBDB8] bg-[#1EBDB8]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  Medical Stores
                </a>
              </div>
            </div>

          </nav>
        </div>

        {/* Logout Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-bold text-[14px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
