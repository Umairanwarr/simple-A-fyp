import React from 'react';

export default function ProvidersBanner() {
  return (
    <div className="w-full bg-white relative pb-20 pt-16 px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto bg-[#232734] rounded-[40px] relative mt-8 md:mt-16 mb-10 flex flex-col md:flex-row min-h-[350px] md:min-h-[420px] overflow-visible">
        
        <div className="flex flex-col items-start z-10 w-full md:w-1/2 px-8 pt-16 pb-8 md:px-20 lg:px-28 md:py-20 lg:py-24">
          <h2 className="text-white text-4xl sm:text-[42px] md:text-[48px] lg:text-[52px] font-medium leading-[1.15] mb-8 md:mb-10 tracking-[0.01em]">
            Consult Our<br/>Providers
          </h2>
          <button className="bg-white text-[#1E232F] hover:bg-gray-100 transition-colors px-10 py-3.5 rounded-full font-semibold text-[15px] shadow-sm tracking-wide">
            Book Now
          </button>
        </div>

        {/* Desktop Image */}
        <img 
          src="/landing-doc.svg" 
          alt="Doctor Provider" 
          className="hidden md:block absolute bottom-0 right-[4%] lg:right-[12%] xl:right-[15%] h-[calc(100%+60px)] lg:h-[calc(100%+80px)] w-auto object-contain object-bottom pointer-events-none"
        />

        {/* Mobile Image */}
        <div className="md:hidden flex-1 w-full flex justify-end items-end px-8 mt-2">
          <img 
            src="/landing-doc.svg" 
            alt="Doctor Provider" 
            className="h-[260px] sm:h-[320px] w-auto object-contain object-bottom drop-shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}
