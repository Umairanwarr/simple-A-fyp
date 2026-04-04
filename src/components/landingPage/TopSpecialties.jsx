import React from 'react';

export default function TopSpecialties() {
  const specialties = [
    { title: 'Primary Care', icon: '/top1.svg' },
    { title: 'Endocrinology', icon: '/top2.svg' },
    { title: 'Psychiatrist', icon: '/top3.svg' },
    { title: 'Mental Health', icon: '/top4.svg' },
    { title: 'Cardiology', icon: '/top5.svg' },
    { title: 'Neurology', icon: '/top6.svg' },
    { title: 'Rheumatology', icon: '/top7.svg' },
    { title: 'Plastic Surgery', icon: '/top8.svg' },
    { title: 'Rare Diseases', icon: '/top9.svg' },
    { title: 'Surrogacy', icon: '/top10.svg' }
  ];

  return (
    <div className="w-full bg-white py-20 px-6 lg:px-10">
      <div className="max-w-[1300px] mx-auto">
        <h2 className="text-[#1D635D] text-3xl md:text-[38px] font-semibold mb-12">
          Top searched specialties
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {specialties.map((spec, index) => (
            <div 
              key={index} 
              className="bg-[#FAFAFA] rounded-[32px] flex flex-col items-center justify-center p-8 aspect-[1.1] hover:shadow-sm transition-shadow cursor-pointer border border-transparent hover:border-gray-100"
            >
              <div className="h-14 w-14 md:h-16 md:w-16 flex items-center justify-center mb-5">
                <img 
                  src={spec.icon} 
                  alt={spec.title} 
                  className="max-w-full max-h-full object-contain" 
                />
              </div>
              <span className="font-semibold text-[#1F2937] text-center text-[15px] md:text-[16px]">
                {spec.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
