import React from 'react';

const stats = [
  { label: 'Total Appointments', value: '1,284', change: '+12.5%', isPositive: true },
  { label: 'Avg Revenue / Doctor', value: '$8,420', change: '+8.2%', isPositive: true },
  { label: 'Facility Usage', value: '88%', change: '+4.1%', isPositive: true },
];

const doctors = [
  { name: 'Dr. Sarah Wilson', revenue: '$14,200', appointments: 142, status: 'Top Performer' },
  { name: 'Dr. James Miller', revenue: '$11,800', appointments: 120, status: 'Consistent' },
  { name: 'Dr. Elena Rossi', revenue: '$9,400', appointments: 98, status: 'Consistent' },
  { name: 'Dr. Michael Chen', revenue: '$7,900', appointments: 82, status: 'Growing' },
];

export default function ClinicAnalytics() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-semibold text-slate-900 tracking-tight">{stat.value}</span>
              {/* Simple Sparkline Placeholder */}
              <div className="flex items-end gap-1 h-8">
                {[4, 7, 5, 8, 6, 9, 7].map((h, j) => (
                  <div key={j} className="w-1 bg-[#1EBDB8]/20 rounded-t-sm" style={{ height: `${h * 10}%` }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detailed Provider Revenue */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Medical Provider Performance</h3>
              <p className="text-sm text-gray-500">Revenue and appointment distribution across the facility</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-medium text-[#1EBDB8] bg-[#1EBDB8]/5 rounded-lg border border-[#1EBDB8]/10 hover:bg-[#1EBDB8]/10 transition-colors">Export CSV</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                  <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Appointments</th>
                  <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Revenue</th>
                  <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {doctors.map((doc, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-medium text-slate-700">{doc.name}</td>
                    <td className="py-4 text-right text-slate-600 font-medium">{doc.appointments}</td>
                    <td className="py-4 text-right text-[#1EBDB8] font-semibold">{doc.revenue}</td>
                    <td className="py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1EBDB8] rounded-full" style={{ width: `${80 - (i * 10)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-400">{80 - (i * 10)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Facility Optimization Card */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Facility Capacity</h3>
          <p className="text-sm text-gray-500 mb-8">Real-time room utilization</p>

          <div className="space-y-6 flex-1">
            {[
              { label: 'OPD Rooms', val: '12/14 occupied', p: 85 },
              { label: 'Surgical Suites', val: '3/4 active', p: 75 },
              { label: 'Lab Capacity', val: '92% utilized', p: 92 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.label}</span>
                  <span className="text-xs font-medium text-slate-400">{item.val}</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div className="h-full bg-gradient-to-r from-[#1EBDB8]/80 to-[#1EBDB8] rounded-full" style={{ width: `${item.p}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50">
            <button className="w-full py-4 text-white text-sm font-semibold bg-[#1F2432] rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
