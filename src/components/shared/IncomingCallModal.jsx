import React, { useRef, useEffect } from 'react';

export default function IncomingCallModal({ callerName, callerAvatar, onAccept, onReject }) {
  const audioRef = useRef(null);

  useEffect(() => {
    // Attempt to forcefully play if blocked by strict policies
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn("Browser prevented ringtone autoplay:", err);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <audio 
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3" 
        autoPlay 
        loop 
        preload="auto"
      />
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[360px] p-8 text-center animate-in zoom-in-95 duration-300">
        <h3 className="text-[14px] font-bold text-[#6B7280] uppercase tracking-wider mb-6">Incoming Video Call</h3>
        
        <div className="relative mx-auto w-28 h-28 mb-6">
          <div className="absolute inset-0 bg-[#1EBDB8]/20 rounded-full animate-ping"></div>
          <div className="relative w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden bg-[#1EBDB8]/10">
            {callerAvatar ? (
              <img src={callerAvatar} alt={callerName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
            )}
          </div>
        </div>
        
        <h2 className="text-[24px] font-bold text-[#1F2432] mb-2">{callerName || 'Unknown Caller'}</h2>
        <p className="text-[#6B7280] text-[15px] mb-8 font-medium">is calling you...</p>
        
        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={onReject}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors shadow-sm">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-red-500 group-hover:text-white transition-colors rotate-[135deg]">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
              </svg>
            </div>
            <span className="text-[13px] font-bold text-red-500 group-hover:text-red-700">Decline</span>
          </button>
          
          <button 
            onClick={onAccept}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-[0px_8px_20px_rgba(34,197,94,0.3)] group-hover:scale-105 transition-transform animate-bounce">
              <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
              </svg>
            </div>
            <span className="text-[13px] font-bold text-green-600">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}
