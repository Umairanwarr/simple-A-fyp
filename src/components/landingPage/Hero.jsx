export default function Hero() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center text-center px-4 pt-[12vh] pb-20 md:pb-28 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#1EBDB8]/8 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#4F46E5]/6 rounded-full blur-[100px]" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-[#1EBDB8]/5 rounded-full blur-[80px]" />
      
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="flex items-center gap-2 mb-6 md:mb-8 animate-fade-in">
        <div className="h-[1px] w-8 md:w-12 bg-gradient-to-r from-transparent to-[#1EBDB8]" />
        <span className="text-[#1EBDB8] text-[11px] md:text-[12px] font-bold uppercase tracking-[3px] md:tracking-[4px]">Trusted by 50,000+ Patients</span>
        <div className="h-[1px] w-8 md:w-12 bg-gradient-to-l from-transparent to-[#1EBDB8]" />
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-[64px] leading-[1.05] text-white font-medium mb-6 md:mb-8 tracking-tight relative z-10 max-w-4xl">
        Find Pakistan's Best <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-[#1EBDB8] to-[#4FDBD8] bg-clip-text text-transparent">Medical Care</span>
      </h1>
      
      <p className="text-gray-400 font-medium mb-12 md:mb-14 text-[15px] md:text-[18px] max-w-2xl leading-relaxed relative z-10">
        Connect with top healthcare providers, book appointments, and access premium medical services — all in one place.
      </p>

      <div className="w-full max-w-[850px] bg-white/5 backdrop-blur-xl rounded-[28px] md:rounded-full p-4 md:p-2 md:pl-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-4 border border-white/10 shadow-2xl shadow-black/20 relative z-10">
        <div className="flex flex-1 items-center gap-3 w-full bg-white/5 md:bg-transparent p-3 md:p-0 rounded-2xl md:rounded-none border border-white/5 md:border-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8] shrink-0">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search disease, clinics, doctors..."
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 font-medium"
          />
        </div>

        <div className="h-[1px] w-full md:hidden bg-white/10" />

        <div className="flex flex-1 items-center gap-3 w-full bg-white/5 md:bg-transparent p-3 md:p-0 rounded-2xl md:rounded-none border border-white/5 md:border-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8] shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <input
            type="text"
            defaultValue="Islamabad"
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 font-medium"
          />
        </div>

        <button className="bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE] text-white text-[15px] px-8 py-[14px] rounded-full font-semibold whitespace-nowrap hover:shadow-lg hover:shadow-[#1EBDB8]/25 transition-all duration-300 w-full md:w-auto mt-2 md:mt-0 hover:scale-[1.02] active:scale-[0.98]">
          Explore Premium Care
        </button>
      </div>
    </div>
  );
}
