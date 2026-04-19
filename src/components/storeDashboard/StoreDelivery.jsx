import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Package, Truck, CheckCircle2, Clock, MapPin, Search, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const API = 'http://localhost:3002/api/store-orders';

const DELIVERY_STATUSES = ['accepted', 'ready', 'Processing', 'Processed', 'Dispatched', 'Delivered', 'completed'];
const DELIVERY_STAGES   = ['Processing', 'Processed', 'Dispatched', 'Delivered'];

const FILTER_TABS = [
  { id: 'All',        label: 'All Deliveries' },
  { id: 'Processing', label: 'Processing' },
  { id: 'Processed',  label: 'Processed' },
  { id: 'Dispatched', label: 'Dispatched' },
  { id: 'Delivered',  label: 'Delivered' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'accepted':
    case 'ready':
    case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'Processed':  return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'Dispatched': return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'Delivered':
    case 'completed':  return 'bg-[#ECFCFB] text-[#1EBDB8] border-[#1EBDB8]/20';
    default:           return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

const statusLabel = (status) => {
  if (status === 'accepted' || status === 'ready') return 'Processing';
  if (status === 'completed') return 'Delivered';
  return status;
};

const formatAddress = (notes) => {
  const match = notes?.match(/Address:\s*([^|]+)/i);
  return match ? match[1].trim() : '—';
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function StoreDelivery() {
  const [orders, setOrders]             = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm]     = useState('');
  const [updatingId, setUpdatingId]     = useState(null);
  const [openMenuId, setOpenMenuId]     = useState(null);
  const [menuPos, setMenuPos]           = useState({ top: 0, left: 0 });

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('medicalStoreToken');
      const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch');
      const all = await res.json();
      setOrders(all.filter(o => DELIVERY_STATUSES.includes(o.status)));
    } catch {
      toast.error('Could not load delivery orders.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Close on outside click or scroll
  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [openMenuId]);

  const openMenu = (e, orderId) => {
    e.stopPropagation();
    if (openMenuId === orderId) { setOpenMenuId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    // Position below the button, anchored to its right edge
    setMenuPos({ top: rect.bottom + 6, left: rect.right - 160 });
    setOpenMenuId(orderId);
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setOpenMenuId(null);
    try {
      const token = localStorage.getItem('medicalStoreToken');
      const res = await fetch(`${API}/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Update failed');
      }
      const updated = await res.json();
      setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Could not update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const normalised  = statusLabel(o.status);
    const matchStatus = filterStatus === 'All' || normalised === filterStatus;
    const q           = searchTerm.toLowerCase();
    const matchSearch = !q || o.patientName?.toLowerCase().includes(q) || String(o._id).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    pending:    orders.filter(o => ['accepted','ready','Processing','Processed'].includes(o.status)).length,
    dispatched: orders.filter(o => o.status === 'Dispatched').length,
    delivered:  orders.filter(o => o.status === 'Delivered' || o.status === 'completed').length,
  };

  // The currently open order (for the portaled dropdown)
  const openOrder = openMenuId ? orders.find(o => o._id === openMenuId) : null;

  return (
    <div className="space-y-8 text-slate-600">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl text-slate-800 font-semibold tracking-tight">Delivery Management</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Track accepted orders and update their delivery status in real-time.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-[#6B7280] hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Needs Processing', value: stats.pending,    icon: <Clock size={24} strokeWidth={1.5} />,        tag: 'Orders waiting',         tagColor: 'text-amber-600 bg-amber-50',       hover: 'group-hover:text-amber-500 group-hover:bg-amber-50' },
          { label: 'Out for Delivery', value: stats.dispatched, icon: <Truck size={24} strokeWidth={1.5} />,        tag: 'Currently dispatched',   tagColor: 'text-purple-600 bg-purple-50',     hover: 'group-hover:text-purple-500 group-hover:bg-purple-50' },
          { label: 'Delivered',        value: stats.delivered,  icon: <CheckCircle2 size={24} strokeWidth={1.5} />, tag: 'Successful deliveries',  tagColor: 'text-[#1EBDB8] bg-[#ECFCFB]',     hover: 'group-hover:text-[#1EBDB8] group-hover:bg-[#ECFCFB]' },
        ].map(card => (
          <div key={card.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-2">{card.label}</p>
              <h3 className="text-3xl text-slate-800 font-semibold tracking-tight mb-2">
                {isLoading ? <span className="text-gray-300">—</span> : card.value}
              </h3>
              <p className={`text-xs font-medium w-fit px-2 py-1 rounded-md ${card.tagColor}`}>{card.tag}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 ${card.hover} transition-colors`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">

        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap shrink-0 transition-all ${
                  filterStatus === tab.id
                    ? 'bg-[#1F2432] text-white shadow-sm'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search patient name or order ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#F9FAFB] border border-gray-100 text-[#1F2432] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8]/30 text-[14px] font-medium transition-all placeholder:text-[#9CA3AF]"
            />
          </div>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-[3px] border-[#1EBDB8]/20 border-t-[#1EBDB8] rounded-full animate-spin" />
            <p className="text-[14px] font-semibold text-[#6B7280]">Loading deliveries...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-lg text-slate-600 font-semibold mb-1">No deliveries found</p>
            <p className="text-sm font-medium text-slate-500">
              {searchTerm || filterStatus !== 'All'
                ? 'Try adjusting your search or filter.'
                : 'Accepted orders will appear here for delivery tracking.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-t border-b border-gray-100">
                    {['Patient', 'Medicines', 'Address', 'Total', 'Status', 'Actions'].map(h => (
                      <th key={h} className="py-3.5 px-5 first:pl-8 last:pr-8 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF] last:text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="border-b border-gray-100 last:border-b-0 hover:bg-[#F9FAFB] transition-colors group">

                      {/* Patient */}
                      <td className="py-4 px-5 pl-8">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#ECFCFB] flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-[#1EBDB8]" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#1F2432]">{order.patientName}</p>
                            <p className="text-[12px] text-[#9CA3AF]">{order.patientPhone || order.patientEmail || '—'}</p>
                            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{timeAgo(order.createdAt)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Medicines */}
                      <td className="py-4 px-5 max-w-[160px]">
                        {(order.items || []).length > 0 ? (
                          <div className="space-y-0.5">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <p key={idx} className="text-[12px] font-medium text-[#6B7280] truncate">{item.name} × {item.quantity}</p>
                            ))}
                            {order.items.length > 2 && <p className="text-[11px] text-[#9CA3AF]">+{order.items.length - 2} more</p>}
                          </div>
                        ) : <span className="text-[13px] text-[#9CA3AF]">—</span>}
                      </td>

                      {/* Address */}
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-1.5">
                          <MapPin size={14} className="text-[#9CA3AF] mt-0.5 shrink-0" />
                          <p className="text-[13px] font-medium text-[#6B7280] max-w-[180px] leading-snug">
                            {formatAddress(order.notes)}
                          </p>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-5">
                        <span className="text-[14px] font-bold text-[#1F2432]">
                          Rs {Number(order.totalAmount || 0).toLocaleString('en-PK')}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold border ${getStatusColor(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </td>

                      {/* Actions — click-based portaled dropdown */}
                      <td className="py-4 px-5 pr-8 text-right">
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => openMenu(e, order._id)}
                            disabled={updatingId === order._id}
                            className="p-2.5 text-[#9CA3AF] hover:text-[#1EBDB8] hover:bg-[#ECFCFB] rounded-xl transition-all disabled:opacity-40"
                            title="Update Delivery Status"
                          >
                            {updatingId === order._id ? (
                              <div className="w-[18px] h-[18px] border-2 border-[#1EBDB8]/30 border-t-[#1EBDB8] rounded-full animate-spin" />
                            ) : (
                              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden px-4 pb-6 pt-4 space-y-4">
              {filteredOrders.map(order => (
                <div key={order._id} className="bg-[#F9FAFB] rounded-[20px] p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#ECFCFB] flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-[#1EBDB8]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#1F2432]">{order.patientName}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{timeAgo(order.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold border ${getStatusColor(order.status)}`}>
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  {(order.items || []).length > 0 && (
                    <div className="mb-3 space-y-0.5">
                      {order.items.slice(0, 2).map((item, i) => (
                        <p key={i} className="text-[12px] text-[#6B7280]">{item.name} × {item.quantity}</p>
                      ))}
                      {order.items.length > 2 && <p className="text-[11px] text-[#9CA3AF]">+{order.items.length - 2} more</p>}
                    </div>
                  )}
                  <p className="text-[14px] font-bold text-[#1F2432] mb-3">
                    Rs {Number(order.totalAmount || 0).toLocaleString('en-PK')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    {DELIVERY_STAGES.map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(order._id, s)}
                        disabled={updatingId === order._id}
                        className={`py-2 rounded-xl text-[12px] font-bold transition-colors ${
                          statusLabel(order.status) === s
                            ? 'bg-[#1F2432] text-white'
                            : 'bg-white border border-gray-200 text-[#6B7280] hover:bg-gray-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Portaled dropdown – renders at fixed position, never clipped ── */}
      {openMenuId && openOrder && ReactDOM.createPortal(
        <div
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
          className="w-40 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden text-left"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-1">
            {DELIVERY_STAGES.map(s => {
              const isCurrent = statusLabel(openOrder.status) === s;
              return (
                <button
                  key={s}
                  onClick={() => updateStatus(openMenuId, s)}
                  disabled={updatingId === openMenuId}
                  className={`w-full text-left px-3 py-2.5 text-[13px] font-bold rounded-lg transition-colors flex items-center justify-between ${
                    isCurrent ? 'bg-[#1F2432] text-white' : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {s}
                  {isCurrent && <CheckCircle2 size={14} className="text-[#1EBDB8]" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
