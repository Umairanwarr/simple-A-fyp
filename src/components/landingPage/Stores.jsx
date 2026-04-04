import React, { useState } from 'react';

export default function Stores() {
  const [selectedStore, setSelectedStore] = useState(0);

  const stores = [
    {
      id: 0,
      name: "MedPlus Pharmacy",
      address: "123 Medical Drive, Karachi",
      status: "Open 24/7",
      distance: "0.8 km",
      rating: "4.9",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
        </svg>
      ),
      coords: { x: '25%', y: '30%' }
    },
    {
      id: 1,
      name: "Aga Khan Pharma",
      address: "Stadium Road, Gulshan-e-Iqbal",
      status: "Closing at 11 PM",
      distance: "1.2 km",
      rating: "4.8",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      coords: { x: '65%', y: '20%' }
    },
    {
      id: 2,
      name: "LifeCare Stores",
      address: "DHA Phase 6, Karachi",
      status: "Open Now",
      distance: "2.5 km",
      rating: "4.7",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
      coords: { x: '50%', y: '45%' }
    }
  ];

  return (
    <section className="w-full bg-[#1E232F] py-20 px-6 lg:px-10 overflow-hidden">
      <div className="max-w-[1300px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col mb-16">
          <span className="text-[#3AC4B8] font-bold tracking-[3px] text-[13px] uppercase mb-4 block">Medical Network</span>
          <h2 className="text-white text-[38px] md:text-[52px] font-bold leading-[1.1] tracking-tight">
            Find Medical Support <br />
            <span className="text-gray-500">In Your Neighborhood</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Store List */}
          <div className="lg:col-span-5 flex flex-col gap-5 order-2 lg:order-1">
            {stores.map((store) => (
              <div 
                key={store.id}
                onMouseEnter={() => setSelectedStore(store.id)}
                className={`group p-6 rounded-[32px] transition-all duration-500 cursor-pointer border ${
                  selectedStore === store.id 
                  ? 'bg-white border-transparent shadow-[0_20px_50px_rgba(58,196,184,0.1)] scale-[1.03]' 
                  : 'bg-[#252A3A] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    selectedStore === store.id ? 'bg-[#1E232F] text-white' : 'bg-white/5 text-[#3AC4B8]'
                  }`}>
                    {store.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold text-[19px] transition-colors ${selectedStore === store.id ? 'text-[#1E232F]' : 'text-white'}`}>
                        {store.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-lg">
                        <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className={`text-[13px] font-bold ${selectedStore === store.id ? 'text-[#1E232F]' : 'text-yellow-500'}`}>{store.rating}</span>
                      </div>
                    </div>
                    <p className={`text-[14px] font-medium mb-3 ${selectedStore === store.id ? 'text-[#1E232F]/60' : 'text-gray-400'}`}>{store.address}</p>
                    <div className="flex items-center gap-4">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        selectedStore === store.id ? 'bg-[#1E232F]/10 text-[#1E232F]' : 'bg-[#3AC4B8]/10 text-[#3AC4B8]'
                      }`}>
                        {store.status}
                      </span>
                      <span className={`text-[13px] font-semibold ${selectedStore === store.id ? 'text-[#1E232F]/40' : 'text-gray-500'}`}>
                        {store.distance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map UI */}
          <div className="lg:col-span-7 relative order-1 lg:order-2 h-[500px] lg:h-auto min-h-[550px]">
             {/* Map Container */}
             <div className="absolute inset-0 bg-[#252A3A] rounded-[48px] overflow-hidden border border-white/5 shadow-2xl">
               {/* Abstract Map Background */}
               <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 800 600" preserveAspectRatio="none">
                  <path d="M0,150 Q200,50 400,200 T800,100" stroke="white" fill="none" strokeWidth="40" strokeLinecap="round" />
                  <path d="M-50,450 Q250,350 450,550 T900,400" stroke="white" fill="none" strokeWidth="60" strokeLinecap="round" />
                  <path d="M300,-50 Q400,250 200,450 T400,700" stroke="white" fill="none" strokeWidth="30" strokeLinecap="round" />
                  <defs>
                    <pattern id="dotGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.5" fill="white" fillOpacity="0.2" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dotGrid)" />
               </svg>

               {/* Decorative Gradient Overlays */}
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#3AC4B8]/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

               {/* Map Markers Container */}
               <div className="relative w-full h-full p-12">
                 
                 {/* Main Store Markers */}
                 {stores.map((store) => (
                   <div 
                     key={store.id}
                     className={`absolute transition-all duration-700 ease-out cursor-pointer ${selectedStore === store.id ? 'z-30 scale-110' : 'z-10'}`}
                     style={{ left: store.coords.x, top: store.coords.y }}
                     onClick={() => setSelectedStore(store.id)}
                   >
                     <div className="relative group/marker">
                        {/* Interactive Ripple for selected */}
                        {selectedStore === store.id && (
                          <div className="absolute -inset-8 bg-[#3AC4B8]/20 rounded-full animate-ping opacity-40" />
                        )}
                        
                        {/* Marker Body */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md border-[3px] transition-all duration-500 transform ${
                          selectedStore === store.id 
                          ? 'bg-white border-[#3AC4B8] -translate-y-2' 
                          : 'bg-[#1E232F]/80 border-white/20 hover:border-white/40'
                        }`}>
                           <div className={`w-6 h-6 transition-colors duration-500 ${selectedStore === store.id ? 'text-[#1E232F]' : 'text-[#3AC4B8]'}`}>
                             {store.icon}
                           </div>
                        </div>

                        {/* Store Info Tooltip */}
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 transition-all duration-500 pointer-events-none ${
                          selectedStore === store.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}>
                          <div className="bg-white text-[#1E232F] px-5 py-2.5 rounded-2xl text-[14px] font-bold shadow-[0_15px_35px_rgba(0,0,0,0.3)] whitespace-nowrap">
                            {store.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
                          </div>
                        </div>
                     </div>
                   </div>
                 ))}

                 {/* User Location Indicator */}
                 <div className="absolute left-[15%] top-[55%] z-20">
                   <div className="relative">
                      <div className="absolute -inset-12 bg-[#3AC4B8]/5 rounded-full animate-pulse" />
                      <div className="w-14 h-14 bg-[#1E232F]/60 backdrop-blur-sm border border-[#3AC4B8]/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(58,196,184,0.2)]">
                         <div className="w-4 h-4 bg-[#3AC4B8] rounded-full shadow-[0_0_15px_#3AC4B8]">
                            <div className="absolute inset-0 bg-[#3AC4B8] rounded-full animate-ping opacity-60" />
                         </div>
                      </div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3AC4B8] text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl">
                         Home
                      </div>
                   </div>
                 </div>

               </div>
               
               {/* Location Context Card */}
               <div className="absolute bottom-10 left-10 right-10 bg-[#1E232F]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex items-center justify-between shadow-2xl">
                 <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-gradient-to-br from-[#3AC4B8] to-[#1EBD92] rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-[#3AC4B8]/20">
                     <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                       <circle cx="12" cy="10" r="3" />
                     </svg>
                   </div>
                   <div>
                     <h4 className="text-white font-bold text-[18px]">Nearest Stores</h4>
                     <p className="text-gray-400 text-[14px]">Serving Karachi, Sindh</p>
                   </div>
                 </div>
                 <div className="hidden sm:flex items-center gap-8">
                   <div className="text-right">
                     <p className="text-[#3AC4B8] text-[22px] font-black leading-none mb-1">10km+</p>
                     <p className="text-gray-500 text-[10px] uppercase font-black tracking-[2px]">Coverage</p>
                   </div>
                   <div className="h-10 w-[1px] bg-white/10" />
                   <div className="text-right">
                     <p className="text-white text-[22px] font-black leading-none mb-1">5 min</p>
                     <p className="text-gray-500 text-[10px] uppercase font-black tracking-[2px]">Response</p>
                   </div>
                 </div>
               </div>

             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
