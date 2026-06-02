import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, XAxis, YAxis, Bar, CartesianGrid } from 'recharts';

const PIE_COLORS = ['#1EBDB8', '#99F6E4'];

export default function PatientEngagement({ engagement = {}, isLoading = false }) {
  const uniquePatients = Math.max(0, Math.trunc(Number(engagement?.uniquePatients || 0)));
  const returningPatients = Math.max(0, Math.trunc(Number(engagement?.returningPatients || 0)));
  const newPatients = Math.max(0, Math.trunc(Number(engagement?.newPatients || 0)));
  const conversionRate = Number(engagement?.conversionRate || 0);
  const returningRate = Number(engagement?.returningRate || 0);
  const dayPartDistribution = Array.isArray(engagement?.dayPartDistribution) ? engagement.dayPartDistribution : [];

  const patientMixData = [
    { name: 'New', value: newPatients },
    { name: 'Returning', value: returningPatients }
  ];

  return (
    <div className="bg-white p-5 lg:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-w-0">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Patient Engagement</h3>
      <p className="text-sm text-gray-500 mb-6">New vs returning patients and visit-time behavior</p>

      {isLoading ? (
        <div className="h-[240px] flex items-center justify-center text-sm text-gray-500">Loading engagement analytics...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Unique Patients</p>
              <p className="text-[21px] font-bold text-slate-900 mt-1">{uniquePatients}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Conversion</p>
              <p className="text-[21px] font-bold text-slate-900 mt-1">{conversionRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={patientMixData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" nameKey="name">
                  {patientMixData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}`, `${name} patients`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <p className="rounded-lg bg-[#ECFEFF] border border-[#A5F3FC] text-[#0F766E] px-3 py-2 font-semibold">
              New: {newPatients}
            </p>
            <p className="rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-3 py-2 font-semibold">
              Returning: {returningPatients} ({returningRate.toFixed(1)}%)
            </p>
          </div>

          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayPartDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip formatter={(value) => [`${value}`, 'Bookings']} />
                <Bar dataKey="bookings" fill="#14B8A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
