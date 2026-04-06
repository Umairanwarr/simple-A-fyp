import React from 'react';

export default function LiveStreams() {
  const streams = [
    {
      id: 1,
      doctor: "Dr. Ahmed Khan",
      specialty: "Senior Cardiologist",
      title: "Common Heart Issues in Adults",
      viewers: "1,240",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      doctor: "Dr. Sarah Pervez",
      specialty: "Clinical Psychologist",
      title: "Mental Health Awareness Session",
      viewers: "850",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      doctor: "Dr. Junaid Malik",
      specialty: "Neurology Specialist",
      title: "New Breakthroughs in Neurology",
      viewers: "2,500",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <section className="w-full bg-[#1E232F] py-32 px-6 lg:px-10 overflow-hidden relative">
      {/* Ultra-Subtle Background Accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1EBDB8]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="max-w-[1300px] mx-auto relative z-10">
        
        {/* Asymmetrical Header Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 mb-24 items-start">
           <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-8">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-500 font-bold text-[10px] tracking-widest uppercase">Streaming Now</span>
                 </div>
                 <div className="w-[1px] h-4 bg-white/10" />
                 <span className="text-[#1EBDB8] font-bold text-[10px] tracking-widest uppercase">Diamond Network</span>
              </div>
              <h2 className="text-white text-[44px] md:text-[64px] font-bold leading-[1.05] tracking-tight max-w-3xl">
                 Real-time Expert <br />
                 <span className="text-white/40">Clinical Broadcasts</span>
              </h2>
           </div>
           
           <div className="lg:col-span-4 lg:pt-20">
              <p className="text-gray-400 text-[17px] leading-relaxed font-medium mb-8">
                 Access exclusive live sessions from top-tier Pakistani doctors. Join verified experts 
                 discussing real-time breakthroughs in healthcare.
              </p>
              <button className="flex items-center gap-4 text-[#1EBDB8] group">
                 <span className="text-[14px] font-black uppercase tracking-[2px] border-b-2 border-[#1EBDB8]/20 group-hover:border-[#1EBDB8] transition-all pb-1">
                    Explore Streams
                 </span>
                 <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                 </svg>
              </button>
           </div>
        </div>

        {/* Minimalist Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {streams.map((stream, idx) => (
             <div 
               key={stream.id} 
               className={`group cursor-pointer ${idx === 1 ? 'lg:translate-y-12' : ''}`}
             >
                <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden bg-white/5 border border-white/5 transition-all duration-700 hover:border-[#1EBDB8]/30">
                   {/* Background Image */}
                   <img 
                     src={stream.image} 
                     alt={stream.title} 
                     className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110" 
                   />
                   
                   {/* Content Overlay */}
                   <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-[#1E232F] via-[#1E232F]/80 to-transparent">
                      <div className="flex flex-col gap-6">
                         <div className="flex justify-between items-center">
                            <span className="text-[#1EBDB8] text-[11px] font-black tracking-widest uppercase">Tier 01</span>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                               <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                               <span className="text-white text-[10px] font-black tracking-widest uppercase">{stream.viewers} LIVE</span>
                            </div>
                         </div>
                         
                         <h3 className="text-white text-[22px] md:text-[26px] font-bold leading-tight group-hover:text-[#1EBDB8] transition-colors">
                            {stream.title}
                         </h3>
                         
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden transform group-hover:rotate-6 transition-all">
                               <img src={stream.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                               <p className="text-white text-[14px] font-bold">{stream.doctor}</p>
                               <p className="text-[#1EBDB8] text-[11px] font-bold opacity-60">{stream.specialty}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Play Indicator (Only subtle) */}
                   <div className="absolute top-10 left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-[#1EBDB8] rounded-full flex items-center justify-center text-white shadow-2xl">
                         <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                         </svg>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Integrated Feature Bar */}
        <div className="mt-32 border-t border-white/5 pt-16 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
           <div className="flex flex-col gap-2">
              <h4 className="text-white font-bold text-[18px]">Encrypted & Anonymous</h4>
              <p className="text-gray-500 text-[14px]">Broadcasts are protected with end-to-end clinical security.</p>
           </div>
           <div className="h-[1px] md:h-12 w-24 md:w-[1px] bg-white/10" />
           <div className="flex flex-col gap-2">
              <h4 className="text-white font-bold text-[18px]">Real-time Interaction</h4>
              <p className="text-gray-500 text-[14px]">Direct chat access with diamond-tier Pakistani specialists.</p>
           </div>
           <div className="h-[1px] md:h-12 w-24 md:w-[1px] bg-white/10" />
           <div className="flex flex-col gap-2">
              <h4 className="text-white font-bold text-[18px]">Verified Doctors</h4>
              <p className="text-gray-500 text-[14px]">Only top-tier doctors with verified credentials are featured.</p>
           </div>
        </div>

      </div>
    </section>
  );
}
