import React, { useEffect, useState } from 'react';
import { fetchClinicAnalytics } from '../../services/authApi';

export default function ClinicAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const token = localStorage.getItem('clinicToken');
        if (!token) return;
        const data = await fetchClinicAnalytics(token);
        if (isMounted) setAnalytics(data);
      } catch {
        if (isMounted) setAnalytics(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAnalytics();
    const intervalId = window.setInterval(loadAnalytics, 30000);
    window.addEventListener('clinic-appointments-updated', loadAnalytics);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('clinic-appointments-updated', loadAnalytics);
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full min-w-0 max-w-xl mx-auto pt-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#ECFCFB] text-[#1EBDB8] flex items-center justify-center mx-auto mb-2">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">Total Profile Views</p>
          <p className="text-[48px] font-black text-[#1F2432] tracking-tight mt-1">
            {isLoading ? (
              <span className="inline-block w-8 h-8 border-4 border-[#1EBDB8] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              Number(analytics?.overview?.profileCtr || 0).toLocaleString()
            )}
          </p>
        </div>
        <p className="text-[13px] font-semibold text-gray-500 max-w-sm mx-auto">
          This count increases uniquely each time a patient views your clinic's profile from the explore dashboard.
        </p>
      </div>
    </div>
  );
}
