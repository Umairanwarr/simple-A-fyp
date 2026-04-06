import React from 'react';

export default function ProvidersBanner() {
  return (
    <div className="w-full bg-[#1E232F] relative pb-24 pt-16 px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto bg-gradient-to-br from-[#232734] to-[#1E232F] rounded-[40px] relative mt-8 md:mt-16 mb-10 flex flex-col md:flex-row min-h-[350px] md:min-h-[420px] overflow-hidden border border-white/5 shadow-2xl shadow-black/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1EBDB8]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="flex flex-col items-start z-10 w-full md:w-1/2 px-8 pt-16 pb-8 md:px-20 lg:px-28 md:py-20 lg:py-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#1EBDB8]" />
            <span className="text-[#1EBDB8] text-[10px] font-bold uppercase tracking-[3px]">Expert Care</span>
          </div>
          <h2 className="text-white text-4xl sm:text-[42px] md:text-[48px] lg:text-[52px] font-medium leading-[1.15] mb-8 md:mb-10 tracking-[0.01em]">
            Consult Our<br/>
            <span className="bg-gradient-to-r from-[#1EBDB8] to-[#4FDBD8] bg-clip-text text-transparent">Doctors</span>
          </h2>
          <button className="bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE] text-white hover:shadow-lg hover:shadow-[#1EBDB8]/25 transition-all duration-300 px-10 py-3.5 rounded-full font-semibold text-[15px] tracking-wide hover:scale-[1.02] active:scale-[0.98]">
            Book Now
          </button>
        </div>

        <img 
          src="/landing-doc.svg" 
          alt="Doctor Provider" 
          className="hidden md:block absolute bottom-0 right-[4%] lg:right-[12%] xl:right-[15%] h-[calc(100%+60px)] lg:h-[calc(100%+80px)] w-auto object-contain object-bottom pointer-events-none opacity-90"
        />

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