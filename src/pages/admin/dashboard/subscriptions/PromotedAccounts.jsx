import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import { fetchAdminPromotedAccounts } from '../../../../services/authApi';

const formatDateLabel = (dateValue) => {
  if (!dateValue) return 'N/A';
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'N/A';
  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amountValue) => {
  const amount = Math.max(0, Math.trunc(Number(amountValue || 0)));
  return `Rs ${amount.toLocaleString('en-PK')}`;
};

const formatRoleLabel = (roleValue) => {
  const role = String(roleValue || '').trim().toLowerCase();
  if (role === 'medical-store') return 'Store';
  if (role === 'clinic') return 'Clinic';
  return 'Doctor';
};

export default function PromotedAccounts() {
  const [isLoading, setIsLoading] = useState(false);
  const [promotedAccounts, setPromotedAccounts] = useState([]);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAdminPromotedAccounts(adminToken);
        setPromotedAccounts(Array.isArray(data?.promotedAccounts) ? data.promotedAccounts : []);
      } catch (error) {
        toast.error(error?.message || 'Could not load promoted accounts');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    return promotedAccounts.reduce((acc, account) => {
      const status = String(account?.status || '').toLowerCase();
      if (status === 'active') acc.active += 1;
      if (status === 'expired') acc.expired += 1;
      acc.total += 1;
      return acc;
    }, { total: 0, active: 0, expired: 0 });
  }, [promotedAccounts]);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Promoted Accounts</h1>
          <p className="text-[14px] text-gray-500 font-medium mt-1">Sponsored doctor, clinic, and medical store campaigns with validity tracking.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Total Campaigns</p>
            <p className="mt-2 text-[32px] font-black text-[#1F2432]">{stats.total}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
            <p className="mt-2 text-[32px] font-black text-[#1EBDB8]">{stats.active}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Expired</p>
            <p className="mt-2 text-[32px] font-black text-gray-400">{stats.expired}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-gray-900">Campaign Validity</h2>
            <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-widest">Stripe Paid Promotions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Activated</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Expires</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Days left</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-400 font-medium">Loading promoted accounts...</td></tr>
                ) : promotedAccounts.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-400 font-medium">No promoted accounts found.</td></tr>
                ) : (
                  promotedAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-bold text-gray-900">{account.accountName}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">{account.accountEmail || account.accountPhone || 'No contact'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-[#1EBDB8]/10 text-[#1EBDB8]">
                          {formatRoleLabel(account.accountRole)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-gray-700">{account.planName}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-500">{formatCurrency(account.amountInRupees)}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-500">{formatDateLabel(account.activatedAt)}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-500">{formatDateLabel(account.expiresAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[14px] font-black text-gray-900">{account.daysRemaining || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${String(account.status).toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                          {account.status}
                        </span>
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
