import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import { fetchAdminStats } from '../../../../services/authApi';

const formatDateLabel = (dateValue) => {
  if (!dateValue) return 'N/A';
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'N/A';
  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatPlanLabel = (planValue) => {
  const normalizedPlan = String(planValue || '').trim().toLowerCase();
  if (!normalizedPlan) return 'N/A';
  return `${normalizedPlan.charAt(0).toUpperCase()}${normalizedPlan.slice(1)}`;
};

const getDaysRemaining = (planExpiryDate) => {
  if (!planExpiryDate) return 0;
  const expiry = new Date(planExpiryDate);
  if (Number.isNaN(expiry.getTime())) return 0;
  const remainingMs = expiry.getTime() - Date.now();
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
};

export default function PremiumUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [stats, setStats] = useState({
    totalGoldDoctors: 0,
    totalDiamondDoctors: 0,
    totalGoldStores: 0,
    totalDiamondStores: 0
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAdminStats(adminToken);
        setPremiumUsers(Array.isArray(data?.premiumUsers) ? data.premiumUsers : []);
        setStats({
          totalGoldDoctors: data?.totalGoldDoctors ?? 0,
          totalDiamondDoctors: data?.totalDiamondDoctors ?? 0,
          totalGoldStores: data?.totalGoldStores ?? 0,
          totalDiamondStores: data?.totalDiamondStores ?? 0
        });
      } catch (error) {
        toast.error(error?.message || 'Could not load premium users');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const totalPremiumUsers = useMemo(() => premiumUsers.length, [premiumUsers]);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Premium Users</h1>
          <p className="text-[14px] text-gray-500 font-medium mt-1">Live list of Doctors and Medical Stores on Gold and Diamond plans.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Gold Doctors</p>
            <p className="mt-2 text-[32px] font-black text-[#1EBDB8]">{stats.totalGoldDoctors}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Diamond Doctors</p>
            <p className="mt-2 text-[32px] font-black text-[#1EBDB8]">{stats.totalDiamondDoctors}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Gold Stores</p>
            <p className="mt-2 text-[32px] font-black text-[#1EBDB8]">{stats.totalGoldStores}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Diamond Stores</p>
            <p className="mt-2 text-[32px] font-black text-[#1EBDB8]">{stats.totalDiamondStores}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-gray-900">Active Subscriptions ({totalPremiumUsers})</h2>
            <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-widest">Verified Payments Only</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Purchased</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Expires</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Days left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">Loading premium fleet...</td></tr>
                ) : premiumUsers.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">No active premium users found.</td></tr>
                ) : (
                  premiumUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-bold text-gray-900">{u.fullName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'Doctor' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-medium text-gray-600">{u.email}</p>
                        <p className="text-[11px] text-gray-400 uppercase mt-0.5">{u.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-[#1EBDB8]/10 text-[#1EBDB8] border border-[#1EBDB8]/20">
                          {formatPlanLabel(u.currentPlan)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-500">{formatDateLabel(u.purchasedAt)}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-500">{formatDateLabel(u.planExpiresAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[14px] font-black text-gray-900">{getDaysRemaining(u.planExpiresAt)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
