import React from 'react';
import { Wallet, Activity, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

const formatCurrency = (amount) => {
  const n = Number(amount);
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(Number.isFinite(n) ? Math.max(0, n) : 0);
};

export default function OverviewStats({ overview = {}, isLoading = false, onWithdrawClick }) {
  const stats = [
    { label: 'Profile Views', value: isLoading ? '...' : String(overview.profileCtr || 0), change: 'Audience' },
    { label: 'Total Appointments', value: isLoading ? '...' : String(overview.totalAppointments || 0), change: 'Live' },
    { label: 'Clinic Revenue', value: isLoading ? '...' : formatCurrency(overview.totalRevenueInRupees || 0), change: 'Paid' },
    { label: 'Active Slots', value: isLoading ? '...' : String(overview.totalActiveSlots || 0), change: `${overview.activeDoctors || 0} doctors` }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow min-w-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 truncate mr-2">{stat.label}</span>
              <span className="shrink-0 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                {stat.change}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight truncate mr-2">{stat.value}</span>
              <div className="flex items-end gap-1 h-8 shrink-0">
                {[4, 7, 5, 8, 6, 9, 7].map((height, index) => (
                  <div key={index} className="w-1 bg-[#1EBDB8]/20 rounded-t-sm" style={{ height: `${height * 10}%` }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#1EBDB8]/10 hover:shadow-md transition-all">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="w-full md:w-auto">
            <p className="text-[12px] font-bold text-[#1EBDB8] uppercase tracking-widest mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Earning Summary
            </p>
            <p className="text-[42px] font-extrabold text-[#1F2432] leading-none mb-5">
              {isLoading ? '--' : formatCurrency(overview.totalRevenueInRupees || 0)}
            </p>
            <div className="flex flex-wrap gap-8 items-center pt-5 border-t border-gray-100">
              <div>
                <p className="text-[11px] text-[#6B7280] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Withdrawn</p>
                <p className="text-[20px] font-bold text-[#1F2432]">{isLoading ? '--' : formatCurrency(overview.withdrawnAmountInRupees || 0)}</p>
              </div>
              <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
              <div>
                <p className="text-[11px] text-[#6B7280] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Available</p>
                <p className="text-[20px] font-extrabold text-[#0F766E]">{isLoading ? '--' : formatCurrency(overview.availableBalanceInRupees || 0)}</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto self-stretch flex items-center md:pl-8 md:border-l border-gray-100">
            <button
              onClick={() => {
                if (!overview.hasBankAccount) {
                  toast.error('Please configure your bank account before withdrawing.');
                  return;
                }
                if ((overview.availableBalanceInRupees || 0) < 5000) {
                  toast.error('Minimum withdrawal amount is PKR 5,000');
                  return;
                }
                onWithdrawClick();
              }}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2.5 px-8 py-5 text-white rounded-[20px] font-bold text-[16px] transition-all shadow-sm ${
                (!overview.hasBankAccount || (overview.availableBalanceInRupees || 0) < 5000)
                  ? 'bg-[#115E59]/50 cursor-not-allowed hover:bg-[#115E59]/50'
                  : 'bg-[#115E59] hover:bg-[#0F766E]'
              }`}
            >
              <Wallet className="w-5 h-5" />
              Withdraw Funds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
