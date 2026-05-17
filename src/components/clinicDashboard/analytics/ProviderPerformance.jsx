import React from 'react';

const formatCurrency = (amount) => {
  const n = Number(amount);
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(Number.isFinite(n) ? Math.max(0, n) : 0);
};

export default function ProviderPerformance({ doctors = [], isLoading = false }) {
  const safeDoctors = Array.isArray(doctors) ? doctors : [];
  const maxRevenue = Math.max(...safeDoctors.map((doctor) => Number(doctor.revenueInRupees || 0)), 1);

  return (
    <div className="lg:col-span-2 bg-white p-5 lg:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 truncate">Medical Provider Performance</h3>
          <p className="text-sm text-gray-500 truncate">Live revenue and appointments across clinic doctors</p>
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
                <th className="pb-3 lg:pb-4 pl-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="4" className="py-6 text-center text-sm text-gray-500">Loading analytics...</td></tr>
              ) : safeDoctors.length === 0 ? (
                <tr><td colSpan="4" className="py-6 text-center text-sm text-gray-500">No clinic doctor data yet.</td></tr>
              ) : safeDoctors.map((doctor) => {
                const share = Math.round((Number(doctor.revenueInRupees || 0) / maxRevenue) * 100);
                return (
                  <tr key={doctor.doctorId} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 lg:py-4 pr-4 font-medium text-slate-700 whitespace-nowrap text-sm">Dr. {doctor.name}</td>
                    <td className="py-3 lg:py-4 px-4 text-right text-slate-600 font-medium whitespace-nowrap text-sm">{doctor.appointments || 0}</td>
                    <td className="py-3 lg:py-4 px-4 text-right text-[#1EBDB8] font-semibold whitespace-nowrap text-sm">{formatCurrency(doctor.revenueInRupees || 0)}</td>
                    <td className="py-3 lg:py-4 pl-4">
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <div className="w-12 lg:w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div className="h-full bg-[#1EBDB8] rounded-full" style={{ width: `${share}%` }} />
                        </div>
                        <span className="text-[10px] lg:text-xs font-medium text-gray-400 w-8 text-right shrink-0">{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
