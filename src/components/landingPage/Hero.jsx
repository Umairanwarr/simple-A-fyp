export default function Hero() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center text-center px-4 pt-[10vh] pb-16 md:pb-24">
      <h1 className="text-4xl sm:text-5xl md:text-[56px] leading-[1.1] text-white font-medium mb-6 md:mb-10 tracking-tight">
        Find World's Best <br className="hidden sm:block" /> Medical Care
      </h1>
      <p className="text-white font-medium mb-10 md:mb-12 text-[15px] md:text-[17px]">
        Find The Best Healthcare Options Near You!
      </p>
      
      <div className="w-full max-w-[850px] bg-[#3B4052] rounded-[28px] md:rounded-full p-4 md:p-2 md:pl-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-4 shadow-lg shadow-black/10">
        <div className="flex flex-1 items-center gap-3 w-full bg-[#303443] md:bg-transparent p-3 md:p-0 rounded-2xl md:rounded-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 shrink-0">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search disease, hospitals" 
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 font-medium"
          />
        </div>
        
        <div className="flex flex-1 items-center gap-3 w-full bg-[#303443] md:bg-transparent p-3 md:p-0 rounded-2xl md:rounded-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <input 
            type="text" 
            defaultValue="Mountain View, CA" 
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 font-medium"
          />
        </div>
        
        <button className="bg-white text-[15px] text-[#1E232F] px-8 py-[14px] rounded-full font-semibold whitespace-nowrap hover:bg-gray-100 transition-colors w-full md:w-auto mt-2 md:mt-0 shadow-sm">
          Explore Premium Care
        </button>
      </div>
    </div>
  );
}
