import React from 'react';

export default function FacilityCapacity() {
  return (
    <div className="bg-white p-5 lg:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-w-0">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Facility Capacity</h3>
      <p className="text-sm text-gray-500 mb-6 lg:mb-8">Real-time room utilization</p>

      <div className="space-y-6 flex-1">
        {[
          { label: 'OPD Rooms', val: '12/14 occupied', p: 85 },
          { label: 'Surgical Suites', val: '3/4 active', p: 75 },
          { label: 'Lab Capacity', val: '92% utilized', p: 92 },
        ].map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className="text-[10px] lg:text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{item.label}</span>
              <span className="text-[10px] lg:text-xs font-medium text-slate-400 shrink-0">{item.val}</span>
            </div>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
              <div className="h-full bg-gradient-to-r from-[#1EBDB8]/80 to-[#1EBDB8] rounded-full" style={{ width: `${item.p}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-50">
        <button className="w-full py-3 lg:py-4 text-white text-sm font-semibold bg-[#1F2432] rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95 shrink-0">
          Generate Report
        </button>
      </div>
    </div>
  );
}
