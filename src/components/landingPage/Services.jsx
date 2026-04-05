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
      image: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Medicines',
      description: 'Know your medicines better',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    }
  ];

  return (
    <div className="w-full bg-[#F5F7FA] py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#1EBDB8]" />
            <span className="text-[#1EBDB8] text-[11px] font-bold uppercase tracking-[3px]">Our Services</span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#1EBDB8]" />
          </div>
            <h2 className="text-[#1E232F] text-3xl md:text-[48px] font-bold leading-tight mb-4">
              Comprehensive Healthcare <span className="text-[#1EBDB8]">Solutions</span>
            </h2>
          <p className="text-gray-500 text-[15px] md:text-[17px] max-w-2xl mx-auto">
            From online consultations to in-person visits, we provide end-to-end medical services tailored to your needs.
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-5 gap-5 md:gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory md:snap-none px-4 md:px-0 -mx-4 md:mx-0">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-[300px] md:w-auto snap-start group cursor-pointer"
            >
              <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-500 h-full flex flex-col hover:shadow-xl hover:-translate-y-1">
                <div className="relative h-[180px] overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {service.badge && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#1EBDB8] to-[#1CAAAE] py-2.5 px-4 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white font-semibold text-xs">{service.badge}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-[18px] font-bold text-[#1E232F] mb-2 leading-tight group-hover:text-[#1EBDB8] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed flex-1">
                    {service.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-[#1EBDB8] text-[13px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <span>Learn More</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
