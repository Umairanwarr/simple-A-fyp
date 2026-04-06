import React from 'react';

export default function Services() {
  const services = [
    {
      title: 'Consult Online Now',
      description: 'Instantly connect with Specialists through Video call.',
      badge: '12 Doctors Online Now',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'In-Clinic Appointments',
      description: "Book an In-Person visit to doctor's clinic.",
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Laboratory Tests',
      description: 'Avail Exclusive discounts on lab tests.',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Procedures & Surgeries',
      description: 'Plan your surgeries at discounted rates.',
      image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Medicines',
      description: 'Know your medicines better',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    }
  ];

  return (
    <div className="w-full bg-[#F5F7FA] py-20 md:py-28 relative overflow-hidden">
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #1E232F 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1EBDB8]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-[#1CAAAE]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-14 md:mb-20">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-[2px] w-10 bg-gradient-to-r from-transparent to-[#1EBDB8] rounded-full" />
            <span className="text-[#1EBDB8] text-[11px] md:text-[12px] font-bold uppercase tracking-[3px] md:tracking-[4px] bg-[#1EBDB8]/10 px-4 py-1.5 rounded-full">Our Services</span>
            <div className="h-[2px] w-10 bg-gradient-to-l from-transparent to-[#1EBDB8] rounded-full" />
          </div>
          <h2 className="text-[#1E232F] text-3xl md:text-[48px] lg:text-[56px] font-extrabold leading-tight mb-6 tracking-tight">
            Comprehensive <br className="md:hidden" /> Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE]">Solutions</span>
          </h2>
          <p className="text-gray-500 text-[16px] md:text-[18px] max-w-2xl mx-auto leading-relaxed">
            From online consultations to in-person visits, we provide end-to-end medical services tailored to your needs with state-of-the-art facilities.
          </p>
        </div>

        {/* Services Grid */}
        <div className="flex md:grid md:grid-cols-5 gap-6 overflow-x-auto md:overflow-visible pb-10 md:pb-0 snap-x snap-mandatory md:snap-none px-4 md:px-0 -mx-4 md:mx-0 hide-scrollbar">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-[300px] md:w-auto snap-start group cursor-pointer perspective-1000"
            >
              <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden hover:border-[#1EBDB8]/30 transition-all duration-500 h-full flex flex-col hover:shadow-[0_20px_40px_-15px_rgba(30,189,184,0.15)] hover:-translate-y-2 transform-gpu relative">
                
                {/* Image Section */}
                <div className="relative h-[200px] overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E232F]/80 via-[#1E232F]/20 to-transparent opacity-80" />
                  
                  {/* Floating Action Circle */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>

                  {/* Badge */}
                  {service.badge && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/20 backdrop-blur-md border border-white/20 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 shadow-lg">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                      <span className="text-white font-semibold text-[13px] tracking-wide">{service.badge}</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-7 flex flex-col flex-1 relative bg-white z-10 before:absolute before:inset-0 before:bg-gradient-to-b before:from-[#1EBDB8]/5 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500">
                  <h3 className="text-[19px] font-bold text-[#1E232F] mb-3 leading-tight group-hover:text-[#1EBDB8] transition-colors duration-300 relative z-10">
                    {service.title}
                  </h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed flex-1 relative z-10">
                    {service.description}
                  </p>
                  
                  {/* Learn More Link */}
                  <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 text-[#1EBDB8] text-[14px] font-bold tracking-wide relative z-10">
                    <span className="relative overflow-hidden group/link">
                      <span className="block transform transition-transform duration-300 group-hover:-translate-y-full">Learn More</span>
                      <span className="absolute top-0 left-0 block transform transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-[#1CAAAE]">Learn More</span>
                    </span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}