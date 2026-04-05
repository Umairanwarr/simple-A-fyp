import React from 'react';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  
  const stats = [
    { title: 'Total Patients', value: '14,235', change: '+12%', isPositive: true },
    { title: 'Total Doctors', value: '452', change: '+5%', isPositive: true },
    { title: 'Total Clinics', value: '128', change: '+2%', isPositive: true },
    { title: 'Medical Stores', value: '87', change: '-1%', isPositive: false },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">Platform Overview</h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">Monitor all users and activities across the platform.</p>
          </div>
          
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-[13.5px] transition-colors shadow-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col gap-3">
              <div className="text-[14px] font-bold text-gray-500">{stat.title}</div>
              <div className="flex items-end justify-between">
                <span className="text-[28px] font-bold text-gray-900 leading-none">{stat.value}</span>
                <span className={`text-[13px] font-bold flex items-center gap-1 ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.isPositive ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
                  )}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity / Chart Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] min-h-[400px] flex flex-col">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6">User Growth</h2>
            <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
               <span className="text-gray-400 font-medium text-[14px]">Chart goes here</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6">Recent Users Joined</h2>
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-sm">
                    U{i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 truncate">New User {i}</p>
                    <p className="text-[12px] font-medium text-gray-500 truncate">Patient • Joined 2 mins ago</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-auto w-full py-3 text-[#1EBDB8] font-bold text-[13.5px] border border-[#1EBDB8]/20 rounded-xl hover:bg-[#1EBDB8]/5 transition-colors">
              View All Users
            </button>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}