import React, { useEffect, useMemo, useState } from 'react';
import { fetchDoctorAnalytics } from '../../services/authApi';

const formatCurrency = (amountInRupees) => {
  const parsedAmount = Number(amountInRupees);
  const safeAmount = Number.isFinite(parsedAmount)
    ? Math.max(0, parsedAmount)
    : 0;

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(safeAmount);
};

const formatDateLabel = (dateValue) => {
  if (!dateValue) {
    return 'Date not available';
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    profileCtr: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenueInRupees: 0,
    monthlyRevenueInRupees: 0,
    recentAppointments: []
  });
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const doctorToken = localStorage.getItem('doctorToken');

        if (!doctorToken) {
          if (isMounted) {
            setAnalytics({
              profileCtr: 0,
              totalPatients: 0,
              totalAppointments: 0,
              totalRevenueInRupees: 0,
              monthlyRevenueInRupees: 0,
              recentAppointments: []
            });
          }

          return;
        }

        const data = await fetchDoctorAnalytics(doctorToken);

        if (!isMounted) {
          return;
        }

        const incomingAnalytics = data?.analytics || {};
        setAnalytics({
          profileCtr: Math.max(0, Math.trunc(Number(incomingAnalytics?.profileCtr || 0))),
          totalPatients: Math.max(0, Math.trunc(Number(incomingAnalytics?.totalPatients || 0))),
          totalAppointments: Math.max(0, Math.trunc(Number(incomingAnalytics?.totalAppointments || 0))),
          totalRevenueInRupees: Math.max(0, Math.trunc(Number(incomingAnalytics?.totalRevenueInRupees || 0))),
          monthlyRevenueInRupees: Math.max(0, Math.trunc(Number(incomingAnalytics?.monthlyRevenueInRupees || 0))),
          recentAppointments: Array.isArray(incomingAnalytics?.recentAppointments)
            ? incomingAnalytics.recentAppointments
            : []
        });
      } catch (error) {
        if (isMounted) {
          setAnalytics({
            profileCtr: 0,
            totalPatients: 0,
            totalAppointments: 0,
            totalRevenueInRupees: 0,
            monthlyRevenueInRupees: 0,
            recentAppointments: []
          });
        }
      } finally {
        if (isMounted) {
          setIsAnalyticsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return [
      {
        label: 'Total Patients',
        value: isAnalyticsLoading ? '--' : analytics.totalPatients.toLocaleString()
      },
      {
        label: 'Profile CTR',
        value: isAnalyticsLoading ? '--' : analytics.profileCtr.toLocaleString()
      },
      {
        label: 'Appointments',
        value: isAnalyticsLoading ? '--' : analytics.totalAppointments.toLocaleString()
      },
      {
        label: 'Monthly Revenue',
        value: isAnalyticsLoading ? '--' : formatCurrency(analytics.monthlyRevenueInRupees)
      },
      {
        label: 'Total Revenue',
        value: isAnalyticsLoading ? '--' : formatCurrency(analytics.totalRevenueInRupees)
      }
    ];
  }, [analytics, isAnalyticsLoading]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:border-[#1EBDB8]/35 transition-colors"
          >
            <p className="text-[12px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-[26px] leading-tight font-bold text-[#1F2432]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-[30px] shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-[22px] font-bold text-[#1F2432]">Recent Paid Appointments</h3>
            <p className="text-[14px] text-[#9ca3af]">Patients and payments from confirmed Stripe bookings.</p>
          </div>
        </div>

        {isAnalyticsLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-10 text-center">
            <p className="text-[14px] font-semibold text-[#6B7280]">Loading appointment analytics...</p>
          </div>
        ) : null}

        {!isAnalyticsLoading && analytics.recentAppointments.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-10 text-center">
            <p className="text-[14px] font-semibold text-[#6B7280]">No paid appointments yet.</p>
          </div>
        ) : null}

        {!isAnalyticsLoading && analytics.recentAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 pr-4 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Patient</th>
                  <th className="py-3 pr-4 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Date</th>
                  <th className="py-3 pr-4 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Mode</th>
                  <th className="py-3 pr-4 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Paid Price</th>
                  <th className="py-3 pr-4 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Your Earning</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-4 pr-4 text-[14px] font-semibold text-[#1F2432]">{appointment.patientName}</td>
                    <td className="py-4 pr-4">
                      <p className="text-[14px] font-semibold text-[#1F2432]">{formatDateLabel(appointment.appointmentDate)}</p>
                      <p className="text-[12px] font-medium text-[#6B7280]">{appointment.fromTime} - {appointment.toTime}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center rounded-full bg-[#ECFCFB] px-3 py-1 text-[12px] font-bold text-[#1EBDB8] border border-[#1EBDB8]/30">
                        {appointment.consultationMode === 'offline' ? 'Offline' : 'Online'}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-[14px] font-bold text-[#1F2432]">{formatCurrency(appointment.priceInRupees)}</td>
                    <td className="py-4 pr-4 text-[14px] font-bold text-[#0F766E]">{formatCurrency(appointment.earningInRupees)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
