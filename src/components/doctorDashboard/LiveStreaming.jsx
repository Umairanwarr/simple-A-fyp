import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorSessionProfile } from '../../utils/authSession';

const normalizePlan = (planValue) => {
  const normalizedPlan = String(planValue || '').trim().toLowerCase();

  if (['platinum', 'gold', 'diamond'].includes(normalizedPlan)) {
    return normalizedPlan;
  }

  return 'platinum';
};

const formatPlanLabel = (planValue) => {
  const normalizedPlan = normalizePlan(planValue);
  return `${normalizedPlan.charAt(0).toUpperCase()}${normalizedPlan.slice(1)}`;
};

export default function LiveStreaming() {
  const navigate = useNavigate();
  const { currentPlan } = getDoctorSessionProfile();
  const normalizedPlan = normalizePlan(currentPlan);
  const isDiamondPlan = normalizedPlan === 'diamond';

  if (!isDiamondPlan) {
    return (
      <div className="space-y-6">
        <div className="bg-[#1F2432] p-10 rounded-[40px] text-white overflow-hidden relative min-h-[360px] flex flex-col justify-center">
          <div className="relative z-10 max-w-2xl">
            <span className="px-4 py-1.5 bg-amber-500 text-[12px] font-bold rounded-full text-white uppercase tracking-wider mb-4 inline-block">
              Upgrade Required
            </span>
            <h2 className="text-[32px] sm:text-[40px] font-bold leading-tight mb-4">Live Streaming Is Locked</h2>
            <p className="text-white/75 text-[16px] mb-8 leading-relaxed">
              You are currently on the {formatPlanLabel(normalizedPlan)} plan. Upgrade to Diamond to enable advanced live streaming,
              multi-guest sessions, and full broadcast controls.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => navigate('/doctor/dashboard/subscriptions')}
                className="px-8 py-4 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white font-bold rounded-2xl transition-all"
              >
                Upgrade To Diamond
              </button>
              <button
                type="button"
                disabled
                className="px-8 py-4 bg-white/10 text-white/45 font-bold rounded-2xl border border-white/20 cursor-not-allowed"
              >
                Streaming Disabled
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#f59e0b]/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1F2432] p-10 rounded-[40px] text-white overflow-hidden relative min-h-[400px] flex flex-col justify-center">
        <div className="relative z-10 max-w-lg">
          <span className="px-4 py-1.5 bg-[#1EBDB8] text-[12px] font-bold rounded-full text-white uppercase tracking-wider mb-4 inline-block">Diamond Plan Feature</span>
          <h2 className="text-[32px] sm:text-[40px] font-bold leading-tight mb-4">Start Your Advanced Live Stream</h2>
          <p className="text-white/70 text-[16px] mb-8 leading-relaxed">Broadcast your medical insights to thousands and invite multiple guests to join the discussion.</p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white font-bold rounded-2xl transition-all flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              Start Broadcast
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all flex items-center gap-3 border border-white/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Add Guests
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1EBDB8]/20 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
