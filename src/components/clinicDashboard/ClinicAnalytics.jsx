import React, { useEffect, useState } from 'react';
import OverviewStats from './analytics/OverviewStats';
import PatientEngagement from './analytics/PatientEngagement';
import BookingTrends from './analytics/BookingTrends';
import DiamondAdvancedAnalytics from './analytics/DiamondAdvancedAnalytics';
import { fetchClinicAnalytics, createClinicWithdrawRequest } from '../../services/authApi';
import { toast } from 'react-toastify';
import { Wallet } from 'lucide-react';

const formatCurrency = (amountInRupees) => {
  const parsedAmount = Number(amountInRupees);
  const safeAmount = Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : 0;
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(safeAmount);
};

function WithdrawModal({ available, bankAccount, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsed = Math.trunc(Number(amount));
    if (parsed < 5000) return toast.error('Minimum withdrawal amount is PKR 5,000');
    if (parsed > available) return toast.error(`Insufficient balance. Available: ${formatCurrency(available)}`);
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('clinicToken');
      await createClinicWithdrawRequest(token, { amountInRupees: parsed });
      toast.success('Withdrawal request submitted!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0F766E]/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-bold text-[#1F2432] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#1EBDB8]" />
            Request Withdrawal
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="bg-[#ECFCFB] border border-[#1EBDB8]/20 rounded-2xl p-5">
          <p className="text-[12px] font-bold text-[#0F766E] uppercase tracking-wider">Available Balance</p>
          <p className="text-[32px] font-bold text-[#115E59] mt-1 tracking-tight">{formatCurrency(available)}</p>
        </div>

        <div className="space-y-2.5">
          <label className="text-[14px] font-bold text-[#1F2432]">Amount to Withdraw (PKR)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Min: 5,000"
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#1EBDB8] focus:bg-white text-[#1F2432] text-[16px] font-bold transition-colors"
          />
          <p className="text-[12px] text-[#6B7280] font-medium">Minimum withdrawal: PKR 5,000. Funds arrive in 2–3 business days.</p>
        </div>

        {bankAccount && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h4 className="text-[14px] font-bold text-[#1F2432] mb-3 flex items-center gap-1.5">
              Confirm Bank Details
            </h4>
            <div className="text-[13px] text-[#4B5563] space-y-1.5 mb-3">
              <p className="flex justify-between border-b border-gray-100 pb-1.5"><span>Bank</span><strong className="text-[#1F2432]">{bankAccount.bankName}</strong></p>
              <p className="flex justify-between border-b border-gray-100 pb-1.5 pt-1"><span>Title</span><strong className="text-[#1F2432]">{bankAccount.accountTitle}</strong></p>
              <p className="flex justify-between pt-1"><span>Account</span><strong className="text-[#1F2432]">{bankAccount.accountNumber}</strong></p>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed font-semibold">
              Note: Unverified accounts may experience delays. Ensure your profile details match.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-[0.4] py-3.5 rounded-2xl border border-gray-200 text-[#6B7280] font-bold hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !amount}
            className="flex-1 py-3.5 rounded-2xl bg-[#1EBDB8] text-white font-bold hover:bg-[#1CAAAE] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            Confirm Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClinicAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const token = localStorage.getItem('clinicToken');
        if (!token) return;
        const data = await fetchClinicAnalytics(token);
        if (isMounted) setAnalytics(data);
      } catch {
        if (isMounted) setAnalytics(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAnalytics();
    const intervalId = window.setInterval(loadAnalytics, 30000);
    window.addEventListener('clinic-appointments-updated', loadAnalytics);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('clinic-appointments-updated', loadAnalytics);
    };
  }, []);

  const handleWithdrawClick = () => {
    if (!analytics?.overview?.hasBankAccount) {
      toast.error('Please link your Bank Account in the Profile section first.');
      return;
    }
    setShowWithdrawModal(true);
  };

  const uiTier = String(analytics?.uiTier || analytics?.overview?.currentPlan || 'platinum').toLowerCase();
  const isPlatinum = uiTier === 'platinum';
  const isDiamond = uiTier === 'diamond';

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 w-full min-w-0 ${isPlatinum ? 'opacity-90' : ''}`}>
      <OverviewStats overview={analytics?.overview} isLoading={isLoading} onWithdrawClick={handleWithdrawClick} />

      {isDiamond ? (
        <div className="rounded-2xl border border-[#1EBDB8]/25 bg-[#ECFCFB] p-4">
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#0F766E]">Advanced Reporting</p>
          <p className="text-[14px] text-[#0F766E] mt-1">Diamond analytics is active with full provider and capacity insights.</p>
        </div>
      ) : null}

      {!isPlatinum ? (
        <div className="space-y-6 w-full min-w-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full min-w-0">
            <PatientEngagement engagement={analytics?.patientEngagement} isLoading={isLoading} />
            <BookingTrends trendData={analytics?.bookingTrends} isLoading={isLoading} />
          </div>
          {isDiamond ? (
            <DiamondAdvancedAnalytics data={analytics?.diamondAdvancedAnalytics} isLoading={isLoading} />
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
          <p className="text-[13px] font-semibold text-gray-700">
            Profile Views: {Number(analytics?.overview?.profileCtr || 0).toLocaleString()}
          </p>
          <p className="text-[13px] font-semibold text-gray-700">Upgrade your clinic plan to unlock provider-level and capacity insights.</p>
        </div>
      )}

      {showWithdrawModal && (
        <WithdrawModal
          available={analytics?.overview?.availableBalanceInRupees || 0}
          bankAccount={analytics?.overview?.bankAccount}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={() => {
            setIsLoading(true);
            const token = localStorage.getItem('clinicToken');
            if (token) {
              fetchClinicAnalytics(token).then(data => {
                setAnalytics(data);
                setIsLoading(false);
              }).catch(() => setIsLoading(false));
            }
          }}
        />
      )}
    </div>
  );
}
