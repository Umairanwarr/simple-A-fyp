import React, { useState, useEffect } from 'react';
import { fetchPatientExploreDoctors, fetchPatientSponsoredAccounts } from '../../services/authApi';

export default function TopProviders() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const goToSignIn = () => {
    window.location.href = '/signin';
  };

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [docsRes, sponsoredRes] = await Promise.allSettled([
          fetchPatientExploreDoctors(),
          fetchPatientSponsoredAccounts()
        ]);

        const allDocs = docsRes.status === 'fulfilled' && docsRes.value?.doctors ? docsRes.value.doctors : [];
        const sponsoredItems = sponsoredRes.status === 'fulfilled' && sponsoredRes.value?.sponsored ? sponsoredRes.value.sponsored : [];

        const sponsoredDoctors = sponsoredItems.filter(item => item.type === 'doctor');
        const sponsoredDocIds = new Set(sponsoredDoctors.map(doc => doc.id));

        const doctorMap = new Map();

        // 1. Add sponsored doctors first (flagging them as sponsored)
        sponsoredDoctors.forEach(doc => {
          doctorMap.set(doc.id, { ...doc, isSponsored: true });
        });

        // 2. Add other doctors
        allDocs.forEach(doc => {
          if (!doctorMap.has(doc.id)) {
            const isSponsored = sponsoredDocIds.has(doc.id);
            doctorMap.set(doc.id, { ...doc, isSponsored });
          }
        });

        const mergedList = Array.from(doctorMap.values());

        // Sort: sponsored first, then rating descending
        mergedList.sort((a, b) => {
          if (a.isSponsored && !b.isSponsored) return -1;
          if (!a.isSponsored && b.isSponsored) return 1;

          const ratingA = parseFloat(a.rating) || 0;
          const ratingB = parseFloat(b.rating) || 0;
          if (ratingB !== ratingA) {
            return ratingB - ratingA;
          }

          const reviewsA = parseInt(a.reviews) || 0;
          const reviewsB = parseInt(b.reviews) || 0;
          return reviewsB - reviewsA;
        });

        setProviders(mergedList.slice(0, 6));
      } catch (err) {
        console.error('Error fetching landing page doctors:', err);
        setError('Failed to load top doctors.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProviders();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full bg-[#F9F9F9] py-20 md:py-28 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1EBDB8 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-[1300px] mx-auto relative z-10 animate-pulse">
          <div className="text-center mb-14 md:mb-20">
            <div className="h-6 w-32 bg-gray-200/80 rounded-full mx-auto mb-5" />
            <div className="h-12 w-64 bg-gray-200/80 rounded-xl mx-auto mb-6" />
            <div className="h-4 w-96 bg-gray-200/80 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-[32px] p-7 border border-gray-100 flex flex-col h-[480px]">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-24 h-24 rounded-[22px] bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="h-5 bg-gray-200/80 rounded w-3/4" />
                    <div className="h-4 bg-gray-200/80 rounded w-1/2" />
                    <div className="h-3 bg-gray-200/80 rounded w-1/3" />
                    <div className="h-6 bg-yellow-50 rounded-full w-24 border border-yellow-100/50" />
                  </div>
                </div>
                <div className="border-t border-gray-50 pt-5 space-y-4 flex-1">
                  <div className="h-4 bg-gray-200/80 rounded w-5/6" />
                  <div className="h-4 bg-gray-200/80 rounded w-2/3" />
                  <div className="h-12 bg-gray-100 rounded-2xl mt-4" />
                </div>
                <div className="h-14 bg-gray-200/80 rounded-[18px] mt-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && providers.length === 0) {
    return (
      <div className="w-full bg-[#F9F9F9] py-20 md:py-28 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1EBDB8 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-[1300px] mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-[2px] w-10 bg-gradient-to-r from-transparent to-[#1EBDB8] rounded-full" />
            <span className="text-[#1EBDB8] text-[11px] md:text-[12px] font-bold uppercase tracking-[3px] md:tracking-[4px] bg-[#1EBDB8]/10 px-4 py-1.5 rounded-full">Expert Physicians</span>
            <div className="h-[2px] w-10 bg-gradient-to-l from-transparent to-[#1EBDB8] rounded-full" />
          </div>
          <h2 className="text-[#1E232F] text-3xl md:text-[48px] lg:text-[56px] font-extrabold leading-tight mb-6 tracking-tight">
            Our Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE]">Doctors</span>
          </h2>
          <div className="bg-white rounded-[32px] p-10 md:p-16 border border-gray-100 max-w-xl mx-auto shadow-sm mt-10">
            <div className="w-20 h-20 bg-[#1EBDB8]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#1EBDB8]">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="18" y1="8" x2="23" y2="13" />
                <line x1="23" y1="8" x2="18" y2="13" />
              </svg>
            </div>
            <h3 className="text-[#1E232F] text-[20px] font-bold mb-3">No Doctors Registered Yet</h3>
            <p className="text-gray-500 text-[14.5px] leading-relaxed mb-8">
              We are currently onboarding top-tier medical specialists. Please check back soon or sign in to explore other medical services.
            </p>
            <button onClick={goToSignIn} className="bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE] text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-[#1EBDB8]/20 transition-all active:scale-[0.98]">
              Sign In to Your Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F9F9F9] py-20 md:py-28 px-4 md:px-6 relative overflow-hidden">
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1EBDB8 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#1EBDB8]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-[#1CAAAE]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1300px] mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-14 md:mb-20">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-[2px] w-10 bg-gradient-to-r from-transparent to-[#1EBDB8] rounded-full" />
            <span className="text-[#1EBDB8] text-[11px] md:text-[12px] font-bold uppercase tracking-[3px] md:tracking-[4px] bg-[#1EBDB8]/10 px-4 py-1.5 rounded-full">Expert Physicians</span>
            <div className="h-[2px] w-10 bg-gradient-to-l from-transparent to-[#1EBDB8] rounded-full" />
          </div>
          <h2 className="text-[#1E232F] text-3xl md:text-[48px] lg:text-[56px] font-extrabold leading-tight mb-6 tracking-tight">
            Our Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE]">Doctors</span>
          </h2>
          <p className="text-gray-500 text-[16px] md:text-[18px] max-w-2xl mx-auto leading-relaxed">
            Connect with highly-rated medical professionals who are ready to provide exceptional care tailored to your needs.
          </p>
        </div>
        
        {/* Doctor Grid */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-2 md:pb-0 snap-x snap-mandatory md:snap-none hide-scrollbar">
          {providers.map((doc, index) => (
            <div 
              key={doc.id || index} 
              className={`group bg-white rounded-[32px] p-7 border transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(30,189,184,0.15)] hover:-translate-y-2 flex flex-col relative overflow-hidden min-w-[320px] md:min-w-0 snap-start ${
                doc.isSponsored 
                  ? 'border-[#1EBDB8]/30 bg-gradient-to-b from-[#1EBDB8]/5 to-white' 
                  : 'border-gray-100 hover:border-[#1EBDB8]/30'
              }`}
            >
              
              {/* Decorative Accent inside Card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#1EBDB8]/10 to-transparent rounded-bl-full opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700" />

              {/* Sponsored/Featured Badge */}
              {doc.isSponsored && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE] text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm z-20">
                  Featured
                </span>
              )}

              {/* Profile Top Layer */}
              <div className="flex items-start gap-5 mb-6 relative z-10">
                <div className="w-24 h-24 shrink-0 rounded-[22px] overflow-hidden border-2 border-gray-50 bg-[#F5F7FA] group-hover:border-[#1EBDB8]/40 transition-colors duration-500 shadow-sm relative">
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 bg-white" 
                  />
                  {/* Verified Badge Overlay */}
                  <div className="absolute bottom-1 right-1 bg-white rounded-full p-[2px] shadow-sm transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1EBDB8" className="text-white">
                       <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-col pt-1">
                  <h3 className="text-[#1E232F] text-[19px] font-bold leading-tight mb-1 group-hover:text-[#1EBDB8] transition-colors duration-300">
                    {doc.name}
                  </h3>
                  <p className="text-[#1EBDB8] text-[14px] font-bold leading-snug mb-1">
                    {doc.specialty}
                  </p>
                  <p className="text-gray-400 text-[12px] font-medium leading-snug mb-2.5">
                    {doc.degree}
                  </p>
                  <div className="flex items-center gap-1.5 bg-yellow-50 w-fit px-2.5 py-1 rounded-full border border-yellow-100/50">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" className="text-yellow-400">
                       <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-gray-700 text-[12px] font-bold">
                      {doc.rating} <span className="font-medium text-gray-400 mx-0.5">·</span> <span className="text-gray-500 font-medium">{doc.reviews}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Information List */}
              <div className="flex flex-col gap-4 mt-2 flex-1 border-t border-gray-50 pt-5 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="bg-[#F5F7FA] p-1.5 rounded-lg group-hover:bg-[#1EBDB8]/10 transition-colors duration-300 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8] shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <p className="text-gray-600 text-[13.5px] font-medium leading-relaxed pt-[2px]">
                    {doc.location}
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                   <div className="bg-[#F5F7FA] p-1.5 rounded-lg group-hover:bg-[#1EBDB8]/10 transition-colors duration-300 mt-0.5">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8] shrink-0">
                       <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                       <polyline points="22 4 12 14.01 9 11.01"></polyline>
                     </svg>
                   </div>
                   <p className="text-gray-500 text-[12.5px] font-medium leading-[1.6] pt-[2px] flex-1">
                     {doc.tags ? doc.tags.split('.').map((tag, i, arr) => (
                       <React.Fragment key={i}>
                         <span className="text-gray-600">{tag.trim()}</span>
                         {i < arr.length - 1 && <span className="mx-1.5 text-gray-300 font-black">•</span>}
                       </React.Fragment>
                     )) : (
                       <span className="text-gray-600">Verified Professional</span>
                     )}
                   </p>
                </div>
                
                <div className="mt-auto pt-4">
                  <div className="bg-gradient-to-r from-[#1EBDB8]/10 to-[#1CAAAE]/5 rounded-2xl px-4 py-3.5 border border-[#1EBDB8]/10 flex items-center gap-3 group-hover:from-[#1EBDB8]/15 transition-colors duration-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1EBDB8] animate-pulse shadow-[0_0_8px_#1EBDB8]" />
                    <p className="text-[#1EBDB8] text-[13.5px] font-bold tracking-wide">
                      {doc.availability || 'Next Available Tomorrow'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action Wrapper */}
              <div className="mt-6 pt-1 relative z-10 w-full">
                <button onClick={goToSignIn} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 shadow-sm text-[#1E232F] hover:bg-gradient-to-r hover:from-[#1EBDB8] hover:to-[#1CAAAE] hover:text-white hover:border-transparent py-4 rounded-[18px] font-bold text-[14.5px] transition-all duration-300 transform group/btn hover:shadow-xl hover:shadow-[#1EBDB8]/25 active:scale-[0.98]">
                  <span>Schedule Appointment</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover/btn:translate-x-1">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
