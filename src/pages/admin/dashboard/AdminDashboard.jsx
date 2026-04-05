import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchAdminStats } from '../../../services/authApi';

export default function AdminDashboard() {
  const [totalPatients, setTotalPatients] = useState('0');
  const [totalDoctors, setTotalDoctors] = useState('0');
  const [totalClinics, setTotalClinics] = useState('0');
  const [totalMedicalStores, setTotalMedicalStores] = useState('0');

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col gap-3">
              <div className="text-[14px] font-bold text-gray-500">{stat.title}</div>
              <div className="flex items-end justify-between">
                <span className="text-[28px] font-bold text-gray-900 leading-none">{stat.value}</span>
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

      </div>
    </AdminLayout>
  );
}