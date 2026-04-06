import React from 'react';

export default function ClinicLiveStream() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-[#1F2432] rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative group">
        {/* Stream Banner */}
        <div className="relative h-[480px] bg-slate-900 group-hover:shadow-[inset_0_0_100px_rgba(30,189,184,0.1)] transition-shadow duration-700">
          <img 
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600" 
            alt="Live Stream Preview" 
            className="w-full h-full object-cover opacity-40 grayscale group-hover:opacity-60 transition-all duration-1000"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-6 left-6 flex items-center gap-2.5">
             <div className="bg-red-500/90 px-3 py-1 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
               <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
               Offline
             </div>
             <div className="bg-white/5 backdrop-blur-md px-3 py-1 rounded-lg text-white/50 text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-xl">
               Diamond Facility
             </div>
          </div>

          {/* Central Play/Start Button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
             <button className="w-20 h-20 bg-[#1EBDB8] rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(30,189,184,0.4)] hover:scale-105 active:scale-95 transition-all">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg>
             </button>
             <div className="text-center px-6">
               <h3 className="text-white text-2xl font-semibold tracking-tight mb-2">Hospital-Wide Symposium</h3>
               <p className="text-white/40 text-sm font-medium italic">Begin broadcasting to all connected patients and guests</p>
             </div>
          </div>

          {/* Stream Overlay Controls */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
             <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden shadow-lg hover:z-10 transition-all">
                    <img src={`https://ui-avatars.com/?name=Doc+${i}&background=random`} alt="Guest" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-white/5 backdrop-blur-md flex items-center justify-center text-white text-[10px] font-bold shadow-xl cursor-pointer hover:bg-white/10 transition-all">+2</div>
             </div>
             
             <div className="flex items-center gap-3">
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
                </button>
                <button className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition-all text-[13px]">
                  Invite Guest Doctors
                </button>
             </div>
          </div>
        </div>

        {/* Stream Stats Bar */}
        <div className="bg-[#1F2432] p-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#1EBDB8] border border-white/5">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             </div>
             <div>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Expected Audience</p>
               <p className="text-lg font-semibold text-white">450+ Patients</p>
             </div>
           </div>
           
           <div className="flex items-center gap-4 md:border-l md:border-white/5 md:pl-6">
             <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#1EBDB8] border border-white/5">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.9A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
             </div>
             <div>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Facility Chat</p>
               <p className="text-lg font-semibold text-white">Active</p>
             </div>
           </div>

           <div className="flex items-center gap-4 md:border-l md:border-white/5 md:pl-6">
             <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-amber-500 border border-white/5">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
             </div>
             <div>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Scheduled Time</p>
               <p className="text-lg font-semibold text-white">05:00 PM</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
