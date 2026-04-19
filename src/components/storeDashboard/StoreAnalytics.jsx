import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  PackageCheck, TrendingUp, TrendingDown, Calendar, Pill,
  ShoppingBag, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';

const API_BASE = 'http://localhost:3002';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getAuthHeaders() {
  const token = localStorage.getItem('medicalStoreToken');
  return { Authorization: `Bearer ${token}` };
}

// ── Skeleton card ──
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
  const [timeRange, setTimeRange] = useState('7');   // '7' | '30' | '365'

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersRes, medsRes] = await Promise.all([
        fetch(`${API_BASE}/api/store-orders`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/medicines`,    { headers: getAuthHeaders() }),
      ]);
      if (!ordersRes.ok || !medsRes.ok) throw new Error('Failed to fetch analytics data');
      const [ordersData, medsData] = await Promise.all([ordersRes.json(), medsRes.json()]);
      setOrders(ordersData);
      setMedicines(medsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Filter orders by selected time range ──
  const filteredOrders = useMemo(() => {
    const days = Number(timeRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return orders.filter(o => new Date(o.createdAt) >= cutoff);
  }, [orders, timeRange]);

  // ── Summary metrics ──
  const metrics = useMemo(() => {
    const total     = filteredOrders.length;
    const completed = filteredOrders.filter(o => o.status === 'completed').length;
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled').length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';

    const totalRevenue = filteredOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { total, completed, cancelled, completionRate, totalRevenue };
  }, [filteredOrders]);

  // ── Order completion trend chart (group by day of week) ──
  const orderTrendData = useMemo(() => {
    const buckets = DAY_LABELS.map(name => ({ name, completed: 0, cancelled: 0 }));
    filteredOrders.forEach(o => {
      const dayIdx = new Date(o.createdAt).getDay();
      if (o.status === 'completed') buckets[dayIdx].completed += 1;
      if (o.status === 'cancelled') buckets[dayIdx].cancelled += 1;
    });
    // Rotate so today is last
    const today = new Date().getDay();
    return [...buckets.slice(today + 1), ...buckets.slice(0, today + 1)];
  }, [filteredOrders]);

  // ── Top-selling medicines (derived from order items) ──
  const topMedicines = useMemo(() => {
    const map = {};
    filteredOrders
      .filter(o => o.status === 'completed')
      .forEach(o => {
        (o.items || []).forEach(item => {
          const id = item.medicineId || item.name;
          if (!map[id]) {
            map[id] = { name: item.name, sales: 0, revenue: 0 };
          }
          map[id].sales   += item.quantity || 0;
          map[id].revenue += (item.price * item.quantity) || 0;
        });
      });

    const sorted = Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 5);

    // Enrich with category & status from medicine list
    return sorted.map(item => {
      const med = medicines.find(m => m.name === item.name);
      return { ...item, category: med?.category || '—', status: med?.status || 'In Stock' };
    });
  }, [filteredOrders, medicines]);

  // ── Fallback: if no order items data, use medicines by stock/price ──
  const displayMedicines = useMemo(() => {
    if (topMedicines.length > 0) return topMedicines;
    return [...medicines]
      .sort((a, b) => b.price * b.stock - a.price * a.stock)
      .slice(0, 5)
      .map(m => ({
        name: m.name,
        category: m.category || '—',
        sales: m.stock,
        revenue: m.price * m.stock,
        status: m.status,
      }));
  }, [topMedicines, medicines]);

  const timeRangeLabel = { '7': 'Last 7 Days', '30': 'Last 30 Days', '365': 'This Year' }[timeRange];

  // ── Error state ──
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

      {/* ── Time Range Selector ── */}
      <div className="flex justify-end">
        <div className="relative">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
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

      {/* ── Summary Cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Completion Rate */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-2">Order Completion Rate</p>
              <h3 className="text-3xl text-slate-800 font-semibold tracking-tight mb-2">
                {metrics.completionRate}%
              </h3>
              <p className="text-emerald-600 text-xs font-medium flex items-center gap-1.5 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                <TrendingUp size={13} strokeWidth={2} />
                {metrics.completed} of {metrics.total} orders
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
              <PackageCheck size={24} strokeWidth={1.5} />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-2">Total Revenue</p>
              <h3 className="text-3xl text-slate-800 font-semibold tracking-tight mb-2">
                Rs {metrics.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-blue-600 text-xs font-medium flex items-center gap-1.5 bg-blue-50 w-fit px-2 py-1 rounded-md">
                <ShoppingBag size={13} strokeWidth={2} />
                From completed orders
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
              <ShoppingBag size={24} strokeWidth={1.5} />
            </div>
          </div>

          {/* Cancelled Orders */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-2">Cancelled Orders</p>
              <h3 className="text-3xl text-slate-800 font-semibold tracking-tight mb-2">
                {metrics.cancelled}
              </h3>
              <p className={`text-xs font-medium flex items-center gap-1.5 w-fit px-2 py-1 rounded-md ${
                metrics.cancelled === 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                <TrendingDown size={13} strokeWidth={2} />
                {metrics.total > 0
                  ? `${((metrics.cancelled / metrics.total) * 100).toFixed(1)}% cancellation rate`
                  : 'No orders yet'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:bg-rose-50 transition-colors">
              <TrendingDown size={24} strokeWidth={1.5} />
            </div>
          </div>

        </div>
      )}

      {/* ── Charts + Table ── */}
      <div className="grid grid-cols-1 gap-6">

        {/* Order Completion Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base text-slate-800 font-semibold">Order Completion Trends</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{timeRangeLabel} · by day of week</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>Completed</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-300 inline-block"></span>Cancelled</div>
            </div>
          </div>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderTrendData} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#fca5a5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#fca5a5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '13px' }}
                    itemStyle={{ fontWeight: 500 }}
                    labelStyle={{ color: '#475569', marginBottom: '6px', fontWeight: 600 }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                  <Area type="monotone" dataKey="cancelled" stroke="#fca5a5" strokeWidth={2} fillOpacity={1} fill="url(#colorCancelled)" name="Cancelled" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Selling Medicines Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base text-slate-800 font-semibold">Top Selling Medicines</h3>
              <p className="text-sm text-slate-500 mt-1">
                {topMedicines.length > 0
                  ? `Ranked by units sold — ${timeRangeLabel}`
                  : 'Ranked by inventory value (no completed order data yet)'}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : displayMedicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Pill size={32} strokeWidth={1.5} className="mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">No medicine data found</p>
              <p className="text-sm mt-1">Add medicines to your inventory to see them here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 text-sm">
                    <th className="pb-3 px-4 font-medium">Medicine</th>
                    <th className="pb-3 px-4 font-medium">Category</th>
                    <th className="pb-3 px-4 font-medium text-right">
                      {topMedicines.length > 0 ? 'Units Sold' : 'In Stock'}
                    </th>
                    <th className="pb-3 px-4 font-medium text-right">Revenue</th>
                    <th className="pb-3 px-4 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 text-sm">
                  {displayMedicines.map((medicine, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200 shrink-0">
                            <Pill size={16} strokeWidth={2} />
                          </div>
                          <span className="font-semibold text-slate-800">{medicine.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium">{medicine.category}</td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-700">{medicine.sales}</td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-700">
                        <span className="text-slate-400 text-xs font-medium mr-1">Rs</span>
                        {medicine.revenue.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            medicine.status === 'In Stock'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {medicine.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
