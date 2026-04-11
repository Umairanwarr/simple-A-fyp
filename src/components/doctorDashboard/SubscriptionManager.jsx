import React from 'react';

export default function SubscriptionManager() {
  const plans = [
    {
      name: 'Platinum',
      label: '(Basic)',
      price: '0',
      features: [
        { label: 'Ranking Boost', value: 'Low' },
        { label: 'Media Uploads', value: '2 Images' },
        { label: 'Video Calls', value: 'No' },
        { label: 'Live Streaming', value: 'No' },
        { label: 'Ads Manager', value: 'Limited' },
        { label: 'Analytics', value: 'Basic' },
      ],
      buttonText: 'Already using',
      isActive: true
    },
    {
      name: 'Gold',
      label: '(Pro)',
      price: '9.99',
      features: [
        { label: 'Ranking Boost', value: 'Medium' },
        { label: 'Media Uploads', value: '5 Images + 1 Video' },
        { label: 'Video Calls', value: 'Yes (1-on-1)' },
        { label: 'Live Streaming', value: 'No' },
        { label: 'Ads Manager', value: 'Standard' },
        { label: 'Analytics', value: 'Standard' },
      ],
      buttonText: 'Buy now',
      isPopular: true
    },
    {
      name: 'Diamond',
      label: '(Premium)',
      price: '29.99',
      features: [
        { label: 'Ranking Boost', value: 'High' },
        { label: 'Media Uploads', value: 'Unlimited Media' },
        { label: 'Video Calls', value: 'Yes (1-on-1)' },
        { label: 'Live Streaming', value: 'Yes (Multi-Guest)' },
        { label: 'Ads Manager', value: 'Full Control' },
        { label: 'Analytics', value: 'Advanced' },
      ],
      buttonText: 'Buy now'
    },
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 px-0 sm:px-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 lg:gap-5 xl:gap-8 max-w-[1340px] mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <div key={idx} className="flex flex-col h-full group pt-10">
            <div className={`flex-1 bg-[#1F2432] flex flex-col relative transition-all duration-300 border border-white/5 hover:border-[#1EBDB8]/40 hover:shadow-2xl rounded-[24px] sm:rounded-[32px] overflow-hidden ${plan.isPopular ? 'ring-2 ring-[#1EBDB8]/30 -mt-10 mb-0' : 'mt-0'}`}>
              
              {/* Integrated Header Bar */}
              {plan.isPopular && (
                <div className="bg-[#1EBDB8] text-white text-[11px] xl:text-[12px] font-bold py-3.5 sm:py-4 xl:py-4.5 text-center uppercase tracking-[0.2em] shadow-lg shrink-0">
                  Most Popular
                </div>
              )}
              
              <div className="flex-1 p-5 sm:p-6 lg:p-7 xl:p-10 flex flex-col">
                <div className="mb-5 sm:mb-8">
                  <div className="flex flex-col min-[1200px]:flex-row min-[1200px]:items-center justify-between gap-2 mb-2">
                    <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                      <h3 className="text-[18px] sm:text-[20px] lg:text-[22px] xl:text-[24px] font-bold text-white tracking-tight leading-none truncate">{plan.name}</h3>
                      <span className="text-[11px] lg:text-[13px] xl:text-[14px] text-white/30 font-medium">{plan.label}</span>
                    </div>
                    {plan.isActive && (
                      <span className="inline-block self-start min-[1200px]:self-auto text-[8px] xl:text-[9px] font-bold text-[#1EBDB8] bg-[#1EBDB8]/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#1EBDB8]/20 shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-6 flex flex-col min-[1400px]:flex-row min-[1400px]:items-baseline gap-1">
                    <span className="text-[24px] sm:text-[30px] lg:text-[34px] xl:text-[48px] font-bold text-white leading-none break-all">${plan.price}</span>
                    <span className="text-[11px] lg:text-[13px] xl:text-[16px] font-medium text-white/30 tracking-tight">/month</span>
                  </div>
                </div>

                <div className="h-px bg-white/10 w-full mb-6 sm:mb-8" />

                <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2.5 xl:gap-3.5">
                      <div className={`shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 xl:w-5 xl:h-5 rounded-full flex items-center justify-center border mt-0.5 ${feature.value === 'No' ? 'bg-white/5 text-white/20 border-white/10' : 'bg-[#1EBDB8]/10 text-[#1EBDB8] border-[#1EBDB8]/20'}`}>
                        {feature.value === 'No' ? (
                          <svg width="7" height="7" sm-width="9" sm-height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        ) : (
                          <svg width="8" height="8" sm-width="10" sm-height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[10px] sm:text-[11px] xl:text-[13px] font-medium leading-[1.3] ${feature.value === 'No' ? 'text-white/25' : 'text-white/45'}`}>{feature.label}</span>
                        <span className={`text-[12px] sm:text-[14px] xl:text-[15px] font-semibold leading-[1.3] truncate ${feature.value === 'No' ? 'text-white/15' : 'text-white/90'}`}>{feature.value}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-4">
                  {plan.isActive ? (
                    <div className="flex justify-center">
                      <div className="w-18 h-18 sm:w-22 sm:h-22 xl:w-26 xl:h-26 rounded-full border-2 border-white/10 flex items-center justify-center text-center p-2 sm:p-3 bg-white/5">
                        <span className="text-[10px] sm:text-[12px] xl:text-[13px] font-bold text-white/30 leading-tight">Already using</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full py-3.5 sm:py-4 xl:py-4.5 rounded-[14px] sm:rounded-[24px] font-bold text-[15px] sm:text-[17px] bg-[#1EBDB8] text-white hover:bg-[#1CAAAE] shadow-[0_12px_24px_-8px_rgba(30,189,184,0.4)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                    >
                      {plan.buttonText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-[#1F2432] p-8 sm:p-10 rounded-[32px] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8 max-w-7xl mx-auto overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1EBDB8]/5 blur-[80px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 text-center lg:text-left">
          <h3 className="text-[26px] font-bold text-white mb-3 tracking-tight">Ads & Promotion Manager</h3>
          <p className="text-white/60 text-[16px] max-w-2xl leading-relaxed">Boost your profile visibility and attract 3x more patients with targeted medical ads and featured listings.</p>
        </div>
        <button className="relative z-10 whitespace-nowrap px-10 py-4.5 bg-white text-[#1F2432] font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-white/10 hover:-translate-y-1 active:scale-[0.98]">
          Launch Campaign
        </button>
      </div>
    </div>
  );
}
