import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import { fetchAdminWithdrawRequests, reviewAdminWithdrawRequest } from '../../../services/authApi';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(Number(amount || 0));
};

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200'
};

function RejectModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md space-y-5">
        <h3 className="text-[18px] font-bold text-[#1F2432]">Reject Withdrawal</h3>
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-[#4B5563]">Rejection Reason (optional)</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Provide a reason for rejection..."
            rows="3"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-300 text-[14px] resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[#6B7280] font-bold hover:bg-gray-50">Cancel</button>
          <button onClick={() => onConfirm(reason)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Confirm Reject</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminWithdrawRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  const token = localStorage.getItem('adminToken');

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAdminWithdrawRequests(token);
      if (data.requests) setRequests(data.requests);
    } catch (err) {
      toast.error('Could not load withdrawal requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleApprove = async (requestId) => {
    try {
      setActionLoadingId(requestId);
      await reviewAdminWithdrawRequest(token, requestId, { action: 'approve' });
      toast.success('Withdrawal approved and email sent to doctor');
      loadRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      setActionLoadingId(requestId);
      setRejectTarget(null);
      await reviewAdminWithdrawRequest(token, requestId, { action: 'reject', rejectionReason: reason });
      toast.success('Withdrawal rejected');
      loadRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">Withdrawal Requests</h1>
            <p className="text-[14px] text-gray-500 mt-1">Review and process doctor withdrawal requests.</p>
          </div>
          {pendingCount > 0 && (
            <span className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-[13px] font-bold text-yellow-700">
              {pendingCount} Pending
            </span>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[['all', 'All', requests.length], ['pending', 'Pending', requests.filter(r=>r.status==='pending').length], ['approved', 'Approved', requests.filter(r=>r.status==='approved').length], ['rejected', 'Rejected', requests.filter(r=>r.status==='rejected').length]].map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 rounded-2xl border text-left transition-all ${filter === key ? 'border-[#1EBDB8] bg-[#F4FDFD]' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
              <p className="text-[24px] font-bold text-gray-900 mt-1">{count}</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-[3px] border-[#1EBDB8] border-t-transparent animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <p className="text-[15px] font-semibold text-gray-500">No {filter === 'all' ? '' : filter} requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="py-3.5 px-5 text-[12px] font-bold uppercase tracking-wider text-gray-500">Requester</th>
                    <th className="py-3.5 px-5 text-[12px] font-bold uppercase tracking-wider text-gray-500">Amount</th>
                    <th className="py-3.5 px-5 text-[12px] font-bold uppercase tracking-wider text-gray-500">Bank Details</th>
                    <th className="py-3.5 px-5 text-[12px] font-bold uppercase tracking-wider text-gray-500">Requested</th>
                    <th className="py-3.5 px-5 text-[12px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="py-3.5 px-5 text-[12px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(req => {
                    const user = req.doctorId || req.storeId || {};
                    const isStore = !!req.storeId;
                    const userName = isStore ? user.name : user.fullName;
                    const userRoleLabel = isStore ? 'Medical Store' : 'Doctor';
                    const avatarUrl = isStore ? (user.avatarUrl || user.avatarDocument?.url) : user.avatarDocument?.url;
                    const available = Math.max(0, (user.totalEarningsInRupees || 0) - (user.withdrawnAmountInRupees || 0));

                    return (
                      <tr key={req._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#1EBDB8]">
                              {avatarUrl ? (
                                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                  {String(userName || 'U').charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-gray-900">{userName || 'Unknown'}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${isStore ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {userRoleLabel}
                                </span>
                                <p className="text-[12px] text-gray-500">{user.email}</p>
                              </div>
                              <p className="text-[11px] text-[#1EBDB8] font-semibold mt-0.5">Available: {formatCurrency(available)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <p className="text-[16px] font-bold text-gray-900">{formatCurrency(req.amountInRupees)}</p>
                        </td>
                        <td className="py-4 px-5">
                          <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-3.5 min-w-[200px] flex flex-col gap-2.5">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Account Title</p>
                              <p className="text-[14px] font-bold text-[#1F2432]">{req.bankAccountTitle || '—'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Bank Name</p>
                              <p className="text-[12px] font-bold text-[#1EBDB8] uppercase tracking-wide">{req.bankName || '—'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Number</p>
                              <div className="bg-white border border-gray-200 shadow-sm rounded-lg text-[13px] font-mono font-bold text-gray-800 px-3 py-1.5 tracking-wider break-all inline-block">
                                {req.bankAccountNumber || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-[13px] text-gray-600">
                          {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold capitalize ${STATUS_STYLES[req.status] || STATUS_STYLES.pending}`}>
                            {req.status}
                          </span>
                          {req.rejectionReason && (
                            <p className="text-[11px] text-red-500 mt-1 max-w-[150px] truncate" title={req.rejectionReason}>
                              {req.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          {req.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(req._id)}
                                disabled={actionLoadingId === req._id}
                                className="px-4 py-2 bg-green-500 text-white rounded-xl text-[12px] font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                {actionLoadingId === req._id ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => setRejectTarget(req._id)}
                                disabled={actionLoadingId === req._id}
                                className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-[12px] font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[12px] text-gray-400">
                              {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Reviewed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {rejectTarget && (
        <RejectModal
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => handleReject(rejectTarget, reason)}
        />
      )}
    </AdminLayout>
  );
}
