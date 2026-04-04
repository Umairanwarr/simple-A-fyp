import React from 'react';

export default function FavoriteDoctors() {
  const doctors = [1, 2, 3].map((_, i) => ({
    id: i,
    name: 'Dr. Adam Cooper',
    specialty: 'Dermatologist, Cosmetologist',
    degrees: 'M.B.B.S., F.C.P.S. (Dermatology)',
    rating: '5.00',
    reviews: '7 reviews',
    location: 'San Antonio, California',
    stats: 'New Patient Appointments . Excellent wait time . Highly Recommended',
    availability: 'Next Available Today at 11 AM',
    image: '/topdoc.svg'
  }));

  return (
    <div className="flex flex-col pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#1EBDB8] font-bold text-[24px]">Favorite Doctors</h2>
        <a href="#" className="text-[#1EBDB8] font-bold text-[14px] hover:underline underline-offset-4">View all</a>
      </div>

      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 px-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {doctors.map((doc) => (
          <div key={doc.id} className="min-w-[85%] sm:min-w-[360px] max-w-[360px] snap-start bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative">
            <button className="absolute top-6 right-6 text-red-500 hover:scale-110 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            
            <div className="flex items-start gap-3 mb-2 h-[120px]">
              <div className="w-[120px] h-full bg-transparent shrink-0 flex items-end">
                <img src={doc.image} alt={doc.name} className="w-[110%] h-[110%] object-contain object-bottom -ml-2" />
              </div>
              <div className="flex flex-col pr-6 pt-2">
                <h3 className="text-[#1EBDB8] font-bold text-[17px]">{doc.name}</h3>
                <p className="text-[#1F2937] font-semibold text-[13px] mt-0.5">{doc.specialty}</p>
                <p className="text-[#9CA3AF] font-medium text-[12px] mt-0.5">{doc.degrees}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span className="text-[#6B7280] font-bold text-[11px]">{doc.rating} <span className="font-medium text-[#9CA3AF]">. {doc.reviews}</span></span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mb-5 shrink-0">
              <div className="flex items-center gap-2 text-[#6B7280]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span className="text-[12px] font-medium">{doc.location}</span>
              </div>
              <p className="text-[#9CA3AF] text-[10.5px] leading-relaxed font-medium tracking-wide">
                {doc.stats}
              </p>
              <div className="flex gap-2 text-[11px]">
                  <span className="font-bold text-[#1F2937]">Next Available</span>
                  <span className="font-bold text-[#1F2937]">Today at 11 AM</span>
              </div>
            </div>

            <button className="w-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white py-3.5 rounded-[10px] font-bold text-[14px] transition-colors mt-auto shadow-sm">
              Schedule Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
