import React from 'react';

export default function TopProviders() {
  const providers = Array(6).fill({
    name: "Dr. Adam Cooper",
    specialty: "Dermatologist, Cosmetologist",
    degree: "M.B.B.S., F.C.P.S. (Dermatology)",
    rating: "5.00",
    reviews: "7 reviews",
    location: "San Antonio, California",
    tags: "New Patient Appointments . Excellent wait time . Highly Recommended",
    availability: "Next Available Today at 11 AM",
    image: "/topdoc.svg"
  });

  return (
    <div className="w-full bg-[#F9F9F9] py-20 px-6 lg:px-10">
      <div className="max-w-[1300px] mx-auto">
        <h2 className="text-[#1D635D] text-[36px] md:text-[44px] font-semibold text-center mb-16">
          Our Top Providers
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map((doc, index) => (
            <div 
              key={index} 
              className="bg-white rounded-[28px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col"
            >
              {/* Top part: Image and Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden">
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-[#1EBDB8] text-[18px] font-semibold leading-tight mb-1">
                    {doc.name}
                  </h3>
                  <p className="text-[#1F2937] text-[13px] font-bold leading-snug mb-1.5">
                    {doc.specialty}
                  </p>
                  <p className="text-[#9CA3AF] text-[12px] font-medium leading-snug mb-2">
                    {doc.degree}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" className="text-yellow-400">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-[#6B7280] text-[12px] font-medium">
                      {doc.rating} <span className="font-bold text-gray-400 mx-0.5">·</span> {doc.reviews}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider (Implicit or whitespace) */}
              
              {/* Location and Info */}
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-start gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B7280] mt-0.5 shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <p className="text-[#4B5563] text-[12px] font-semibold">
                    {doc.location}
                  </p>
                </div>
                
                <p className="text-[#9CA3AF] text-[11px] font-medium leading-[1.6]">
                  {doc.tags}
                </p>
                
                <p className="text-[#1F2937] text-[12px] font-bold mt-1">
                  {doc.availability}
                </p>
              </div>

              {/* Button */}
              <button className="w-full mt-6 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white py-3 rounded-full font-semibold text-[14px] transition-colors shadow-sm">
                Schedule Appointment
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
