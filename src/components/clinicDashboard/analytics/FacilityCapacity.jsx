import React from 'react';

export default function FacilityCapacity({ overview = {}, isLoading = false }) {
  const activeDoctors = Math.max(0, Math.trunc(Number(overview.activeDoctors || 0)));
  const activeSlots = Math.max(0, Math.trunc(Number(overview.totalActiveSlots || 0)));
  const appointments = Math.max(0, Math.trunc(Number(overview.totalAppointments || 0)));
  const slotCapacityPercent = activeDoctors > 0 ? Math.min(100, Math.round((activeSlots / (activeDoctors * 10)) * 100)) : 0;
  const bookingLoadPercent = activeSlots + appointments > 0 ? Math.min(100, Math.round((appointments / (activeSlots + appointments)) * 100)) : 0;

  const items = [
    { label: 'Active Doctors', value: `${activeDoctors} registered`, percent: activeDoctors > 0 ? 100 : 0 },
    { label: 'Open Slots', value: `${activeSlots} available`, percent: slotCapacityPercent },
    { label: 'Booking Load', value: `${appointments} paid`, percent: bookingLoadPercent }
  ];

  return (
    <div className="bg-white p-5 lg:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-w-0">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Facility Capacity</h3>
      <p className="text-sm text-gray-500 mb-6 lg:mb-8">Live staff and appointment utilization</p>

      <div className="space-y-6 flex-1">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className="text-[10px] lg:text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{item.label}</span>
              <span className="text-[10px] lg:text-xs font-medium text-slate-400 shrink-0">{isLoading ? 'Loading...' : item.value}</span>
            </div>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
              <div className="h-full bg-gradient-to-r from-[#1EBDB8]/80 to-[#1EBDB8] rounded-full" style={{ width: `${isLoading ? 20 : item.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
