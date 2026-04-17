import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';

const API = 'http://localhost:3002/api/store-orders';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: 'bg-amber-50',   text: 'text-amber-600',  border: 'border-amber-200' },
  reviewing: { label: 'Reviewing', bg: 'bg-blue-50',    text: 'text-blue-600',   border: 'border-blue-200' },
  accepted:  { label: 'Accepted',  bg: 'bg-[#ECFCFB]',  text: 'text-[#1EBDB8]', border: 'border-[#1EBDB8]/20' },
  ready:     { label: 'Ready',     bg: 'bg-[#ECFCFB]',  text: 'text-[#1EBDB8]', border: 'border-[#1EBDB8]/20' },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-600',border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-50',    text: 'text-rose-500',   border: 'border-rose-200' }
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const formatCurrency = (amount) => {
  const n = Math.max(0, Number(amount || 0));
  return `Rs ${n.toLocaleString('en-PK')}`;
};

// Show patient photo if available, otherwise initials circle
const PatientAvatar = ({ name = '', imageUrl = '', size = 'sm' }) => {
  const initials = String(name || '?').charAt(0).toUpperCase();
  const dim = size === 'lg' ? 'w-10 h-10' : 'w-9 h-9';
  const textSize = size === 'lg' ? 'text-[14px]' : 'text-[13px]';
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${dim} rounded-2xl object-cover shrink-0`}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.outerHTML = `<div class="${dim} rounded-2xl bg-[#1F2432] flex items-center justify-center shrink-0"><span class="${textSize} font-bold text-white">${initials}</span></div>`;
        }}
      />
    );
  }
  return (
    <div className={`${dim} rounded-2xl bg-[#1F2432] flex items-center justify-center shrink-0`}>
      <span className={`${textSize} font-bold text-white`}>{initials}</span>
    </div>
  );
};

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Detail / Prescription viewer modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  // Action states
  const [isActioning, setIsActioning] = useState(false);
  const [storeNote, setStoreNote] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  // Delete confirmation
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('medicalStoreToken');
      const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setOrders(await res.json());
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (orderId) => {
    setIsActioning(true);
    try {
      const token = localStorage.getItem('medicalStoreToken');
      const res = await fetch(`${API}/${orderId}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ storeNote })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const data = await res.json();
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      setSelectedOrder(data.order);
      toast.success('Order accepted! Patient will be notified by email.');
      setShowDeclineForm(false);
    } catch (err) {
      toast.error(err.message || 'Failed to accept order');
    } finally {
      setIsActioning(false);
    }
  };

  const handleDecline = async (orderId) => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }
    setIsActioning(true);
    try {
      const token = localStorage.getItem('medicalStoreToken');
      const res = await fetch(`${API}/${orderId}/decline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rejectionReason: declineReason, storeNote })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const data = await res.json();
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      setSelectedOrder(data.order);
      toast.success(data.refundProcessed ? 'Order declined. Stripe refund initiated.' : 'Order declined. Patient notified by email.');
      setShowDeclineForm(false);
      setDeclineReason('');
    } catch (err) {
      toast.error(err.message || 'Failed to decline order');
    } finally {
      setIsActioning(false);
    }
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('medicalStoreToken');
      const res = await fetch(`${API}/${orderToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setOrders(prev => prev.filter(o => o._id !== orderToDelete._id));
      toast.success('Order deleted');
      setOrderToDelete(null);
      if (selectedOrder?._id === orderToDelete._id) setSelectedOrder(null);
    } catch {
      toast.error('Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    accepted:  orders.filter(o => o.status === 'accepted').length,
    completed: orders.filter(o => o.status === 'completed').length
  }), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchFilter = activeFilter === 'all' || o.status === activeFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || 
        o.patientName.toLowerCase().includes(q) ||
        (o.patientEmail && o.patientEmail.toLowerCase().includes(q)) ||
        (o.patientPhone && o.patientPhone.includes(q));
      return matchFilter && matchSearch;
    });
  }, [orders, activeFilter, searchTerm]);

  const openDetail = (order) => {
    setSelectedOrder(order);
    setStoreNote(order.storeNote || '');
    setDeclineReason('');
    setShowDeclineForm(false);
  };

  const isPdf = (url) => url?.toLowerCase().includes('.pdf') || url?.toLowerCase().includes('/raw/');

  const isPending = (order) => ['pending', 'reviewing'].includes(order?.status);

  return (
    <div className="space-y-6">

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {[
          { label: 'Total Orders',   value: isLoading ? '--' : stats.total,     icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', iconBg: 'bg-[#ECFCFB] text-[#1EBDB8]' },
          { label: 'Pending Review', value: isLoading ? '--' : stats.pending,   icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-amber-50 text-amber-600' },
          { label: 'Accepted',       value: isLoading ? '--' : stats.accepted,  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', iconBg: 'bg-[#ECFCFB] text-[#1EBDB8]' },
          { label: 'Completed',      value: isLoading ? '--' : stats.completed, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-emerald-50 text-emerald-600' }
        ].map(s => (
          <div key={s.label} className="bg-white p-5 sm:p-6 rounded-[24px] shadow-sm border border-gray-100 hover:border-[#1EBDB8]/35 transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] sm:text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">{s.label}</p>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.iconBg} group-hover:scale-110 transition-transform`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
            </div>
            <p className="text-[22px] sm:text-[26px] leading-tight font-bold text-[#1F2432]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Main Panel ─── */}
      <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-bold text-[#1F2432]">Order Management</h3>
            <p className="text-[13px] text-[#9CA3AF] mt-0.5">Review, accept or decline incoming orders with prescription verification</p>
          </div>
          <div className="relative w-full lg:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by patient name, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full lg:w-[260px] border border-gray-100 rounded-2xl bg-[#F9FAFB] text-[14px] font-medium text-[#1F2432] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8]/30 transition-all"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-5 sm:px-8 pb-4 flex gap-2 overflow-x-auto">
          {[
            { id: 'all',       label: 'All Orders' },
            { id: 'pending',   label: 'Pending' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#1F2432] text-white shadow-sm'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-[3px] border-[#1EBDB8]/20 border-t-[#1EBDB8] rounded-full animate-spin" />
            <p className="text-[14px] font-semibold text-[#6B7280]">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 bg-[#F3F4F6] rounded-[28px] flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-[#D1D5DB]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-[18px] font-bold text-[#1F2432] mb-1">No orders found</h4>
            <p className="text-[14px] text-[#9CA3AF] text-center max-w-sm">
              {searchTerm || activeFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Orders submitted by patients will appear here.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-t border-b border-gray-100">
                    {['Patient', 'Medicines', 'Total', 'Payment', 'Status', 'Time', 'Actions'].map(h => (
                      <th key={h} className="py-3.5 px-5 first:pl-8 last:pr-8 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF] last:text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="border-b border-gray-100 last:border-b-0 hover:bg-[#F9FAFB] transition-colors group">
                      <td className="py-4 px-5 pl-8">
                        <div className="flex items-center gap-3">
                          <PatientAvatar name={order.patientName} imageUrl={order.patientImage} size="sm" />
                          <div>
                            <span className="text-[14px] font-semibold text-[#1F2432]">{order.patientName}</span>
                            <p className="text-[11px] text-[#9CA3AF]">{order.patientPhone || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 max-w-[200px]">
                        {(order.items || []).length > 0 ? (
                          <div className="space-y-0.5">
                            {(order.items || []).slice(0, 2).map((item, idx) => (
                              <p key={idx} className="text-[12px] text-[#4B5563] truncate">{item.name} × {item.quantity}</p>
                            ))}
                            {(order.items || []).length > 2 && (
                              <p className="text-[11px] text-[#9CA3AF]">+{order.items.length - 2} more</p>
                            )}
                          </div>
                        ) : <span className="text-[13px] text-[#9CA3AF]">—</span>}
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-[14px] font-bold text-[#1F2432]">{formatCurrency(order.totalAmount)}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${order.paymentMethod === 'stripe' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {order.paymentMethod === 'stripe' ? (
                            <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> Online</>
                          ) : (
                            <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg> COD</>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-[13px] text-[#9CA3AF]">{timeAgo(order.createdAt)}</span>
                      </td>
                      <td className="py-4 px-5 pr-8 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending(order) && (
                            <>
                              <button
                                onClick={() => { openDetail(order); }}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-bold rounded-xl transition-all active:scale-[0.97]"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => { openDetail(order); setShowDeclineForm(true); }}
                                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[12px] font-bold rounded-xl transition-all active:scale-[0.97]"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openDetail(order)}
                            className="p-2 text-[#9CA3AF] hover:text-[#1EBDB8] hover:bg-[#ECFCFB] rounded-xl transition-all"
                            title="View Details"
                          >
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden px-5 pb-6 space-y-4">
              {filteredOrders.map(order => (
                <div key={order._id} className="bg-[#F9FAFB] rounded-[20px] p-4 border border-gray-100 hover:border-[#1EBDB8]/25 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <PatientAvatar name={order.patientName} imageUrl={order.patientImage} size="lg" />
                      <div>
                        <p className="text-[15px] font-bold text-[#1F2432]">{order.patientName}</p>
                        <p className="text-[12px] text-[#9CA3AF]">{timeAgo(order.createdAt)}</p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  {(order.items || []).length > 0 && (
                    <div className="mb-3 space-y-1">
                      {order.items.slice(0, 2).map((item, i) => (
                        <p key={i} className="text-[12px] text-[#6B7280]">{item.name} × {item.quantity}</p>
                      ))}
                      {order.items.length > 2 && <p className="text-[11px] text-[#9CA3AF]">+{order.items.length - 2} more</p>}
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[14px] font-bold text-[#1F2432]">{formatCurrency(order.totalAmount)}</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${order.paymentMethod === 'stripe' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {order.paymentMethod === 'stripe' ? (
                        <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> Online</>
                      ) : (
                        <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg> COD</>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {isPending(order) ? (
                      <>
                        <button onClick={() => { openDetail(order); }} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-[13px] font-bold transition-colors">Accept</button>
                        <button onClick={() => { openDetail(order); setShowDeclineForm(true); }} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-[13px] font-bold transition-colors">Decline</button>
                      </>
                    ) : (
                      <button onClick={() => openDetail(order)} className="flex-1 bg-[#ECFCFB] text-[#1EBDB8] hover:bg-[#d8f7f6] py-2.5 rounded-xl text-[13px] font-bold transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── Order Detail Modal ─── */}
      {selectedOrder && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[999] flex items-start justify-center bg-[#1F2432]/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] w-full max-w-2xl shadow-2xl my-10">

            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex justify-between items-start bg-[#F9FAFB] rounded-t-[28px]">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <PatientAvatar name={selectedOrder.patientName} imageUrl={selectedOrder.patientImage} size="sm" />
                  <h3 className="text-[18px] font-bold text-[#1F2432]">{selectedOrder.patientName}</h3>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <p className="text-[12px] text-[#9CA3AF]">Order submitted {timeAgo(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-[#9CA3AF] hover:text-[#1F2432] hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Phone', value: selectedOrder.patientPhone || 'Not provided' },
                  { label: 'Email', value: selectedOrder.patientEmail || 'Not provided' }
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#F9FAFB] rounded-2xl p-4 border border-gray-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">{label}</p>
                    <p className="text-[14px] font-semibold text-[#1F2432]">{value}</p>
                  </div>
                ))}
              </div>

              {/* Order Items */}
              {(selectedOrder.items || []).length > 0 && (
                <div>
                  <p className="text-[13px] font-bold text-[#1F2432] mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#1EBDB8]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    Ordered Medicines
                  </p>
                  <div className="bg-[#F9FAFB] rounded-2xl border border-gray-100 overflow-hidden">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className={`flex justify-between items-center px-4 py-3 ${idx < selectedOrder.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div>
                          <p className="text-[14px] font-semibold text-[#1F2432]">{item.name}</p>
                          <p className="text-[12px] text-[#9CA3AF]">Qty: {item.quantity} · Unit: {formatCurrency(item.price)}</p>
                        </div>
                        <span className="text-[14px] font-bold text-[#1EBDB8]">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-4 py-3 bg-[#F0FDFD] border-t border-[#D8EFF0]">
                      <span className="text-[14px] font-bold text-[#1F2432]">Total</span>
                      <span className="text-[16px] font-bold text-[#1EBDB8]">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${selectedOrder.paymentMethod === 'stripe' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedOrder.paymentMethod === 'stripe' ? (
                        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> Pay Online (Stripe)</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg> Cash on Delivery</>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Patient Notes */}
              {selectedOrder.notes && (
                <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-gray-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Patient Notes</p>
                  <p className="text-[14px] text-[#1F2432] leading-relaxed">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Prescriptions */}
              <div>
                <p className="text-[13px] font-bold text-[#1F2432] mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1EBDB8]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                  Prescription Files ({selectedOrder.prescriptions.length})
                </p>
                {selectedOrder.prescriptions.length === 0 ? (
                  <div className="bg-[#F9FAFB] border border-dashed border-gray-200 rounded-2xl p-6 text-center">
                    <p className="text-[13px] text-[#9CA3AF]">No prescription files attached to this order.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedOrder.prescriptions.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => isPdf(p.url) ? window.open(p.url, '_blank') : setViewingImage(p.url)}
                        className="group relative bg-[#F9FAFB] border border-gray-100 rounded-2xl overflow-hidden aspect-square hover:border-[#1EBDB8]/40 transition-all hover:shadow-md"
                        title={p.originalName || `Prescription ${i + 1}`}
                      >
                        {isPdf(p.url) ? (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase">PDF</span>
                          </div>
                        ) : (
                          <>
                            <img src={p.url} alt={`Rx ${i + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-[#1F2432]/0 group-hover:bg-[#1F2432]/30 flex items-center justify-center transition-all">
                              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                            </div>
                          </>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/90 px-2 py-1">
                          <p className="text-[10px] font-semibold text-[#6B7280] truncate">{p.originalName || `File ${i + 1}`}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rejection/rejection details if cancelled */}
              {selectedOrder.status === 'cancelled' && selectedOrder.rejectionReason && (
                <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                  <p className="text-[12px] font-bold text-rose-700 uppercase tracking-wider mb-1">Rejection Reason</p>
                  <p className="text-[14px] text-rose-600">{selectedOrder.rejectionReason}</p>
                </div>
              )}

              {/* Accept / Decline Actions (only for pending orders) */}
              {isPending(selectedOrder) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Store Note (optional)</label>
                    <textarea
                      rows={2}
                      value={storeNote}
                      onChange={e => setStoreNote(e.target.value)}
                      placeholder="Add a note for the patient (e.g. delivery estimate, pickup time)..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] placeholder:text-[#9CA3AF] bg-white outline-none focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8]/40 resize-none transition-all"
                    />
                  </div>

                  {!showDeclineForm ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAccept(selectedOrder._id)}
                        disabled={isActioning}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[15px] font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.97] disabled:opacity-60"
                      >
                        {isActioning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✓ Accept Order'}
                      </button>
                      <button
                        onClick={() => setShowDeclineForm(true)}
                        disabled={isActioning}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-[15px] font-bold rounded-2xl transition-all shadow-lg shadow-rose-500/20 active:scale-[0.97] disabled:opacity-60"
                      >
                        ✕ Decline Order
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[12px] font-bold text-rose-600 uppercase tracking-wider mb-2">Reason for Declining *</label>
                        <textarea
                          rows={3}
                          value={declineReason}
                          onChange={e => setDeclineReason(e.target.value)}
                          placeholder="e.g. Prescription not valid, medicine out of stock, unclear prescription..."
                          className="w-full border border-rose-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] placeholder:text-[#9CA3AF] bg-white outline-none focus:ring-2 focus:ring-rose-300/30 focus:border-rose-400 resize-none transition-all"
                        />
                      </div>
                      {selectedOrder.paymentMethod === 'stripe' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-[12px] text-amber-700">
                          <strong>Payment Notice:</strong> If the patient paid online, a Stripe refund will be automatically initiated.
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setShowDeclineForm(false)}
                          disabled={isActioning}
                          className="py-3 bg-gray-100 hover:bg-gray-200 text-[#1F2432] text-[14px] font-bold rounded-2xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDecline(selectedOrder._id)}
                          disabled={isActioning || !declineReason.trim()}
                          className="flex items-center justify-center gap-2 py-3 bg-rose-500 hover:bg-rose-600 text-white text-[14px] font-bold rounded-2xl transition-colors shadow-lg shadow-rose-500/20 active:scale-[0.97] disabled:opacity-60"
                        >
                          {isActioning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Decline'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <button
                  onClick={() => { setOrderToDelete(selectedOrder); setSelectedOrder(null); }}
                  className="flex items-center gap-2 text-[13px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  Delete Order
                </button>
                <button onClick={() => setSelectedOrder(null)} className="px-5 py-2.5 bg-[#1F2432] text-white text-[13px] font-bold rounded-xl hover:bg-[#2d3548] transition-colors active:scale-[0.97]">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── Prescription Image Lightbox ─── */}
      {viewingImage && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
          onClick={() => setViewingImage(null)}
        >
          <button onClick={() => setViewingImage(null)} className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <img
            src={viewingImage}
            alt="Prescription"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>,
        document.body
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {orderToDelete && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1F2432]/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl p-7 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-[22px] flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#1F2432] mb-2">Delete Order?</h3>
            <p className="text-[14px] text-[#6B7280] mb-7">This will permanently delete the order from <span className="font-bold text-[#1F2432]">{orderToDelete.patientName}</span> and all attached prescription files.</p>
            <div className="flex gap-3">
              <button onClick={() => setOrderToDelete(null)} disabled={isDeleting} className="flex-1 px-4 py-3 text-[13px] font-bold text-[#6B7280] bg-[#F3F4F6] rounded-xl hover:bg-[#E5E7EB] transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 flex justify-center items-center py-3 text-[13px] font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 active:scale-[0.97]">
                {isDeleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
