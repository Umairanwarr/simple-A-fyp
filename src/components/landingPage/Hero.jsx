import React from 'react';

export default function Hero() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center text-center px-4 pt-[14vh] pb-24 md:pb-32 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#1EBDB8]/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#4F46E5]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-[#1EBDB8]/5 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Elegant Dot Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      
      {/* Subtle Floating Medical Elements (Crosses/Plus) */}
      <svg className="absolute top-[20%] left-[15%] text-[#1EBDB8]/20 animate-bounce pointer-events-none" style={{animationDuration: '3s'}} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z" />
      </svg>
      <svg className="absolute bottom-[30%] right-[12%] text-[#1EBDB8]/20 animate-bounce pointer-events-none" style={{animationDuration: '4s', animationDelay: '1s'}} width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z" />
      </svg>
      <svg className="absolute top-[10%] right-[25%] text-[#4FDBD8]/10 animate-bounce pointer-events-none" style={{animationDuration: '5s'}} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z" />
      </svg>
      <svg className="absolute bottom-[20%] left-[20%] text-[#4FDBD8]/10 animate-bounce pointer-events-none" style={{animationDuration: '4.5s', animationDelay: '2s'}} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z" />
      </svg>


      {/* Trust Indicator / Badge */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 w-fit mx-auto bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2.5 rounded-full relative z-10 hover:bg-white/10 transition-colors cursor-default">
        {/* Overlapping Avatars */}
        <div className="flex mr-1 sm:mr-2">
          <div className="w-7 h-7 rounded-full border-2 border-[#1E232F] bg-gray-300 overflow-hidden relative z-30">
             <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop" alt="Doctor" className="w-full h-full object-cover" />
          </div>
          <div className="w-7 h-7 rounded-full border-2 border-[#1E232F] bg-teal-800 overflow-hidden -ml-2.5 relative z-20">
             <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" alt="Doctor" className="w-full h-full object-cover" />
          </div>
          <div className="w-7 h-7 rounded-full border-2 border-[#1E232F] bg-gray-400 overflow-hidden -ml-2.5 relative z-10">
             <img src="https://images.unsplash.com/photo-1594824432258-466d71b3e8e4?w=100&h=100&fit=crop" alt="Doctor" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="h-[4px] w-[4px] bg-[#1EBDB8] rounded-full hidden sm:block" />
        <span className="text-[#1EBDB8] text-[12px] md:text-[13px] font-bold uppercase tracking-[2px] md:tracking-[3px] ml-1">Trusted by 50,000+ Patients</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-[72px] leading-[1.1] text-white font-extrabold mb-6 md:mb-8 tracking-tight relative z-10 max-w-5xl drop-shadow-2xl">
        Find Pakistan's Best <br className="hidden sm:block" />
        <span className="relative inline-block mt-2 sm:mt-0">
          <span className="relative z-10 bg-gradient-to-r from-[#1EBDB8] to-[#4FDBD8] bg-clip-text text-transparent">Medical Care</span>
          {/* Subtle underline curve for Medical Care */}
          <svg className="absolute w-full h-[12px] md:h-[18px] -bottom-1 md:-bottom-2 left-0 z-0 opacity-60 text-[#1EBDB8] pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
             <path d="M0,10 Q50,20 100,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </span>
      </h1>
      
      {/* Subheadline */}
      <p className="text-gray-300 font-normal mb-12 md:mb-16 text-[16px] md:text-[20px] max-w-2xl leading-relaxed relative z-10">
        Connect with top healthcare providers, book appointments, and access premium medical services — all in one place.
      </p>

      {/* Sleek Search Bar Configuration */}
      <div className="w-full max-w-[900px] bg-white/10 backdrop-blur-3xl rounded-3xl md:rounded-full p-2 md:p-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-2 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-10 group hover:border-[#1EBDB8]/30 transition-all duration-500">
        
        {/* Search Input */}
        <div className="flex flex-1 items-center gap-3 w-full bg-white/5 md:bg-transparent p-4 md:p-0 pl-4 md:pl-6 rounded-2xl md:rounded-none border border-white/5 md:border-none focus-within:ring-1 focus-within:ring-[#1EBDB8] md:focus-within:ring-0 transition-all">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8] shrink-0">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search disease, clinics, doctors..."
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 font-medium text-[15px] md:text-[16px] peer"
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-[1px] h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        {/* Location Input */}
        <div className="flex flex-1 items-center gap-3 w-full bg-white/5 md:bg-transparent p-4 md:p-0 md:pl-4 rounded-2xl md:rounded-none border border-white/5 md:border-none focus-within:ring-1 focus-within:ring-[#1EBDB8] md:focus-within:ring-0 transition-all">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8] shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <input
            type="text"
            defaultValue="Islamabad"
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 font-medium text-[15px] md:text-[16px]"
          />
        </div>

        {/* CTA Button */}
        <button className="bg-white text-[#1E232F] text-[15px] md:text-[16px] px-8 py-[16px] md:py-[18px] rounded-2xl md:rounded-full font-bold whitespace-nowrap hover:shadow-[0_0_20px_rgba(30,189,184,0.4)] transition-all duration-300 w-full md:w-auto mt-1 md:mt-0 hover:bg-[#1EBDB8] hover:text-white transform md:hover:scale-[1.02] active:scale-[0.98] group-hover:shadow-[0_0_15px_rgba(30,189,184,0.3)] flex items-center justify-center gap-2">
          Explore Premium Care
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="hidden md:inline-block transition-transform group-hover:translate-x-1">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

    </div>
  );
}