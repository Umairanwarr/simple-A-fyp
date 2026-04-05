import React from 'react';

export default function SubscriptionPlans() {
  const plans = [
    {
      name: 'Platinum',
      subtitle: 'Basic',
      price: '29',
      period: '/month',
      color: 'from-slate-400 to-slate-500',
      bgGradient: 'from-slate-50 to-white',
      borderColor: 'border-slate-200',
      accentColor: '#94a3b8',
      popular: false,
      features: [
        { text: 'Low Ranking Boost', included: true },
        { text: '2 Images Upload', included: true },
        { text: 'No Video Calls', included: false },
        { text: 'No Live Streaming', included: false },
        { text: 'Limited Ads Manager', included: true },
        { text: 'Basic Analytics', included: true },
      ]
    },
    {
      name: 'Gold',
      subtitle: 'Pro',
      price: '79',
      period: '/month',
      color: 'from-amber-400 to-yellow-500',
      bgGradient: 'from-amber-50/50 to-white',
      borderColor: 'border-amber-200',
      accentColor: '#f59e0b',
      popular: true,
      features: [
        { text: 'Medium Ranking Boost', included: true },
        { text: '5 Images + 1 Video', included: true },
        { text: 'Video Calls (1-on-1)', included: true },
        { text: 'No Live Streaming', included: false },
        { text: 'Standard Ads Manager', included: true },
        { text: 'Standard Analytics', included: true },
      ]
    },
    {
      name: 'Diamond',
      subtitle: 'Premium',
      price: '149',
      period: '/month',
      color: 'from-[#1EBDB8] to-[#1CAAAE]',
      bgGradient: 'from-[#1EBDB8]/5 to-white',
      borderColor: 'border-[#1EBDB8]/30',
      accentColor: '#1EBDB8',
      popular: false,
      features: [
        { text: 'High Ranking Boost', included: true },
        { text: 'Unlimited Media Uploads', included: true },
        { text: 'Video Calls (1-on-1)', included: true },
        { text: 'Live Streaming (Multi-Guest)', included: true },
        { text: 'Full Ads Control', included: true },
        { text: 'Advanced Analytics', included: true },
      ]
    }
  ];

  return (
    <section className="w-full bg-[#F5F7FA] py-20 md:py-28 px-6 lg:px-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 w-[800px] h-[400px] bg-[#1EBDB8]/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-14 md:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#1EBDB8]" />
            <span className="text-[#1EBDB8] text-[10px] font-bold uppercase tracking-[3px]">Subscription Plans</span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#1EBDB8]" />
          </div>
          <h2 className="text-[#1E232F] text-3xl md:text-[48px] font-bold leading-tight mb-4">
            Choose Your <span className="text-[#1EBDB8]">Plan</span>
          </h2>
          <p className="text-gray-500 text-[15px] md:text-[17px] max-w-2xl mx-auto">
            Unlock powerful features to grow your practice and reach more patients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative group rounded-[28px] overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                plan.popular 
                  ? 'bg-white border-2 border-[#1EBDB8]/30 shadow-xl shadow-[#1EBDB8]/10 scale-[1.03] md:scale-105' 
                  : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE] py-2 text-center">
                  <span className="text-white text-[11px] font-bold uppercase tracking-[2px]">Most Popular</span>
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                    <span className="text-white text-[11px] font-bold uppercase tracking-wider">{plan.name}</span>
                  </div>
                  <p className="text-gray-400 text-[12px] font-medium uppercase tracking-wider mb-4">{plan.subtitle}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-gray-400 text-[18px] font-medium">$</span>
                    <span className="text-[#1E232F] text-[52px] font-black leading-none tracking-tight">{plan.price}</span>
                    <span className="text-gray-400 text-[14px] font-medium">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        feature.included 
                          ? 'bg-[#1EBDB8]/10' 
                          : 'bg-gray-100'
                      }`}>
                        {feature.included ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1EBDB8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="3" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-[14px] ${feature.included ? 'text-[#1E232F] font-medium' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-3.5 rounded-full font-semibold text-[14px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE] text-white shadow-lg shadow-[#1EBDB8]/25 hover:shadow-xl hover:shadow-[#1EBDB8]/30'
                    : 'bg-[#1E232F] text-white hover:bg-[#2a3040]'
                }`}>
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
