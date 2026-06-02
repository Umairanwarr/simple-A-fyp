import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const formatCurrency = (amountInRupees) => {
  const parsedAmount = Number(amountInRupees);
  const safeAmount = Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : 0;
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(safeAmount);
};

export default function BookingTrends({ trendData = [], isLoading = false }) {
  const safeTrendData = Array.isArray(trendData) ? trendData : [];
  const totalBookings = safeTrendData.reduce((sum, item) => sum + Math.max(0, Math.trunc(Number(item?.bookings || 0))), 0);
  const totalRevenue = safeTrendData.reduce((sum, item) => sum + Math.max(0, Math.trunc(Number(item?.revenueInRupees || 0))), 0);

  return (
    <div className="bg-white p-5 lg:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-w-0">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Booking Trends</h3>
          <p className="text-sm text-gray-500">Last 14 days booking and revenue progression</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">14-Day Total</p>
          <p className="text-[14px] font-semibold text-slate-900">{totalBookings} bookings</p>
          <p className="text-[12px] font-medium text-[#0F766E]">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[270px] flex items-center justify-center text-sm text-gray-500">Loading booking trends...</div>
      ) : (
        <div className="h-[270px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeTrendData} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="clinicBookingArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1EBDB8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1EBDB8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                formatter={(value, key, payload) => {
                  if (key === 'revenueInRupees') return [formatCurrency(value), 'Revenue'];
                  return [`${value}`, 'Bookings'];
                }}
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload;
                  return String(item?.date || item?.label || '');
                }}
              />
              <Area type="monotone" dataKey="bookings" stroke="#0F766E" fill="url(#clinicBookingArea)" strokeWidth={2.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
