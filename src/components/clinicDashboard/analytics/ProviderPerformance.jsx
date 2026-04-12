import React from 'react';

const doctors = [
  { name: 'Dr. Sarah Wilson', revenue: '$14,200', appointments: 142, status: 'Top Performer' },
  { name: 'Dr. James Miller', revenue: '$11,800', appointments: 120, status: 'Consistent' },
  { name: 'Dr. Elena Rossi', revenue: '$9,400', appointments: 98, status: 'Consistent' },
  { name: 'Dr. Michael Chen', revenue: '$7,900', appointments: 82, status: 'Growing' },
];

export default function ProviderPerformance() {
  return (
    <div className="lg:col-span-2 bg-white p-5 lg:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 truncate">Medical Provider Performance</h3>
          <p className="text-sm text-gray-500 truncate">Revenue and appointment distribution across the facility</p>
        </div>
        <div className="flex shrink-0">
          <button className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-[#1EBDB8] bg-[#1EBDB8]/5 rounded-lg border border-[#1EBDB8]/10 hover:bg-[#1EBDB8]/10 transition-colors whitespace-nowrap">
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full custom-scrollbar">
        <div className="min-w-[500px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-3 lg:pb-4 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Doctor</th>
                <th className="pb-3 lg:pb-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Appointments</th>
                <th className="pb-3 lg:pb-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Revenue</th>
                <th className="pb-3 lg:pb-4 pl-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {doctors.map((doc, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 lg:py-4 pr-4 font-medium text-slate-700 whitespace-nowrap text-sm">{doc.name}</td>
                  <td className="py-3 lg:py-4 px-4 text-right text-slate-600 font-medium whitespace-nowrap text-sm">{doc.appointments}</td>
                  <td className="py-3 lg:py-4 px-4 text-right text-[#1EBDB8] font-semibold whitespace-nowrap text-sm">{doc.revenue}</td>
                  <td className="py-3 lg:py-4 pl-4">
                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <div className="w-12 lg:w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-[#1EBDB8] rounded-full" style={{ width: `${80 - (i * 10)}%` }} />
                      </div>
                      <span className="text-[10px] lg:text-xs font-medium text-gray-400 w-6 text-right shrink-0">{80 - (i * 10)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
