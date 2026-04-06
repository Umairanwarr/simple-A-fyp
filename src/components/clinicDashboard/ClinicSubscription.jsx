import React from 'react';

export default function ClinicSubscription() {
  const plans = [
    { 
      name: 'Standard Clinic', 
      price: '49', 
      features: ['Up to 5 Doctors', 'Basic Clinic Analytics', 'Digital Prescriptions'],
      description: 'Ideal for small private clinics and specialty centers.',
      buttonText: 'Current Plan',
      isActive: true 
    },
    { 
      name: 'Premium Facility', 
      price: '199', 
      features: ['Up to 25 Doctors', 'Advanced Staff Analytics', 'Promotional Media Ad Credits'],
      description: 'Best for growing multi-specialty medical centers.',
      buttonText: 'Upgrade Now',
      isPopular: true 
    },
    { 
      name: 'Diamond Network', 
      price: '499', 
      features: ['Unlimited Doctors', 'Full Network Analytics', 'Clinic-Wide Live Streaming'],
      description: 'The ultimate solution for hospital networks and large facilities.',
      buttonText: 'Upgrade Now' 
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch px-4">
        {plans.map((plan, idx) => (
          <div key={idx} className="flex flex-col h-full group">
            {/* Simple Badge */}
            {plan.isPopular ? (
              <div className="bg-[#1EBDB8] text-white text-[11px] font-bold py-2 px-6 rounded-t-2xl text-center uppercase tracking-wider">
                Most Popular
              </div>
            ) : (
              <div className="h-[35px]" />
            )}
            
            <div className={`flex-1 bg-[#1F2432] p-8 flex flex-col relative transition-all duration-300 border border-white/5 hover:border-[#1EBDB8]/40 hover:shadow-2xl ${plan.isPopular ? 'rounded-b-2xl ring-1 ring-[#1EBDB8]/10' : 'rounded-2xl'}`}>
              
              <div className="mb-8 text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  {plan.isActive && (
                    <span className="text-[10px] font-bold text-[#1EBDB8] bg-[#1EBDB8]/10 px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#1EBDB8]/20">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white leading-none">${plan.price}</span>
                  <span className="text-sm font-medium text-white/50">/mo</span>
                </div>
                <p className="mt-3 text-[13px] text-white/40 leading-relaxed font-medium">{plan.description}</p>
              </div>

              <div className="h-px bg-white/5 w-full mb-8" />

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-2.5">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[#1EBDB8] border border-white/10 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-[14px] text-white/80 font-normal leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  plan.isActive
                    ? 'bg-white/5 text-white/30 cursor-default border border-white/5'
                    : 'bg-[#1EBDB8] text-white hover:bg-[#1CAAAE] shadow-lg hover:shadow-[#1EBDB8]/30 hover:-translate-y-1'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Facility Ads Manager */}
      <div className="mt-12 bg-[#1F2433] p-8 rounded-3xl border border-white/5 relative overflow-hidden group max-w-6xl mx-auto shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <h3 className="text-xl font-semibold text-white tracking-tight">Facility Marketing Hub</h3>
            </div>
            <p className="text-white/50 text-[14px] leading-relaxed">
              Boost visibility for your entire clinic network. Verified facilities see a <span className="text-[#1EBDB8] font-semibold">4.5x increase</span> in weekly appointment inquiries.
            </p>
          </div>
          <button className="whitespace-nowrap px-8 py-3.5 bg-white text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-lg active:scale-95">
            Launch Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
