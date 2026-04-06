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
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=400",
      coords: { x: '25%', y: '30%' }
    },
    {
      id: 1,
      name: "Aga Khan Pharma",
      address: "Stadium Road, Gulshan-e-Iqbal",
      status: "Closing at 11 PM",
      distance: "1.2 km",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1585435557343-3b0928aa3932?auto=format&fit=crop&q=80&w=400",
      coords: { x: '65%', y: '20%' }
    },
    {
      id: 2,
      name: "LifeCare Stores",
      address: "DHA Phase 6, Karachi",
      status: "Open Now",
      distance: "2.5 km",
      rating: "4.7",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400",
      coords: { x: '50%', y: '45%' }
    }
  ];

  return (
    <section className="w-full bg-[#F5F7FA] py-20 px-6 lg:px-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1EBDB8]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="max-w-[1300px] mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#1EBDB8]" />
              <span className="text-[#1EBDB8] text-[10px] font-bold uppercase tracking-[3px]">Medical Network</span>
            </div>
            <h2 className="text-[#1E232F] text-[36px] md:text-[48px] font-bold leading-[1.15] tracking-tight">
              Find Medical Support <br />
              <span className="text-[#1EBDB8]">In Your Neighborhood</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[#1E232F] text-[13px] font-semibold">3 Nearby</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1">
            {stores.map((store) => (
              <div 
                key={store.id}
                onMouseEnter={() => setSelectedStore(store.id)}
                onClick={() => setSelectedStore(store.id)}
                className={`group relative overflow-hidden rounded-[24px] transition-all duration-500 cursor-pointer border ${
                  selectedStore === store.id 
                  ? 'bg-white border-[#1EBDB8]/30 shadow-lg shadow-[#1EBDB8]/10 scale-[1.02]' 
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden">
                    <img 
                      src={store.image} 
                      alt={store.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 transition-opacity duration-500 ${selectedStore === store.id ? 'opacity-0' : 'opacity-30 bg-black/20'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold text-[15px] truncate transition-colors ${selectedStore === store.id ? 'text-[#1EBDB8]' : 'text-[#1E232F]'}`}>
                        {store.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[12px] font-bold text-[#1E232F]">{store.rating}</span>
                      </div>
                    </div>
                    <p className="text-[13px] text-gray-400 mb-2 truncate">{store.address}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        store.status.includes('24/7') 
                          ? 'bg-green-100 text-green-700' 
                          : store.status.includes('Now')
                          ? 'bg-[#1EBDB8]/10 text-[#1EBDB8]'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {store.status}
                      </span>
                      <span className="text-[12px] font-medium text-gray-400 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {store.distance}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedStore === store.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE]" />
                )}
              </div>
            ))}

            <button className="mt-2 w-full py-3.5 rounded-[16px] border-2 border-dashed border-gray-200 text-gray-400 font-semibold text-[14px] hover:border-[#1EBDB8]/40 hover:text-[#1EBDB8] transition-all duration-300 flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              View All Pharmacies
            </button>
          </div>

          <div className="lg:col-span-8 relative order-1 lg:order-2 h-[450px] lg:h-[520px]">
            <div className="absolute inset-0 bg-[#E8EDEE] rounded-[32px] overflow-hidden border border-gray-200 shadow-2xl">
              
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 900 550" preserveAspectRatio="xMidYMid slice">
                <rect width="900" height="550" fill="#E8EDEE" />
                
                <rect x="50" y="40" width="120" height="80" rx="8" fill="#C8E6C9" opacity="0.7" />
                <rect x="680" y="380" width="140" height="100" rx="8" fill="#C8E6C9" opacity="0.7" />
                <rect x="350" y="30" width="80" height="60" rx="6" fill="#C8E6C9" opacity="0.5" />
                
                <ellipse cx="780" cy="120" rx="90" ry="60" fill="#B3D9F7" opacity="0.6" />
                
                <line x1="0" y1="180" x2="900" y2="180" stroke="#FFFFFF" strokeWidth="18" />
                <line x1="0" y1="180" x2="900" y2="180" stroke="#F5F5F0" strokeWidth="14" />
                <line x1="0" y1="180" x2="900" y2="180" stroke="#E8E8E0" strokeWidth="2" />
                
                <line x1="0" y1="380" x2="900" y2="380" stroke="#FFFFFF" strokeWidth="14" />
                <line x1="0" y1="380" x2="900" y2="380" stroke="#F5F5F0" strokeWidth="10" />
                <line x1="0" y1="380" x2="900" y2="380" stroke="#E8E8E0" strokeWidth="1.5" />
                
                <line x1="200" y1="0" x2="200" y2="550" stroke="#FFFFFF" strokeWidth="16" />
                <line x1="200" y1="0" x2="200" y2="550" stroke="#F5F5F0" strokeWidth="12" />
                <line x1="200" y1="0" x2="200" y2="550" stroke="#E8E8E0" strokeWidth="1.5" />
                
                <line x1="500" y1="0" x2="500" y2="550" stroke="#FFFFFF" strokeWidth="12" />
                <line x1="500" y1="0" x2="500" y2="550" stroke="#F5F5F0" strokeWidth="8" />
                
                <line x1="720" y1="0" x2="720" y2="550" stroke="#FFFFFF" strokeWidth="10" />
                <line x1="720" y1="0" x2="720" y2="550" stroke="#F5F5F0" strokeWidth="6" />
                
                <line x1="0" y1="280" x2="900" y2="280" stroke="#FFFFFF" strokeWidth="8" />
                <line x1="0" y1="280" x2="900" y2="280" stroke="#F5F5F0" strokeWidth="5" />
                <line x1="350" y1="0" x2="350" y2="550" stroke="#FFFFFF" strokeWidth="8" />
                <line x1="350" y1="0" x2="350" y2="550" stroke="#F5F5F0" strokeWidth="5" />
                
                <line x1="0" y1="500" x2="500" y2="0" stroke="#FFFFFF" strokeWidth="6" />
                <line x1="0" y1="500" x2="500" y2="0" stroke="#F5F5F0" strokeWidth="4" />
                
                <rect x="220" y="50" width="80" height="100" rx="4" fill="#D5D8DC" />
                <rect x="220" y="200" width="100" height="60" rx="4" fill="#D5D8DC" />
                <rect x="520" y="50" width="150" height="100" rx="4" fill="#D5D8DC" />
                <rect x="520" y="200" width="120" height="60" rx="4" fill="#D5D8DC" />
                <rect x="50" y="200" width="120" height="60" rx="4" fill="#D5D8DC" />
                <rect x="50" y="300" width="100" height="60" rx="4" fill="#D5D8DC" />
                <rect x="370" y="200" width="100" height="60" rx="4" fill="#D5D8DC" />
                <rect x="370" y="300" width="100" height="60" rx="4" fill="#D5D8DC" />
                <rect x="740" y="200" width="100" height="150" rx="4" fill="#D5D8DC" />
                <rect x="220" y="400" width="100" height="80" rx="4" fill="#D5D8DC" />
                <rect x="520" y="400" width="150" height="80" rx="4" fill="#D5D8DC" />
                
                <text x="450" y="175" fill="#A0A0A0" fontSize="9" fontWeight="500" textAnchor="middle" fontFamily="system-ui">Shahrah-e-Faisal</text>
                <text x="195" y="280" fill="#A0A0A0" fontSize="8" fontWeight="500" textAnchor="middle" transform="rotate(-90, 195, 280)" fontFamily="system-ui">Tariq Road</text>
              </svg>

              <div className="relative w-full h-full">
                {stores.map((store) => (
                  <div 
                    key={store.id}
                    className={`absolute transition-all duration-700 ease-out cursor-pointer ${selectedStore === store.id ? 'z-30' : 'z-10'}`}
                    style={{ left: store.coords.x, top: store.coords.y }}
                    onClick={() => setSelectedStore(store.id)}
                  >
                    <div className="relative group/marker">
                      {selectedStore === store.id && (
                        <>
                          <div className="absolute -inset-10 bg-[#1EBDB8]/15 rounded-full animate-ping opacity-40" />
                          <div className="absolute -inset-4 bg-[#1EBDB8]/25 rounded-full animate-pulse" />
                        </>
                      )}
                      
                      <div className={`relative flex flex-col items-center transition-all duration-500 ${selectedStore === store.id ? '-translate-y-4' : ''}`}>
                        <div className={`relative transition-all duration-500 ${selectedStore === store.id ? 'scale-110' : ''}`}>
                          <svg width="32" height="44" viewBox="0 0 32 44" fill="none" className="drop-shadow-lg">
                            <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill={selectedStore === store.id ? '#1EBDB8' : '#FFFFFF'} stroke={selectedStore === store.id ? '#1EBDB8' : '#D1D5DB'} strokeWidth="1.5" />
                            <circle cx="16" cy="15" r="7" fill={selectedStore === store.id ? 'white' : '#1EBDB8'} />
                          </svg>
                          <div className="absolute top-[8px] left-1/2 -translate-x-1/2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={selectedStore === store.id ? '#1EBDB8' : 'white'} strokeWidth="2.5">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                        </div>
                        
                        {selectedStore === store.id && (
                          <div className="mt-1 bg-white rounded-xl px-4 py-2 shadow-xl border border-gray-100 whitespace-nowrap">
                            <p className="text-[#1E232F] text-[13px] font-bold">{store.name}</p>
                            <p className="text-gray-400 text-[10px]">{store.distance} away</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="absolute left-[15%] top-[65%] z-20">
                  <div className="relative">
                    <div className="absolute -inset-16 bg-[#1EBDB8]/8 rounded-full animate-pulse" />
                    <div className="absolute -inset-8 bg-[#1EBDB8]/12 rounded-full animate-ping opacity-30" />
                    <div className="relative w-10 h-10 bg-white rounded-full border-[3px] border-[#1EBDB8] flex items-center justify-center shadow-xl">
                      <div className="w-3 h-3 bg-[#1EBDB8] rounded-full border-2 border-white" />
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1E232F] text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-lg">
                      Your Location
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                  <button className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#1EBDB8] hover:border-[#1EBDB8]/30 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 5v-2M12 21v-2M5 12H3M21 12h-2" />
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#1EBDB8] hover:border-[#1EBDB8]/30 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#1EBDB8] hover:border-[#1EBDB8]/30 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-xl z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#1EBDB8] to-[#1CAAAE] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#1EBDB8]/20">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-[#1E232F] font-bold text-[14px]">Karachi, Sindh</h4>
                      <p className="text-gray-400 text-[11px]">3 pharmacies nearby</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[#1EBDB8] text-[18px] font-bold leading-none">2.5km</p>
                      <p className="text-gray-400 text-[9px] uppercase font-semibold tracking-wider">Coverage</p>
                    </div>
                    <div className="h-8 w-[1px] bg-gray-200" />
                    <div className="text-center">
                      <p className="text-[#1E232F] text-[18px] font-bold leading-none">5 min</p>
                      <p className="text-gray-400 text-[9px] uppercase font-semibold tracking-wider">Avg. ETA</p>
                    </div>
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
