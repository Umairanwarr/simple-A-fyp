import React from 'react';

export default function TopProviders() {
  const providers = [
    {
      name: "Dr. Adam Cooper",
      specialty: "Dermatologist, Cosmetologist",
      degree: "M.B.B.S., F.C.P.S. (Dermatology)",
      rating: "5.00",
      reviews: "7 reviews",
      location: "San Antonio, California",
      tags: "New Patient Appointments . Excellent wait time . Highly Recommended",
      availability: "Next Available Today at 11 AM",
      image: "/topdoc.svg"
    },
    {
      name: "Dr. Sarah Mitchell",
      specialty: "Cardiologist",
      degree: "M.D., F.A.C.C.",
      rating: "4.95",
      reviews: "12 reviews",
      location: "New York, NY",
      tags: "Heart Specialist . 15+ Years Experience . Top Rated",
      availability: "Next Available Tomorrow at 9 AM",
      image: "/topdoc.svg"
    },
    {
      name: "Dr. James Wilson",
      specialty: "Neurologist",
      degree: "M.D., Ph.D. (Neuroscience)",
      rating: "4.98",
      reviews: "9 reviews",
      location: "Los Angeles, CA",
      tags: "Brain & Spine Expert . Board Certified . Available Online",
      availability: "Next Available Today at 2 PM",
      image: "/topdoc.svg"
    },
    {
      name: "Dr. Emily Chen",
      specialty: "Endocrinologist",
      degree: "M.D., F.A.C.E.",
      rating: "4.92",
      reviews: "15 reviews",
      location: "Chicago, IL",
      tags: "Diabetes Specialist . Hormone Expert . Patient Favorite",
      availability: "Next Available Wed at 10 AM",
      image: "/topdoc.svg"
    },
    {
      name: "Dr. Michael Brown",
      specialty: "Orthopedic Surgeon",
      degree: "M.D., F.A.A.O.S.",
      rating: "4.97",
      reviews: "21 reviews",
      location: "Houston, TX",
      tags: "Joint Replacement . Sports Medicine . Minimally Invasive",
      availability: "Next Available Today at 4 PM",
      image: "/topdoc.svg"
    },
    {
      name: "Dr. Lisa Anderson",
      specialty: "Psychiatrist",
      degree: "M.D., F.A.P.A.",
      rating: "4.99",
      reviews: "18 reviews",
      location: "Seattle, WA",
      tags: "Mental Health Expert . Telehealth Available . Compassionate Care",
      availability: "Next Available Today at 3 PM",
      image: "/topdoc.svg"
    }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {providers.map((doc, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-[32px] p-7 border border-gray-100 hover:border-[#1EBDB8]/30 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(30,189,184,0.15)] hover:-translate-y-2 flex flex-col relative overflow-hidden"
            >
              
              {/* Decorative Accent inside Card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#1EBDB8]/10 to-transparent rounded-bl-full opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700" />

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
                     {doc.tags.split('.').map((tag, i, arr) => (
                       <React.Fragment key={i}>
                         <span className="text-gray-600">{tag.trim()}</span>
                         {i < arr.length - 1 && <span className="mx-1.5 text-gray-300 font-black">•</span>}
                       </React.Fragment>
                     ))}
                   </p>
                </div>
                
                <div className="mt-auto pt-4">
                  <div className="bg-gradient-to-r from-[#1EBDB8]/10 to-[#1CAAAE]/5 rounded-2xl px-4 py-3.5 border border-[#1EBDB8]/10 flex items-center gap-3 group-hover:from-[#1EBDB8]/15 transition-colors duration-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1EBDB8] animate-pulse shadow-[0_0_8px_#1EBDB8]" />
                    <p className="text-[#1EBDB8] text-[13.5px] font-bold tracking-wide">
                      {doc.availability}
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action Wrapper */}
              <div className="mt-6 pt-1 relative z-10 w-full">
                <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 shadow-sm text-[#1E232F] hover:bg-gradient-to-r hover:from-[#1EBDB8] hover:to-[#1CAAAE] hover:text-white hover:border-transparent py-4 rounded-[18px] font-bold text-[14.5px] transition-all duration-300 transform group/btn hover:shadow-xl hover:shadow-[#1EBDB8]/25 active:scale-[0.98]">
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