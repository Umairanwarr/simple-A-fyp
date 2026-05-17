import React from 'react';
import { BarChart3, BadgeCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DiamondAdvancedAnalytics({ data = {}, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#1EBDB8]/20 bg-white p-5 text-sm font-semibold text-slate-500">
        Loading diamond analytics...
      </div>
    );
  }

  const conversionRate = Number(data?.viewsToBookingsConversion || 0);
  const totalViews = Math.max(0, Math.trunc(Number(data?.totalProfileViews || 0)));
  const totalBookings = Math.max(0, Math.trunc(Number(data?.totalBookings || 0)));
  const conversionChartData = [
    { label: 'Views', value: totalViews },
    { label: 'Bookings', value: totalBookings }
  ];

  return (
    <div className="rounded-2xl border border-[#1EBDB8]/20 bg-white p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#0F766E]">Diamond Advanced Analytics</p>
          <h3 className="text-[18px] font-bold text-[#1F2432] mt-1">Bookings Conversion</h3>
        </div>
        <BadgeCheck className="w-5 h-5 text-[#0F766E]" />
      </div>

      <div className="mt-5 rounded-xl border border-gray-100 bg-slate-50 p-4">
        <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Bookings Conversion
        </p>
        <p className="text-[28px] font-bold text-[#1F2432] mt-1">{conversionRate.toFixed(1)}%</p>
        <p className="text-[13px] font-semibold text-slate-600 mt-1">
          {totalBookings} bookings from {totalViews.toLocaleString()} views
        </p>

        <div className="h-[210px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conversionChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip formatter={(value) => [`${value}`, 'Count']} />
              <Bar dataKey="value" fill="#14B8A6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
