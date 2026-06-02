import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Pill,
  ShoppingBag,
  Loader2,
  AlertCircle,
  RefreshCw,
  Wallet,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchStoreBankAccount, createStoreWithdrawRequest } from '../../services/authApi';
import { getMedicalStoreSessionProfile } from '../../utils/authSession';
import { API_BASE_URL } from '../../services/apiClient';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getAuthHeaders() {
  const token = localStorage.getItem('medicalStoreToken');
  return { Authorization: `Bearer ${token}` };
}

function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
      <div className="h-3 bg-slate-100 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-slate-100 rounded w-1/3 mb-3"></div>
      <div className="h-3 bg-slate-100 rounded w-2/5"></div>
    </div>
  );
}

export default function StoreAnalytics() {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7');

  const [bankInfo, setBankInfo] = useState({ availableBalanceInRupees: 0, bankAccount: null, withdrawnAmountInRupees: 0 });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const currentPlan = String(getMedicalStoreSessionProfile()?.currentPlan || 'platinum').toLowerCase();
  const isGold = currentPlan === 'gold';
  const isDiamond = currentPlan === 'diamond';
  const isPlatinum = !isGold && !isDiamond;

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersRes, medsRes, bankRes] = await Promise.all([
        fetch(`${API_BASE_URL}/store-orders`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/medicines`, { headers: getAuthHeaders() }),
        fetchStoreBankAccount(localStorage.getItem('medicalStoreToken')).catch(() => ({ availableBalanceInRupees: 0, bankAccount: null, withdrawnAmountInRupees: 0 }))
      ]);

      if (!ordersRes.ok || !medsRes.ok) throw new Error('Failed to fetch analytics data');

      const [ordersData, medsData] = await Promise.all([ordersRes.json(), medsRes.json()]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setMedicines(Array.isArray(medsData) ? medsData : []);
      setBankInfo({
        availableBalanceInRupees: Math.max(0, Number(bankRes.availableBalanceInRupees) || 0),
        bankAccount: bankRes.bankAccount || null,
        withdrawnAmountInRupees: Math.max(0, Number(bankRes.withdrawnAmountInRupees) || 0)
      });
    } catch (err) {
      setError(err.message || 'Could not load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredOrders = useMemo(() => {
    const days = Number(timeRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return orders.filter((order) => new Date(order.createdAt) >= cutoff);
  }, [orders, timeRange]);

  const metrics = useMemo(() => {
    const total = filteredOrders.length;
    const completed = filteredOrders.filter((order) => order.status === 'completed').length;
    const cancelled = filteredOrders.filter((order) => order.status === 'cancelled').length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
    const totalRevenue = filteredOrders
      .filter((order) => order.status === 'completed')
      .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

    const uniqueCustomers = new Set(
      filteredOrders
        .map((order) => String(order?.patientId || order?.patientEmail || '').trim())
        .filter(Boolean)
    ).size;
    const averageOrderValue = completed > 0 ? totalRevenue / completed : 0;
    const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0;

    return {
      total,
      completed,
      cancelled,
      completionRate,
      totalRevenue,
      uniqueCustomers,
      averageOrderValue,
      cancellationRate
    };
  }, [filteredOrders]);

  const orderTrendData = useMemo(() => {
    const buckets = DAY_LABELS.map((name) => ({ name, completed: 0, cancelled: 0 }));
    filteredOrders.forEach((order) => {
      const dayIndex = new Date(order.createdAt).getDay();
      if (order.status === 'completed') buckets[dayIndex].completed += 1;
      if (order.status === 'cancelled') buckets[dayIndex].cancelled += 1;
    });
    const today = new Date().getDay();
    return [...buckets.slice(today + 1), ...buckets.slice(0, today + 1)];
  }, [filteredOrders]);

  const topMedicines = useMemo(() => {
    const salesMap = {};
    const categoryByName = new Map(
      medicines.map((medicine) => [String(medicine?.name || '').trim().toLowerCase(), String(medicine?.category || '').trim() || 'General'])
    );

    filteredOrders
      .filter((order) => order.status === 'completed')
      .forEach((order) => {
        (order.items || []).forEach((item) => {
          const key = String(item?.medicineId || item?.name || '').trim();
          if (!key) return;
          if (!salesMap[key]) {
            const normalizedName = String(item?.name || '').trim().toLowerCase();
            salesMap[key] = {
              name: String(item?.name || 'Medicine').trim(),
              sales: 0,
              revenue: 0,
              category: categoryByName.get(normalizedName) || 'General'
            };
          }
          salesMap[key].sales += Number(item?.quantity) || 0;
          salesMap[key].revenue += (Number(item?.price) || 0) * (Number(item?.quantity) || 0);
        });
      });

    return Object.values(salesMap).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [filteredOrders, medicines]);

  const salesTrendData = useMemo(() => {
    const mapped = new Map();
    filteredOrders
      .filter((order) => order.status === 'completed')
      .forEach((order) => {
        const date = new Date(order.createdAt);
        if (Number.isNaN(date.getTime())) return;
        const key = timeRange === '365'
          ? `${date.getFullYear()}-${date.getMonth()}`
          : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!mapped.has(key)) {
          const label = timeRange === '365'
            ? date.toLocaleDateString('en-US', { month: 'short' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          mapped.set(key, { ts: date.getTime(), name: label, sales: 0, orders: 0 });
        }
        const bucket = mapped.get(key);
        bucket.sales += Number(order.totalAmount) || 0;
        bucket.orders += 1;
      });

    return Array.from(mapped.values())
      .sort((a, b) => a.ts - b.ts)
      .slice(timeRange === '365' ? -12 : -14)
      .map(({ name, sales, orders: orderCount }) => ({ name, sales, orders: orderCount }));
  }, [filteredOrders, timeRange]);

  const customerDemandData = useMemo(() => {
    const demandMap = {};
    const categoryByName = new Map(
      medicines.map((medicine) => [String(medicine?.name || '').trim().toLowerCase(), String(medicine?.category || '').trim() || 'General'])
    );

    filteredOrders
      .filter((order) => order.status === 'completed')
      .forEach((order) => {
        (order.items || []).forEach((item) => {
          const normalizedName = String(item?.name || '').trim().toLowerCase();
          const category = categoryByName.get(normalizedName) || 'General';
          demandMap[category] = (demandMap[category] || 0) + (Number(item?.quantity) || 0);
        });
      });

    return Object.entries(demandMap)
      .map(([name, demand]) => ({ name, demand }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 6);
  }, [filteredOrders, medicines]);

  const performanceInsights = useMemo(() => ([
    {
      title: 'Completion Rate',
      value: `${metrics.completionRate}%`,
      helper: `${metrics.completed} completed / ${metrics.total} total`
    },
    {
      title: 'Avg. Order Value',
      value: `Rs ${Math.round(metrics.averageOrderValue).toLocaleString()}`,
      helper: 'Based on completed orders'
    },
    {
      title: 'Customer Reach',
      value: `${metrics.uniqueCustomers}`,
      helper: 'Unique ordering customers'
    },
    {
      title: 'Cancellation Rate',
      value: `${metrics.cancellationRate.toFixed(1)}%`,
      helper: `${metrics.cancelled} cancelled orders`
    }
  ]), [metrics]);

  const timeRangeLabel = { '7': 'Last 7 Days', '30': 'Last 30 Days', '365': 'This Year' }[timeRange];

  const handleWithdraw = async (event) => {
    event.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) < 5000) {
      toast.error('Minimum withdrawal amount is PKR 5,000');
      return;
    }
    if (Number(withdrawAmount) > bankInfo.availableBalanceInRupees) {
      toast.error('Insufficient available balance');
      return;
    }

    try {
      setIsWithdrawing(true);
      const token = localStorage.getItem('medicalStoreToken');
      await createStoreWithdrawRequest(token, { amountInRupees: Number(withdrawAmount) });
      toast.success('Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Could not submit withdrawal request');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400" strokeWidth={1.5} />
        <p className="text-base font-medium text-slate-600">Failed to load analytics</p>
        <p className="text-sm text-slate-400">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-600">
      <div className="flex justify-end">
        <div className="relative">
          <select
            value={timeRange}
            onChange={(event) => setTimeRange(event.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-600 py-2 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm font-medium shadow-sm transition-all"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="365">This Year</option>
          </select>
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg flex flex-col justify-between text-white relative overflow-hidden">
            <div>
              <p className="text-slate-300 font-medium text-sm mb-2 flex items-center gap-2">
                <Wallet size={16} /> Available Balance
              </p>
              <h3 className="text-3xl font-bold tracking-tight mb-1">
                <span className="text-xl font-medium text-slate-400 mr-1">Rs</span>
                {bankInfo.availableBalanceInRupees.toLocaleString()}
              </h3>
              <p className="text-slate-400 text-xs">
                Total withdrawn: Rs {bankInfo.withdrawnAmountInRupees.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="mt-5 w-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
            >
              Withdraw Funds <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium text-sm mb-2">Orders</p>
            <h3 className="text-3xl text-slate-800 font-semibold tracking-tight mb-2">{metrics.total}</h3>
            <p className="text-slate-600 text-xs font-medium">Across {timeRangeLabel.toLowerCase()}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium text-sm mb-2">Completed</p>
            <h3 className="text-3xl text-slate-800 font-semibold tracking-tight mb-2">{metrics.completed}</h3>
            <p className="text-emerald-600 text-xs font-medium flex items-center gap-1.5">
              <TrendingUp size={13} strokeWidth={2} />
              {metrics.completionRate}% completion
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium text-sm mb-2">Revenue</p>
            <h3 className="text-3xl text-slate-800 font-semibold tracking-tight mb-2">Rs {metrics.totalRevenue.toLocaleString()}</h3>
            <p className="text-blue-600 text-xs font-medium flex items-center gap-1.5">
              <ShoppingBag size={13} strokeWidth={2} />
              Completed orders only
            </p>
          </div>
        </div>
      )}

      {isPlatinum ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
          <p className="text-[13px] font-semibold text-gray-700">Basic analytics: orders summary is active.</p>
          <p className="text-[13px] font-semibold text-gray-700">Upgrade to Gold for Orders and Popular Medicines analytics.</p>
        </div>
      ) : null}

      {isGold ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[380px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base text-slate-800 font-semibold">Orders</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{timeRangeLabel} · by day of week</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>Completed</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-300 inline-block"></span>Cancelled</div>
              </div>
            </div>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
            ) : (
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderTrendData} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#fca5a5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                    <Area type="monotone" dataKey="cancelled" stroke="#fca5a5" strokeWidth={2} fillOpacity={1} fill="url(#colorCancelled)" name="Cancelled" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base text-slate-800 font-semibold">Popular Medicines</h3>
                <p className="text-sm text-slate-500 mt-1">Ranked by sold units in completed orders</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : topMedicines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Pill size={32} strokeWidth={1.5} className="mb-3 text-slate-300" />
                <p className="font-medium text-slate-500">No completed order medicine data yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[520px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-sm">
                      <th className="pb-3 px-4 font-medium">Medicine</th>
                      <th className="pb-3 px-4 font-medium">Category</th>
                      <th className="pb-3 px-4 font-medium text-right">Units Sold</th>
                      <th className="pb-3 px-4 font-medium text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 text-sm">
                    {topMedicines.map((medicine, index) => (
                      <tr key={`${medicine.name}-${index}`} className="border-b border-slate-50">
                        <td className="py-4 px-4 font-semibold text-slate-800">{medicine.name}</td>
                        <td className="py-4 px-4">{medicine.category}</td>
                        <td className="py-4 px-4 text-right font-semibold">{medicine.sales}</td>
                        <td className="py-4 px-4 text-right font-semibold">Rs {Math.round(medicine.revenue).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {isDiamond ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[360px]">
            <h3 className="text-base text-slate-800 font-semibold">Sales Trends</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{timeRangeLabel}</p>
            <div className="h-[280px] mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="diamondSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip formatter={(value) => [`Rs ${Number(value || 0).toLocaleString()}`, 'Sales']} />
                  <Area type="monotone" dataKey="sales" stroke="#14B8A6" strokeWidth={2.5} fill="url(#diamondSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[360px]">
            <h3 className="text-base text-slate-800 font-semibold">Customer Demand</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Top demanded medicine categories</p>
            <div className="h-[280px] mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerDemandData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip formatter={(value) => [Number(value || 0), 'Demand']} />
                  <Bar dataKey="demand" fill="#1EBDB8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base text-slate-800 font-semibold">Performance Insights</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Conversion and fulfillment quality indicators</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
              {performanceInsights.map((insight) => (
                <div key={insight.title} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">{insight.title}</p>
                  <p className="text-[28px] font-bold text-slate-800 mt-1">{insight.value}</p>
                  <p className="text-[12px] text-slate-500 mt-1">{insight.helper}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {showWithdrawModal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#1EBDB8]" />
                Withdraw Funds
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm border border-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-[#1EBDB8]/10 to-[#1CAAAE]/5 rounded-2xl p-5 mb-6 border border-[#1EBDB8]/20 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1CAAAE] mb-1">Available to Withdraw</p>
                  <p className="text-2xl font-bold text-slate-800">Rs {bankInfo.availableBalanceInRupees.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#1EBDB8]">
                  <Wallet size={24} />
                </div>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Amount (PKR)</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rs</div>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(event) => setWithdrawAmount(event.target.value)}
                      placeholder="5000"
                      min="5000"
                      max={bankInfo.availableBalanceInRupees}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 font-medium focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8] outline-none transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Minimum withdrawal amount is PKR 5,000
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Transfer to Bank Account</p>
                  {!bankInfo.bankAccount?.accountNumber ? (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-600 font-medium flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>You haven&apos;t added a bank account yet. Please add it in Profile before withdrawing.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Bank</span><span className="font-medium text-slate-800">{bankInfo.bankAccount.bankName}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Title</span><span className="font-medium text-slate-800">{bankInfo.bankAccount.accountTitle}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Account #</span><span className="font-medium text-slate-800">{bankInfo.bankAccount.accountNumber}</span></div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) > bankInfo.availableBalanceInRupees || !bankInfo.bankAccount?.accountNumber}
                  className="w-full bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1EBDB8]/20 transition-all flex items-center justify-center gap-2"
                >
                  {isWithdrawing ? (<><Loader2 size={18} className="animate-spin" /> Processing...</>) : 'Submit Withdrawal Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
