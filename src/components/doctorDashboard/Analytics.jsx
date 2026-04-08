import React from 'react';

const Sparkline = ({ color }) => (
  <svg width="60" height="20" viewBox="0 0 60 20" className="opacity-50">
    <path 
      d="M0 15 Q 15 5, 30 15 T 60 5" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);

export default function Analytics() {
  const stats = [
    { 
      label: 'Total Patients', 
      value: '1,284', 
      change: '+12%', 
      trend: 'up',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    { 
      label: 'Profile CTR', 
      value: '24.8%', 
      change: '+5%', 
      trend: 'up',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    { 
      label: 'Monthly Revenue', 
      value: '$12,450', 
      change: '+18%', 
      trend: 'up',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      )
    },
  ];

  const chartData = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 group hover:border-[#1EBDB8]/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1EBDB8]/10 flex items-center justify-center text-[#1EBDB8] group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <Sparkline color="#1EBDB8" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-[28px] font-bold text-[#1F2432]">{stat.value}</p>
                <span className="text-[12px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h3 className="text-[22px] font-bold text-[#1F2432]">Revenue Analytics</h3>
            <p className="text-[#9ca3af] text-[14px]">Detailed financial performance over the last 12 months</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button className="px-5 py-2 bg-white shadow-sm rounded-xl text-[13px] font-bold text-[#1F2432]">Monthly</button>
            <button className="px-5 py-2 text-[13px] font-bold text-[#9ca3af] hover:text-[#1F2432] transition-colors">Yearly</button>
          </div>
        </div>

        <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2">
          {chartData.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
              <div className="relative w-full flex flex-col items-center">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-[#1F2432] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg z-10 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#1F2432]">
                  ${(val * 150).toLocaleString()}
                </div>
                {/* Bar */}
                <div 
                  className="w-full max-w-[40px] bg-gray-50 group-hover:bg-[#1EBDB8]/10 rounded-t-xl relative overflow-hidden transition-all duration-500 ease-out"
                  style={{ height: `${val}%` }}
                >
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[#1EBDB8] rounded-t-xl transition-all duration-700"
                    style={{ height: '40%' }} // Simulating a multi-layered bar or just a base color
                  />
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[#1EBDB8]/40 rounded-t-xl"
                    style={{ height: '100%' }}
                  />
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#9ca3af] group-hover:text-[#1F2432] transition-colors">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid for more detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h3 className="text-[18px] font-bold text-[#1F2432] mb-6">Patient CTR Sources</h3>
          <div className="space-y-5">
            {[
              { source: 'Direct Search', value: '45%', color: '#1EBDB8' },
              { source: 'Clinic Referrals', value: '30%', color: '#6366f1' },
              { source: 'Ads & Promotions', value: '25%', color: '#f59e0b' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-[13px] font-bold">
                  <span className="text-[#1F2432]">{item.source}</span>
                  <span className="text-[#9ca3af]">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: item.value, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-4">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <polyline points="20 6 9 17 4 12"/>
             </svg>
          </div>
          <h3 className="text-[18px] font-bold text-[#1F2432]">System Healthy</h3>
          <p className="text-[#9ca3af] text-[14px] mt-1">All data synchronization tasks were completed successfully today at 04:00 AM.</p>
        </div>
      </div>
    </div>
  );
}
