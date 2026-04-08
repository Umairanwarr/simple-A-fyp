import React from 'react';

export default function SubscriptionManager() {
  const plans = [
    {
      name: 'Platinum',
      price: '0',
      features: ['In-person appointments', 'Email notifications', 'Voice messages anywhere'],
      buttonText: 'Already using',
      isActive: true
    },
    {
      name: 'Gold',
      price: '9.99',
      features: ['In-person appointments', 'Voice messages anywhere', 'Voice messages anywhere'],
      buttonText: 'Buy now',
      isPopular: true
    },
    {
      name: 'Diamond',
      price: '29.99',
      features: ['Voice messages anywhere', 'Voice messages anywhere', 'Voice messages anywhere'],
      buttonText: 'Buy now'
    },
  ];

  return (
    <div className="py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <div key={idx} className="flex flex-col h-full group">
            {/* Most Popular Badge */}
            {plan.isPopular ? (
              <div className="bg-[#1EBDB8] text-white text-[12px] font-bold py-2.5 px-6 rounded-t-[28px] text-center uppercase tracking-widest shadow-md">
                Most Popular
              </div>
            ) : (
              <div className="h-[38px]" />
            )}
            
            <div className={`flex-1 bg-[#1F2432] p-10 flex flex-col relative transition-all duration-300 border border-white/5 hover:border-[#1EBDB8]/40 hover:shadow-2xl ${plan.isPopular ? 'rounded-b-[32px] ring-1 ring-[#1EBDB8]/20' : 'rounded-[32px]'}`}>
              
              <div className="mb-10 text-center sm:text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[22px] font-bold text-white tracking-tight">{plan.name}</h3>
                  {plan.isActive && (
                    <span className="text-[10px] font-bold text-[#1EBDB8] bg-[#1EBDB8]/10 px-3 py-1 rounded-full uppercase tracking-wider border border-[#1EBDB8]/20">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  <span className="text-[44px] font-bold text-white leading-none">${plan.price}</span>
                  <span className="text-[16px] font-medium text-white/50">/month</span>
                </div>
              </div>

              <div className="h-px bg-white/5 w-full mb-10" />

              <ul className="space-y-5 mb-12 flex-1">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#1EBDB8] border border-white/10 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-[15px] text-white/80 leading-relaxed font-normal">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4.5 rounded-full font-bold text-[16px] transition-all duration-300 ${
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

      <div className="mt-12 bg-[#1F2433] p-10 rounded-[32px] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
        <div className="text-center sm:text-left">
          <h3 className="text-[22px] font-bold text-white mb-2">Ads & Promotion Manager</h3>
          <p className="text-white/60 text-[15px]">Boost your profile visibility and attract 3x more patients with targeted medical ads.</p>
        </div>
        <button className="whitespace-nowrap px-10 py-4 bg-white text-[#1F2433] font-bold rounded-full hover:bg-gray-100 transition-colors shadow-xl">
          Launch Campaign
        </button>
      </div>
    </div>
  );
}
