import React from 'react';

export default function Services() {
  const cards = [
    {
      title: 'Second Opinion',
      description: 'When facing a serious, life-changing illness, we understand the critical importance of obtaining expert advices',
      icon: <img src="/second-option.svg" alt="Second Opinion" className="w-14 h-14" />
    },
    {
      title: 'Treatment',
      description: 'Get help from the best chosen hospitals and specialists that excel in providing premium healthcare directly from Pakistan.',
      icon: <img src="/treatement.svg" alt="Treatment" className="w-14 h-14" />
    },
    {
      title: 'Global Plans',
      description: 'Get help from the best chosen hospitals and specialists that excel in providing premium healthcare directly from Pakistan.',
      icon: <img src="/global-plans.svg" alt="Global Plans" className="w-14 h-14" />
    }
  ];

  return (
    <div className="w-full bg-white relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-start mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-medium leading-[1.25] text-[#1D635D]">
            Experience Exceptional<br className="hidden lg:block"/> Healthcare In Pakistan With<br className="hidden lg:block"/> Simple Pakistan
          </h2>
          <p className="text-[15px] md:text-[16px] text-gray-500 leading-relaxed md:pt-3">
            Discover the pinnacle of healthcare services in Pakistan, where advancements, quality, cutting edge research, expert doctors and a commitment to patient success, combine to provide an unparalleled medical tourism experience. Simple is your dedicated partner, guiding you towards improved health and wellness. Connect with us today and embark on a journey of exceptional Pakistan healthcare services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-10 lg:gap-14 pb-12">
          {cards.map((card, index) => (
            <div key={index} className="bg-[#F8F9FB] rounded-[40px] px-8 pt-16 pb-20 flex flex-col items-center text-center relative mt-10 md:mt-0">
               <div className="text-[#1D635D] mb-8 h-20 w-20 flex items-center justify-center">
                 {card.icon}
               </div>
               <h3 className="text-[22px] font-semibold text-[#1F2937] mb-5">{card.title}</h3>
               <p className="text-[14.5px] text-[#6B7280] leading-relaxed mb-4">
                 {card.description}
               </p>
               <button className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-10 py-3.5 rounded-full font-semibold text-[15px] transition-colors whitespace-nowrap shadow-md shadow-[#1EBDB8]/30">
                 Get Started
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
