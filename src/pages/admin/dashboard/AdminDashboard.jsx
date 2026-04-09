import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchAdminStats } from '../../../services/authApi';

const formatCurrency = (amountInRupees) => {
  const parsedAmount = Number(amountInRupees);
  const safeAmount = Number.isFinite(parsedAmount)
    ? Math.max(0, parsedAmount)
    : 0;

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(safeAmount);
};

const formatDateLabel = (dateValue) => {
  if (!dateValue) {
    return 'N/A';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function AdminDashboard() {
  const [totalPatients, setTotalPatients] = useState('0');
  const [totalDoctors, setTotalDoctors] = useState('0');
  const [totalClinics, setTotalClinics] = useState('0');
  const [totalMedicalStores, setTotalMedicalStores] = useState('0');
  const [totalAppointments, setTotalAppointments] = useState('0');
  const [totalBookingRevenue, setTotalBookingRevenue] = useState(0);
  const [totalAdminCommission, setTotalAdminCommission] = useState(0);
  const [recentCommissions, setRecentCommissions] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        return;
      }

      try {
        const data = await fetchAdminStats(token);
        setTotalPatients(String(data.totalPatients ?? 0));
        setTotalDoctors(String(data.approvedDoctors ?? 0));
        setTotalClinics(String(data.totalClinics ?? 0));
        setTotalMedicalStores(String(data.totalMedicalStores ?? 0));
        setTotalAppointments(String(data.totalConfirmedAppointments ?? 0));
        setTotalBookingRevenue(Number(data.totalBookingRevenueInRupees ?? 0));
        setTotalAdminCommission(Number(data.totalAdminCommissionInRupees ?? 0));
        setRecentCommissions(Array.isArray(data.recentCommissions) ? data.recentCommissions : []);
      } catch (error) {
        // Keep static fallback values if stats endpoint is unavailable.
      }
    };

    loadStats();
  }, []);
  
  const stats = [
    { title: 'Total Patients', value: totalPatients, change: '+0%', isPositive: true },
    { title: 'Total Doctors', value: totalDoctors, change: '+0%', isPositive: true },
    { title: 'Total Clinics', value: totalClinics, change: '+0%', isPositive: true },
    { title: 'Medical Stores', value: totalMedicalStores, change: '+0%', isPositive: true },
    { title: 'Confirmed Bookings', value: totalAppointments, change: '+0%', isPositive: true },
    { title: 'Admin Commission', value: formatCurrency(totalAdminCommission), change: '+0%', isPositive: true },
  ];

  const chartData = [
    { label: 'Patients', value: Number(totalPatients) || 0, color: '#0EA5E9' },
    { label: 'Doctors', value: Number(totalDoctors) || 0, color: '#1EBDB8' },
    { label: 'Clinics', value: Number(totalClinics) || 0, color: '#6366F1' },
    { label: 'Stores', value: Number(totalMedicalStores) || 0, color: '#F59E0B' }
  ];

  const maxChartValue = Math.max(...chartData.map((item) => item.value), 1);
  const totalUsers = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">Platform Overview</h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">Monitor all users and activities across the platform.</p>
          </div>
          
          
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col gap-3">
              <div className="text-[14px] font-bold text-gray-500">{stat.title}</div>
              <div className="flex items-end justify-between">
                <span className="text-[24px] font-bold text-gray-900 leading-none">{stat.value}</span>
                <span className={`text-[13px] font-bold flex items-center gap-1 ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.isPositive ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
                  )}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] min-h-[420px] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <h2 className="text-[18px] font-bold text-gray-900">Users Chart</h2>
            <p className="text-[13px] font-semibold text-gray-500">
              Total users: <span className="text-gray-900">{totalUsers}</span>
            </p>
          </div>

          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="h-[260px] flex items-end justify-between gap-4 sm:gap-6">
              {chartData.map((item) => {
                const barHeight = Math.max((item.value / maxChartValue) * 100, item.value > 0 ? 8 : 0);

                return (
                  <div key={item.label} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                    <span className="text-[12px] font-bold text-gray-700">{item.value}</span>
                    <div className="w-full max-w-[72px] h-full flex items-end">
                      <div
                        className="w-full rounded-t-xl transition-all duration-500"
                        style={{
                          height: `${barHeight}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                    <span className="text-[12px] font-bold text-gray-500 text-center">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <h2 className="text-[18px] font-bold text-gray-900">Recent Commission Entries</h2>
            <p className="text-[13px] font-semibold text-gray-500">
              Booking Revenue: <span className="text-gray-900">{formatCurrency(totalBookingRevenue)}</span>
            </p>
          </div>

          {recentCommissions.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-10 text-center">
              <p className="text-[14px] font-medium text-gray-500">No paid bookings recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-500">Doctor</th>
                    <th className="py-3 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-500">Patient</th>
                    <th className="py-3 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-500">Paid Amount</th>
                    <th className="py-3 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-500">Admin 10%</th>
                    <th className="py-3 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-500">Paid On</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCommissions.map((commission) => (
                    <tr key={commission.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-3.5 pr-4 text-[14px] font-semibold text-gray-900">{commission.doctorName}</td>
                      <td className="py-3.5 pr-4 text-[14px] font-medium text-gray-700">{commission.patientName}</td>
                      <td className="py-3.5 pr-4 text-[14px] font-semibold text-gray-900">{formatCurrency(commission.amountInRupees)}</td>
                      <td className="py-3.5 pr-4 text-[14px] font-semibold text-[#0F766E]">{formatCurrency(commission.adminCommissionInRupees)}</td>
                      <td className="py-3.5 pr-4 text-[13px] font-medium text-gray-600">{formatDateLabel(commission.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}