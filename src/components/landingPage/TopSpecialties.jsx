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
    <div className="w-full bg-white py-20 md:py-28 px-4 md:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1E232F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#1EBDB8]/5 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[300px] h-[300px] bg-[#1CAAAE]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-[1300px] mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-14 md:mb-20 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-5">
              <div className="hidden md:block h-[2px] w-10 bg-gradient-to-r from-transparent to-[#1EBDB8] rounded-full" />
              <span className="text-[#1EBDB8] text-[11px] md:text-[12px] font-bold uppercase tracking-[3px] md:tracking-[4px] bg-[#1EBDB8]/10 px-4 py-1.5 rounded-full">Browse by Specialty</span>
              <div className="block md:hidden h-[2px] w-10 bg-gradient-to-l from-transparent to-[#1EBDB8] rounded-full" />
            </div>
            
            <h2 className="text-[#1E232F] text-3xl md:text-[44px] lg:text-[48px] font-extrabold leading-tight tracking-tight">
              Top Searched <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE]">Specialties</span>
            </h2>
          </div>
          
          <button className="hidden md:flex items-center gap-2 text-white bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE] hover:shadow-lg hover:shadow-[#1EBDB8]/25 px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] group">
            <span className="text-[13.5px] uppercase tracking-wider">Explore All Areas</span>
            <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        {/* Modern Vibrant Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-7">
          {specialties.map((spec, index) => (
            <div key={index} className="relative group cursor-pointer h-full perspective-1000">
              
              {/* Animated Glow Drop-Shadow Behind Card */}
              <div className={`absolute inset-0 bg-gradient-to-br ${spec.color} rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-95 group-hover:scale-105 pointer-events-none`} />
              
              {/* Main Interactive Card */}
              <div className="relative h-full bg-white rounded-[2rem] p-6 lg:p-8 border border-gray-100 hover:border-transparent flex flex-col items-center justify-center gap-5 transition-all duration-500 transform-gpu group-hover:-translate-y-2 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                 
                 {/* Internal Card Background Accent */}
                 <div className={`absolute inset-0 bg-gradient-to-br ${spec.color} opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`} />

                 {/* Icon Wrapper Ring */}
                 <div className={`relative w-[70px] h-[70px] md:w-[85px] md:h-[85px] rounded-2xl bg-gradient-to-br ${spec.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 z-10 border border-white/60 ring-4 ring-transparent group-hover:ring-white/50`}>
                   <img 
                     src={spec.icon} 
                     alt={spec.title} 
                     className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110" 
                   />
                 </div>
                 
                 {/* Text Content */}
                 <div className="relative w-full z-10 mt-1">
                   <h3 className={`text-[#1E232F] font-extrabold text-[15px] md:text-[16px] text-center transition-colors duration-300 ${spec.iconColor.replace('text-', 'group-hover:text-')} tracking-wide`}>
                     {spec.title}
                   </h3>
                 </div>

                 {/* Top Right Mini Arrow Indicator */}
                 <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="flex md:hidden justify-center mt-12 w-full">
          <button className="flex items-center justify-center gap-2 text-white bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE] active:scale-[0.98] w-full px-8 py-4 rounded-full font-bold shadow-lg shadow-[#1EBDB8]/20 transition-all group">
            <span className="text-[14px] uppercase tracking-wider">Explore All Areas</span>
            <svg className="w-5 h-5 transition-transform duration-300 group-active:translate-x-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}