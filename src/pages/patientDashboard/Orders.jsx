import React, { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, Search, RefreshCw, CheckCircle2, Clock, Truck, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchPatientStoreOrders } from '../../services/authApi';
import PatientDashboardLayout from './PatientDashboardLayout';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
    case 'reviewing':  return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'accepted':   return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'ready':
    case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'Processed':  return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'Dispatched': return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'Delivered':  return 'bg-[#ECFCFB] text-[#1EBDB8] border-[#1EBDB8]/20';
    case 'cancelled':  return 'bg-red-50 text-red-600 border-red-200';
    default:           return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

const getStatusLabel = (status) => {
  if (status === 'accepted') return 'Accepted';
  if (status === 'ready') return 'Processing';
  if (status === 'reviewing') return 'Reviewing';
  return status.charAt(0).toUpperCase() + status.slice(1);
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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('All');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('patientToken');
      const data = await fetchPatientStoreOrders(token);
      setOrders(data.orders || []);
    } catch {
      toast.error('Could not load your orders.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(o => {
    const q = searchTerm.toLowerCase();
    const storeName = (o.storeId?.name || '').toLowerCase();
    const orderId = String(o._id).toLowerCase();
    const matchSearch = !q || storeName.includes(q) || orderId.includes(q);

    let matchFilter = true;
    if (filterMode === 'Active') {
      matchFilter = !['Delivered', 'cancelled'].includes(o.status);
    } else if (filterMode === 'Completed') {
      matchFilter = ['Delivered', 'completed'].includes(o.status);
    }

    return matchSearch && matchFilter;
  });

  return (
    <PatientDashboardLayout activeTab="orders">
      <div className="space-y-8 text-slate-600 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl text-slate-800 font-semibold tracking-tight">My Orders</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Track your medical store orders and delivery status.
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

      {/* Main Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto [&::-webkit-scrollbar]:hidden">
            {['All', 'Active', 'Completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterMode(tab)}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap shrink-0 transition-all ${
                  filterMode === tab
                    ? 'bg-[#1F2432] text-white shadow-sm'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                }`}
              >
                {tab} Orders
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search store name or order ID..."
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
            <p className="text-[14px] font-semibold text-[#6B7280]">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-lg text-slate-600 font-semibold mb-1">No orders found</p>
            <p className="text-sm font-medium text-slate-500">
              {searchTerm || filterMode !== 'All'
                ? 'Try adjusting your search or filter.'
                : "You haven't placed any orders yet."}
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-6">
            {filteredOrders.map(order => (
              <div key={order._id} className="border border-slate-100 bg-[#FAFAFB] rounded-2xl p-5 md:p-6 flex flex-col xl:flex-row gap-6 shadow-sm">
                
                {/* Order Meta & Store Info */}
                <div className="xl:w-[320px] shrink-0 border-b xl:border-b-0 xl:border-r border-slate-200 pb-5 xl:pb-0 xl:pr-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="text-[12px] font-medium text-slate-400">{timeAgo(order.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {order.storeId?.avatarDocument?.url ? (
                        <img src={order.storeId.avatarDocument.url} alt="Store" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-800">{order.storeId?.name || 'Medical Store'}</p>
                      <p className="text-[13px] text-slate-500">ID: #{String(order._id).slice(-8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[13px] text-slate-600 flex justify-between">
                      <span className="text-slate-400 font-medium">Items</span>
                      <span className="font-semibold">{order.items?.length || 0} items</span>
                    </p>
                    <p className="text-[13px] text-slate-600 flex justify-between">
                      <span className="text-slate-400 font-medium">Payment</span>
                      <span className="font-semibold uppercase">{order.paymentMethod}</span>
                    </p>
                    <p className="text-[14px] text-slate-800 flex justify-between pt-2 border-t border-slate-100 mt-2">
                      <span className="text-slate-500 font-semibold">Total</span>
                      <span className="font-bold">Rs {Number(order.totalAmount || 0).toLocaleString('en-PK')}</span>
                    </p>
                  </div>
                </div>

                {/* Tracking Pipeline & Items */}
                <div className="flex-1 flex flex-col justify-between pt-2 xl:pt-0">
                  {/* Visual Tracker */}
                  {!['cancelled'].includes(order.status) && (
                    <div className="mb-6 xl:mb-4 px-2 tracking-pipeline w-full max-w-2xl">
                      <div className="flex items-start justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-6 right-6 h-[2px] bg-slate-200 -z-10" />
                        
                        {/* Stages */}
                        {[
                          { key: 'placed', label: 'Placed', icon: <FileText size={16} /> },
                          { key: 'Processing', label: 'Processing', icon: <Package size={16} /> },
                          { key: 'Dispatched', label: 'Dispatched', icon: <Truck size={16} /> },
                          { key: 'Delivered', label: 'Delivered', icon: <CheckCircle2 size={16} /> }
                        ].map((stage, idx) => {
                          const stagesList = ['pending', 'reviewing', 'accepted', 'ready', 'Processing', 'Processed', 'Dispatched', 'Delivered'];
                          const currentIdx = stagesList.indexOf(order.status);
                          
                          let stageIdxRank = 0;
                          if (stage.key === 'Processing') stageIdxRank = 4;
                          else if (stage.key === 'Dispatched') stageIdxRank = 6;
                          else if (stage.key === 'Delivered') stageIdxRank = 7;
                          
                          const isCompleted = currentIdx >= stageIdxRank || (stage.key === 'placed' && currentIdx >= 0) || order.status === 'completed';
                          const isCurrent = (stage.key === 'Processing' && ['accepted', 'ready', 'Processing', 'Processed'].includes(order.status)) ||
                                            (stage.key === 'placed' && ['pending', 'reviewing'].includes(order.status)) ||
                                            (stage.key === order.status);

                          return (
                            <div key={stage.key} className="flex flex-col items-center gap-2 z-10 bg-[#FAFAFB]">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isCompleted 
                                  ? 'bg-[#1EBDB8] border-[#1EBDB8] text-white shadow-sm shadow-[#1EBDB8]/30' 
                                  : 'bg-white border-slate-200 text-slate-300'
                              }`}>
                                {stage.icon}
                              </div>
                              <span className={`text-[11px] font-bold ${isCurrent ? 'text-[#1EBDB8]' : (isCompleted ? 'text-slate-600' : 'text-slate-400')}`}>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Medicines List */}
                  <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-3">Order Items</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <Package size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-700 truncate">{item.name}</p>
                            <p className="text-[12px] text-slate-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PatientDashboardLayout>
  );
}
