import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchAdminStats } from '../../../services/authApi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, Stethoscope, Building2, Store, Activity, TrendingUp, ShieldCheck, DollarSign, Calendar, Star, Award
} from 'lucide-react';

const formatCurrency = (amountInRupees) => {
  const parsedAmount = Number(amountInRupees);
  const safeAmount = Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : 0;
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(safeAmount);
};

const formatDateLabel = (dateValue) => {
  if (!dateValue) return 'N/A';
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'N/A';
  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-lg shadow-gray-200/50 text-[13px] font-bold">
        <p className="text-[#6B7280] uppercase tracking-wider text-[11px] mb-1">{label}</p>
        <p className="text-[#1F2432] flex items-center gap-1">
          {payload[0].name.includes('Revenue') || payload[0].name.includes('Commission') ? 'PKR ' : ''}
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [totalPatients, setTotalPatients] = useState('0');
  const [totalDoctors, setTotalDoctors] = useState('0');
  const [totalClinics, setTotalClinics] = useState('0');
  const [totalMedicalStores, setTotalMedicalStores] = useState('0');
  const [totalGoldDoctors, setTotalGoldDoctors] = useState('0');
  const [totalDiamondDoctors, setTotalDiamondDoctors] = useState('0');
  const [totalAppointments, setTotalAppointments] = useState('0');
  const [totalBookingRevenue, setTotalBookingRevenue] = useState(0);
  const [totalAppointmentRevenue, setTotalAppointmentRevenue] = useState(0);
  const [totalSubscriptionRevenue, setTotalSubscriptionRevenue] = useState(0);
  const [totalAdminCommission, setTotalAdminCommission] = useState(0);
  const [recentCommissions, setRecentCommissions] = useState([]);
  const [premiumUsers, setPremiumUsers] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      try {
        const data = await fetchAdminStats(token);
        setTotalPatients(String(data.totalPatients ?? 0));
        setTotalDoctors(String(data.approvedDoctors ?? 0));
        setTotalClinics(String(data.totalClinics ?? 0));
        setTotalMedicalStores(String(data.totalMedicalStores ?? 0));
        setTotalGoldDoctors(String(data.totalGoldDoctors ?? 0));
        setTotalDiamondDoctors(String(data.totalDiamondDoctors ?? 0));
        setTotalAppointments(String(data.totalConfirmedAppointments ?? 0));
        setTotalBookingRevenue(Number(data.totalBookingRevenueInRupees ?? 0));
        setTotalAppointmentRevenue(Number(data.appointmentBookingRevenueInRupees ?? 0));
        setTotalSubscriptionRevenue(Number(data.totalSubscriptionRevenueInRupees ?? 0));
        setTotalAdminCommission(Number(data.totalAdminCommissionInRupees ?? 0));
        setRecentCommissions(Array.isArray(data.recentCommissions) ? data.recentCommissions : []);
        setPremiumUsers(Array.isArray(data.premiumUsers) ? data.premiumUsers : []);
      } catch (error) {
        // Fallbacks
      }
    };
    loadStats();
  }, []);
  
  const stats = [
    { title: 'Total Patients', value: totalPatients, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Doctors', value: totalDoctors, icon: Stethoscope, color: 'text-teal-500', bg: 'bg-teal-50' },
    { title: 'Confirmed Bookings', value: totalAppointments, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Gold Members', value: totalGoldDoctors, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Diamond Members', value: totalDiamondDoctors, icon: Award, color: 'text-[#1EBDB8]', bg: 'bg-[#ECFCFB]' },
    { title: 'Admin Commission', value: formatCurrency(totalAdminCommission), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const userDistributionData = [
    { name: 'Patients', value: Number(totalPatients) || 0, color: '#3B82F6' },
    { name: 'Doctors', value: Number(totalDoctors) || 0, color: '#14B8A6' },
    { name: 'Clinics', value: Number(totalClinics) || 0, color: '#8B5CF6' },
    { name: 'Stores', value: Number(totalMedicalStores) || 0, color: '#F59E0B' }
  ];

  const revenueBreakdownData = [
    { name: 'Consultations', value: totalAppointmentRevenue || 0, color: '#10B981' },
    { name: 'Subscriptions', value: totalSubscriptionRevenue || 0, color: '#1EBDB8' }
  ];

  const totalUsers = userDistributionData.reduce((sum, item) => sum + item.value, 0);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
        
        {/* Dynamic Header */}
        <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-10 shadow-md border bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-gray-800">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[80px] pointer-events-none bg-[#3B82F6]/20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="text-center md:text-left text-white">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-4 font-bold tracking-widest uppercase text-[11px] shadow-sm bg-white/10 border-white/20 text-gray-200">
                <ShieldCheck className="w-4 h-4" /> Live Overview
              </div>
              <h2 className="text-[36px] sm:text-[48px] font-extrabold tracking-tight leading-none mb-6 drop-shadow-sm">
                System Command
              </h2>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="rounded-2xl p-4 px-6 border backdrop-blur-md shadow-sm bg-white/5 border-white/10">
                  <p className="text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1 text-gray-400">
                    <Activity className="w-3.5 h-3.5" /> Total Users
                  </p>
                  <p className="text-[24px] font-bold text-white">{totalUsers.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl p-4 px-6 border backdrop-blur-md shadow-sm bg-white/5 border-white/10">
                  <p className="text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 mb-1 text-gray-400">
                    <TrendingUp className="w-3.5 h-3.5" /> Platform Revenue
                  </p>
                  <p className="text-[24px] font-bold text-[#1EBDB8]">{formatCurrency(totalBookingRevenue)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-7 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.title}</div>
                <div className="text-[28px] font-extrabold text-gray-900 leading-none">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-[20px] font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-gray-400" /> User Distribution
            </h2>
            <p className="text-[13px] text-gray-500 mb-8">Ecosystem breakdown by entity type.</p>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} />
                  <RechartsTooltip cursor={{fill: '#F3F4F6'}} content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
            <h2 className="text-[20px] font-bold text-gray-900 flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-gray-400" /> Revenue Flow
            </h2>
            <p className="text-[13px] text-gray-500 mb-4">Total volume: {formatCurrency(totalBookingRevenue)}</p>
            
            <div className="h-[250px] w-full flex justify-center mt-6 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueBreakdownData} innerRadius={70} outerRadius={105} paddingAngle={5} dataKey="value" stroke="none">
                    {revenueBreakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-4">
                <p className="text-[24px] font-extrabold text-gray-900">{formatCurrency(totalSubscriptionRevenue + totalAppointmentRevenue)}</p>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
               {revenueBreakdownData.map(d => (
                 <div key={d.name} className="flex items-center gap-2">
                   <span className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></span>
                   <span className="text-[13px] font-bold text-gray-600">{d.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Premium Users Table */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">Premium Subscribers</h2>
          <p className="text-[13px] text-gray-500 mb-6">Active Gold and Diamond medical professionals.</p>

          {premiumUsers.length === 0 ? (
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 py-16 text-center">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[15px] font-semibold text-gray-600">No Premium Doctors Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="pb-4 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-400">Professional</th>
                    <th className="pb-4 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-400">Specialization</th>
                    <th className="pb-4 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-400">Active Plan</th>
                    <th className="pb-4 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-400">Subscription Date</th>
                  </tr>
                </thead>
                <tbody>
                  {premiumUsers.map((user) => {
                    const isDiamond = String(user.currentPlan).toLowerCase() === 'diamond';
                    return (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 pr-4">
                          <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-gray-900">{user.fullName}</span>
                            <span className="text-[12px] text-gray-500 mt-0.5">{user.email} &bull; {user.phone}</span>
                          </div>
                        </td>
                        <td className="py-5 pr-4 text-[14px] font-medium text-gray-600">{user.specialization}</td>
                        <td className="py-5 pr-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border ${isDiamond ? 'bg-[#ECFCFB] text-[#0F766E] border-[#1EBDB8]/20' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {isDiamond ? <Award className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                            {user.currentPlan}
                          </span>
                        </td>
                        <td className="py-5 pr-4 text-[13px] font-semibold text-gray-500">
                          {formatDateLabel(user.purchasedAt)} <span className="mx-1 text-gray-300">|</span> Expires: {formatDateLabel(user.planExpiresAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commissions Table */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">Recent Booking Ledger</h2>
          <p className="text-[13px] text-gray-500 mb-6">Confirmed patient consultations and platform fees.</p>

          {recentCommissions.length === 0 ? (
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 py-16 text-center">
               <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
               <p className="text-[15px] font-semibold text-gray-600">No Booking Records Yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="pb-4 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-400">Doctor</th>
                    <th className="pb-4 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-400">Patient</th>
                    <th className="pb-4 pr-4 text-[12px] font-bold uppercase tracking-wider text-gray-400">Paid Amount</th>
                    <th className="pb-4 pr-4 text-[12px] font-bold uppercase tracking-wider text-[#1EBDB8] text-right">App Comm (10%)</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCommissions.map((commission) => (
                    <tr key={commission.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 pr-4 text-[14px] font-bold text-gray-900">{commission.doctorName}</td>
                      <td className="py-5 pr-4 text-[14px] font-medium text-gray-600">{commission.patientName}</td>
                      <td className="py-5 pr-4 text-[15px] font-bold text-gray-600">{formatCurrency(commission.amountInRupees)}</td>
                      <td className="py-5 pr-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[16px] font-extrabold text-[#0F766E] block">{formatCurrency(commission.adminCommissionInRupees)}</span>
                          <span className="text-[11px] font-medium text-gray-400 mt-1">{formatDateLabel(commission.paidAt)}</span>
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
    </AdminLayout>
  );
}