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
    <div className="w-full bg-white py-16 md:py-24 px-6 lg:px-10">
      <div className="max-w-[1300px] mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-16 lg:gap-20 xl:gap-28">

        {/* Left Side: Staggered Cards */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          {/* Column 1 (Pushed down) */}
          <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8 pt-10 sm:pt-14 md:pt-16 lg:pt-20">
            {cards.slice(0, 2).map((img, idx) => (
              <div key={idx} className="bg-[#F9FAFB] rounded-[32px] lg:rounded-[40px] w-[150px] sm:w-[180px] lg:w-[210px] aspect-[1/1.05] flex items-center justify-center p-6 sm:p-8">
                <img src={img} alt={`Clinic ${idx + 1}`} className="w-full max-h-full object-contain" />
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8">
            {cards.slice(2, 5).map((img, idx) => (
              <div key={idx + 2} className="bg-[#F9FAFB] rounded-[32px] lg:rounded-[40px] w-[150px] sm:w-[180px] lg:w-[210px] aspect-[1/1.05] flex items-center justify-center p-6 sm:p-8">
                <img src={img} alt={`Clinic ${idx + 3}`} className="w-full max-h-full object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Text */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left mb-8 md:mb-0">
          <h2 className="text-[#1D635D] text-[36px] sm:text-[44px] md:text-[48px] lg:text-[56px] font-medium leading-[1.25] tracking-wide">
            World's Best Pakistan <br className="hidden md:block" />
            Clinics <br className="hidden md:block" />
            & Research Centers
          </h2>
        </div>

      </div>
    </div>
  );
}
