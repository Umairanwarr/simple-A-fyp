import React from 'react';
import AdminLayout from '../AdminLayout';

export default function Doctors() {
  const doctors = [
    { id: '1', name: 'Dr. John Doe', specialty: 'Cardiologist', email: 'john.doe@hospital.com', joined: 'Jan 22, 2023', status: 'Active' },
    { id: '2', name: 'Dr. Sara Lee', specialty: 'Dermatologist', email: 'sara.lee@clinic.com', joined: 'Mar 10, 2023', status: 'Active' },
    { id: '3', name: 'Dr. Ahmed Khan', specialty: 'Neurologist', email: 'ahmed@hospital.com', joined: 'Apr 05, 2023', status: 'Pending' },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8]">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              Doctors Management
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">View, approve, and manage registered doctors.</p>
          </div>
          
          <button className="bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-5 py-2.5 rounded-xl font-bold text-[13.5px] transition-colors shadow-sm flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Doctor
          </button>
        </div>

        {/* Filters/Search block */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row gap-4 mb-2">
          <div className="relative flex-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search doctors by name, specialty, or email..." 
              className="w-full bg-[#FAFAFA] text-[#4B5563] text-[14px] font-medium py-2.5 pl-10 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 border border-gray-200 focus:border-[#1EBDB8] transition-all"
            />
          </div>
          <button className="bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold text-[13.5px] text-gray-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Doctor Name</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                            {doc.name.charAt(4)}
                         </div>
                         <span className="font-bold text-[14.5px] text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-[12.5px] border border-blue-100/50">{doc.specialty}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{doc.email}</td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{doc.joined}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[12px] font-bold ${
                          doc.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {doc.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-[#1EBDB8] p-2 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="19" cy="12" r="1"></circle>
                          <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13.5px] font-medium text-gray-500">
            <span>Showing 1 to 3 of 3 entries</span>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">Prev</button>
              <button disabled className="px-3 py-1 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">Next</button>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}