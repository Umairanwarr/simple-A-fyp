import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import { fetchAdminStats } from '../../../../services/authApi';

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

const formatPlanLabel = (planValue) => {
  const normalizedPlan = String(planValue || '').trim().toLowerCase();

  if (!normalizedPlan) {
    return 'N/A';
  }

  return `${normalizedPlan.charAt(0).toUpperCase()}${normalizedPlan.slice(1)}`;
};

const getDaysRemaining = (planExpiryDate) => {
  if (!planExpiryDate) {
    return 0;
  }

  const expiry = new Date(planExpiryDate);

  if (Number.isNaN(expiry.getTime())) {
    return 0;
  }

  const remainingMs = expiry.getTime() - Date.now();

  if (remainingMs <= 0) {
    return 0;
  }

  return Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
};

export default function PremiumUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [totalGoldDoctors, setTotalGoldDoctors] = useState('0');
  const [totalDiamondDoctors, setTotalDiamondDoctors] = useState('0');

  useEffect(() => {
    let isMounted = true;

    const loadPremiumUsers = async () => {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        if (isMounted) {
          setPremiumUsers([]);
          setTotalGoldDoctors('0');
          setTotalDiamondDoctors('0');
        }

        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
        }

        const data = await fetchAdminStats(token);

        if (!isMounted) {
          return;
        }

        setPremiumUsers(Array.isArray(data?.premiumUsers) ? data.premiumUsers : []);
        setTotalGoldDoctors(String(data?.totalGoldDoctors ?? 0));
        setTotalDiamondDoctors(String(data?.totalDiamondDoctors ?? 0));
      } catch (error) {
        if (isMounted) {
          toast.error(error?.message || 'Could not load premium users');
          setPremiumUsers([]);
          setTotalGoldDoctors('0');
          setTotalDiamondDoctors('0');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPremiumUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPremiumUsers = useMemo(() => premiumUsers.length, [premiumUsers]);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">Premium Users</h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">
              Live list of doctors on Gold and Diamond plans.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <p className="text-[13px] font-bold text-gray-500">Gold Doctors</p>
            <p className="mt-2 text-[28px] font-bold text-gray-900">{totalGoldDoctors}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <p className="text-[13px] font-bold text-gray-500">Diamond Doctors</p>
            <p className="mt-2 text-[28px] font-bold text-gray-900">{totalDiamondDoctors}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <p className="text-[13px] font-bold text-gray-500">Total Premium Users</p>
            <p className="mt-2 text-[28px] font-bold text-gray-900">{totalPremiumUsers}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="text-[18px] font-bold text-gray-900">Gold and Diamond Users</h2>
            <span className="text-[12px] font-semibold text-gray-500">Auto-updated from subscription payments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Specialization</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Purchased</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Days Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      Loading premium users...
                    </td>
                  </tr>
                ) : null}

                {!isLoading && premiumUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      No active premium users yet.
                    </td>
                  </tr>
                ) : null}

                {!isLoading && premiumUsers.map((premiumUser) => {
                  const daysRemaining = getDaysRemaining(premiumUser?.planExpiresAt);

                  return (
                    <tr key={premiumUser.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-bold text-gray-900">{premiumUser.fullName}</p>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-700">
                        <div>{premiumUser.email || 'N/A'}</div>
                        <div className="text-[12px] text-gray-500 mt-0.5">{premiumUser.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-700">{premiumUser.specialization || 'General'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1EBDB8]/10 text-[#0F766E] border border-[#1EBDB8]/20">
                          {formatPlanLabel(premiumUser.currentPlan)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-600">{formatDateLabel(premiumUser.purchasedAt)}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-600">{formatDateLabel(premiumUser.planExpiresAt)}</td>
                      <td className="px-6 py-4 text-[13px] font-bold text-gray-800">{daysRemaining}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
