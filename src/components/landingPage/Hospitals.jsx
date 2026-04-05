import React from 'react';

export default function Hospitals() {
  const cards = [
    '/hosp1.png',
    '/hosp2.png',
    '/hosp3.png',
    '/hosp4.png',
    '/hosp5.png',
  ];

  return (
    <div className="w-full bg-white py-20 md:py-28 px-6 lg:px-10 relative overflow-hidden">
      <div className="max-w-[1300px] mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-16 lg:gap-20 xl:gap-28 relative z-10">

        <div className="w-full md:w-1/2 flex justify-center md:justify-start gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8 pt-10 sm:pt-14 md:pt-16 lg:pt-20">
            {cards.slice(0, 2).map((img, idx) => (
              <div key={idx} className="group bg-[#F9FAFB] rounded-[32px] lg:rounded-[40px] w-[150px] sm:w-[180px] lg:w-[210px] aspect-[1/1.05] flex items-center justify-center p-6 sm:p-8 border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                <img src={img} alt={`Clinic ${idx + 1}`} className="w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105" />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8">
            {cards.slice(2, 5).map((img, idx) => (
              <div key={idx + 2} className="group bg-[#F9FAFB] rounded-[32px] lg:rounded-[40px] w-[150px] sm:w-[180px] lg:w-[210px] aspect-[1/1.05] flex items-center justify-center p-6 sm:p-8 border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                <img src={img} alt={`Clinic ${idx + 3}`} className="w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105" />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left mb-8 md:mb-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#1D635D]" />
            <span className="text-[#1D635D] text-[10px] font-bold uppercase tracking-[3px]">World-Class Facilities</span>
          </div>
          <h2 className="text-[#1D635D] text-[36px] sm:text-[44px] md:text-[48px] lg:text-[56px] font-medium leading-[1.25] tracking-wide">
            World's Best Pakistan <br className="hidden md:block" />
            Clinics <br className="hidden md:block" />
            & Research Centers
          </h2>
          <p className="text-gray-500 text-[15px] md:text-[17px] mt-6 leading-relaxed max-w-lg">
            Access cutting-edge medical facilities staffed with experienced professionals dedicated to your health and wellbeing.
          </p>
        </div>

      </div>
    </div>
  );
}
