import React from 'react';

const stats = [
  { label: 'Total Appointments', value: '1,284', change: '+12.5%', isPositive: true },
  { label: 'Avg Revenue / Doctor', value: '$8,420', change: '+8.2%', isPositive: true },
  { label: 'Facility Usage', value: '88%', change: '+4.1%', isPositive: true },
];

export default function OverviewStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow min-w-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 truncate mr-2">{stat.label}</span>
            <span className={`shrink-0 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {stat.change}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight truncate mr-2">{stat.value}</span>
            {/* Simple Sparkline Placeholder */}
            <div className="flex items-end gap-1 h-8 shrink-0">
              {[4, 7, 5, 8, 6, 9, 7].map((h, j) => (
                <div key={j} className="w-1 bg-[#1EBDB8]/20 rounded-t-sm" style={{ height: `${h * 10}%` }} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
