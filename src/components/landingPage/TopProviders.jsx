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
      ratings: "Brain & Spine Expert . Board Certified . Available Online",
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
    <div className="w-full bg-[#F9F9F9] py-20 md:py-28 px-6 lg:px-10 relative overflow-hidden">
      <div className="max-w-[1300px] mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#1EBDB8]" />
            <span className="text-[#1EBDB8] text-[10px] font-bold uppercase tracking-[3px]">Expert Physicians</span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#1EBDB8]" />
          </div>
          <h2 className="text-[#1E232F] text-3xl md:text-[48px] font-bold leading-tight mb-4">
            Our Top Doctors
          </h2>
          <p className="text-gray-500 text-[15px] md:text-[17px] max-w-2xl mx-auto">
            Connect with highly-rated medical professionals who are ready to provide exceptional care.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {providers.map((doc, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-[28px] p-6 border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-[#1EBDB8]/30 transition-colors duration-500">
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-[#1EBDB8] text-[17px] font-semibold leading-tight mb-1 group-hover:text-[#1CAAAE] transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-[#1E232F] text-[13px] font-medium leading-snug mb-1.5">
                    {doc.specialty}
                  </p>
                  <p className="text-gray-400 text-[11px] font-medium leading-snug mb-2">
                    {doc.degree}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" className="text-yellow-400">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-gray-500 text-[12px] font-medium">
                      {doc.rating} <span className="font-bold text-gray-400 mx-0.5">·</span> {doc.reviews}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2 flex-1">
                <div className="flex items-start gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mt-0.5 shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <p className="text-gray-500 text-[12px] font-medium">
                    {doc.location}
                  </p>
                </div>
                
                <p className="text-gray-400 text-[11px] font-medium leading-[1.6]">
                  {doc.tags}
                </p>
                
                <div className="mt-2 bg-[#1EBDB8]/5 rounded-xl px-3 py-2 border border-[#1EBDB8]/10">
                  <p className="text-[#1EBDB8] text-[11px] font-semibold">
                    {doc.availability}
                  </p>
                </div>
              </div>

              <button className="w-full mt-5 bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE] hover:shadow-lg hover:shadow-[#1EBDB8]/25 text-white py-3 rounded-full font-semibold text-[14px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                Schedule Appointment
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}