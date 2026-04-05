import React from 'react';
import AdminLayout from '../AdminLayout';

export default function Clinics() {
  const clinics = [
    { id: '1', name: 'City Hospital', type: 'Hospital', location: 'New York, NY', joined: 'Feb 14, 2023', status: 'Active' },
    { id: '2', name: 'Heart Care Clinic', type: 'Specialized Clinic', location: 'Boston, MA', joined: 'May 05, 2023', status: 'Active' },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8]">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Clinics & Hospitals
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">Manage institutional partners on the platform.</p>
          </div>
          
          <button className="bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-5 py-2.5 rounded-xl font-bold text-[13.5px] transition-colors shadow-sm flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Clinic
          </button>
        </div>

        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden mt-4">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Institution Name</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[14px]">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                         </div>
                         <span className="font-bold text-[14.5px] text-gray-900">{clinic.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{clinic.type}</td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{clinic.location}</td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{clinic.joined}</td>
                    <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[12px] font-bold bg-green-100 text-green-700">
                          {clinic.status}
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
        </div>
      </div>
    </AdminLayout>
  );
}