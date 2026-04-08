import React, { useState } from 'react';

const initialStaff = [
  { id: 1, name: 'Dr. Sarah Wilson', specialty: 'Cardiologist', status: 'On Duty', shift: '08:00 AM - 04:00 PM', appointments: 12, rating: 4.9 },
  { id: 2, name: 'Dr. James Miller', specialty: 'Neurologist', status: 'Off Duty', shift: '10:00 AM - 06:00 PM', appointments: 8, rating: 4.8 },
  { id: 3, name: 'Dr. Elena Rossi', specialty: 'Pediatrician', status: 'On Duty', shift: '09:00 AM - 05:00 PM', appointments: 15, rating: 5.0 },
  { id: 4, name: 'Dr. Michael Chen', specialty: 'Dermatologist', status: 'In Surgery', shift: '12:00 PM - 08:00 PM', appointments: 5, rating: 4.7 },
  { id: 5, name: 'Dr. Aisha Khan', specialty: 'Orthopedic', status: 'On Duty', shift: '08:00 AM - 04:00 PM', appointments: 10, rating: 4.9 },
];

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 group focus-within:ring-2 focus-within:ring-[#1EBDB8]/20 transition-all w-full md:w-[400px]">
          <svg className="text-gray-400 group-focus-within:text-[#1EBDB8] transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search by doctor name or specialty..." 
            className="ml-3 text-[15px] font-medium text-[#1F2432] bg-transparent outline-none border-none placeholder:text-gray-400 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="flex items-center justify-center gap-3 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-8 py-4 rounded-[24px] font-bold shadow-lg shadow-[#1EBDB8]/20 transition-all active:scale-95 group">
          <svg className="group-hover:rotate-90 transition-transform duration-300" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Register New Doctor
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Doctor Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Specialty</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Assigned Shift</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Performance</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialStaff.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors group/row">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${doctor.name}&background=1EBDB8&color=fff`} 
                          alt={doctor.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-slate-800 group-hover/row:text-[#1EBDB8] transition-colors">{doctor.name}</p>
                        <p className="text-[11px] text-gray-400">ID: #DOC-00{doctor.id}24</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[12px] font-medium rounded-md border border-slate-100">{doctor.specialty}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${
                         doctor.status === 'On Duty' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 
                         doctor.status === 'Off Duty' ? 'bg-slate-300' : 'bg-amber-500'
                       }`} />
                       <span className={`text-[13px] font-medium ${
                         doctor.status === 'On Duty' ? 'text-emerald-600' : 
                         doctor.status === 'Off Duty' ? 'text-slate-400' : 'text-amber-600'
                       }`}>{doctor.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[13px] text-slate-500 font-medium">{doctor.shift}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-semibold text-slate-700">{doctor.rating}</span>
                      <span className="text-[11px] text-slate-400 font-medium">({doctor.appointments} Appts)</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roster Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Doctors', val: '24' },
          { label: 'On Duty', val: '18' },
          { label: 'Leaves Today', val: '2' },
          { label: 'Pending Reviews', val: '5' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-2xl font-semibold text-slate-800">{item.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
