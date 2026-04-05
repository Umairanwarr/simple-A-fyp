import React from 'react';

export default function TopSpecialties() {
  const specialties = [
    { title: 'Primary Care', icon: '/top1.svg', color: 'from-blue-500/10 to-cyan-500/10', iconColor: 'text-blue-400' },
    { title: 'Endocrinology', icon: '/top2.svg', color: 'from-purple-500/10 to-pink-500/10', iconColor: 'text-purple-400' },
    { title: 'Psychiatrist', icon: '/top3.svg', color: 'from-indigo-500/10 to-violet-500/10', iconColor: 'text-indigo-400' },
    { title: 'Mental Health', icon: '/top4.svg', color: 'from-teal-500/10 to-emerald-500/10', iconColor: 'text-teal-400' },
    { title: 'Cardiology', icon: '/top5.svg', color: 'from-red-500/10 to-rose-500/10', iconColor: 'text-red-400' },
    { title: 'Neurology', icon: '/top6.svg', color: 'from-amber-500/10 to-yellow-500/10', iconColor: 'text-amber-400' },
    { title: 'Rheumatology', icon: '/top7.svg', color: 'from-green-500/10 to-lime-500/10', iconColor: 'text-green-400' },
    { title: 'Plastic Surgery', icon: '/top8.svg', color: 'from-pink-500/10 to-fuchsia-500/10', iconColor: 'text-pink-400' },
    { title: 'Rare Diseases', icon: '/top9.svg', color: 'from-orange-500/10 to-red-500/10', iconColor: 'text-orange-400' },
    { title: 'Surrogacy', icon: '/top10.svg', color: 'from-cyan-500/10 to-blue-500/10', iconColor: 'text-cyan-400' }
  ];

  return (
    <div className="w-full bg-white py-20 md:py-28 px-6 lg:px-10 relative overflow-hidden">
      <div className="max-w-[1300px] mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12 md:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#1EBDB8]" />
              <span className="text-[#1EBDB8] text-[10px] font-bold uppercase tracking-[3px]">Browse by Specialty</span>
            </div>
            <h2 className="text-[#1E232F] text-3xl md:text-[44px] font-bold leading-tight">
              Top Searched <span className="text-gray-400">Specialties</span>
            </h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-[#1EBDB8] group">
            <span className="text-[13px] font-semibold uppercase tracking-wider border-b border-[#1EBDB8]/30 group-hover:border-[#1EBDB8] transition-all pb-1">View All</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {specialties.map((spec, index) => (
            <div 
              key={index} 
              className="group cursor-pointer"
            >
              <div className={`bg-gradient-to-br ${spec.color} rounded-[28px] flex flex-col items-center justify-center p-6 md:p-8 aspect-[1.1] border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1`}>
                <div className={`h-14 w-14 md:h-16 md:w-16 flex items-center justify-center mb-4 md:mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <img 
                    src={spec.icon} 
                    alt={spec.title} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                <span className="font-semibold text-[#1E232F] text-center text-[14px] md:text-[15px] group-hover:text-[#1EBDB8] transition-colors">
                  {spec.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex md:hidden justify-center mt-8">
          <button className="flex items-center gap-2 text-[#1EBDB8] group">
            <span className="text-[13px] font-semibold uppercase tracking-wider border-b border-[#1EBDB8]/30 group-hover:border-[#1EBDB8] transition-all pb-1">View All Specialties</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}