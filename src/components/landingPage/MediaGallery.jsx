import React from 'react';

export default function MediaGallery() {
  const mediaItems = [
    {
      id: 1,
      title: "Clinic Modern Interior",
      category: "Clinic Tour",
      type: "image",
      imageSrc: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
      duration: null
    },
    {
      id: 2,
      title: "Dr. Sarah's Intro",
      category: "Doctor Intro",
      type: "video",
      imageSrc: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
      duration: "2:45"
    },
    {
      id: 3,
      title: "Advanced Lab Facilities",
      category: "Facility",
      type: "image",
      imageSrc: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
      duration: null
    },
    {
      id: 4,
      title: "Patient Care Journey",
      category: "Story",
      type: "video",
      imageSrc: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
      duration: "3:15"
    }
  ];

  return (
    <section className="w-full bg-white py-24 px-6 lg:px-10 overflow-hidden border-t border-gray-100">
      <div className="max-w-[1300px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-12 bg-[#3AC4B8] rounded-full" />
              <span className="text-[#3AC4B8] font-bold tracking-widest text-[13px] uppercase">Verified Media</span>
            </div>
            <h2 className="text-[#1E232F] text-[36px] md:text-[48px] font-bold leading-tight mb-6">
              Media Gallery <br />
              <span className="text-gray-400">Previews</span>
            </h2>
            <p className="text-gray-600 text-[18px] leading-relaxed font-medium">
              Get an inside look before your visit. View approved clinic tours, doctor introductions, 
              and state-of-the-art facilities directly on doctor profiles.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-center px-6 py-4 bg-[#F9FAFB] rounded-3xl border border-gray-100">
                <p className="text-[#1E232F] text-[24px] font-black leading-none mb-1">500+</p>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Tours</p>
             </div>
             <div className="text-center px-6 py-4 bg-[#1E232F] rounded-3xl text-white shadow-xl">
                <p className="text-[24px] font-black leading-none mb-1">200+</p>
                <p className="text-gray-300 text-[10px] uppercase font-bold tracking-wider">Videos</p>
             </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mediaItems.map((item) => (
            <div key={item.id} className="group relative">
               {/* Media Card */}
               <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden bg-gray-100 shadow-sm transition-all duration-700 hover:shadow-2xl hover:-translate-y-2">
                  <img 
                    src={item.imageSrc} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Play Button for videos */}
                  {item.type === 'video' ? (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-500 transform group-hover:scale-110">
                       <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white shadow-2xl">
                          <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                       </div>
                    </div>
                  ) : (
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[12px] font-bold">
                          View Image
                       </div>
                    </div>
                  )}

                  {/* Info Overlay (Bottom) */}
                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                     <p className="text-[#3AC4B8] text-[12px] font-black uppercase tracking-widest mb-1">{item.category}</p>
                     <h3 className="text-white text-[18px] font-bold leading-tight">{item.title}</h3>
                     {item.duration && (
                       <div className="mt-4 flex items-center gap-2">
                          <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                             <div className="h-full w-1/3 bg-[#3AC4B8] rounded-full" />
                          </div>
                          <span className="text-white/60 text-[11px] font-bold">{item.duration}</span>
                       </div>
                     )}
                  </div>

                  {/* Label (Top Left) */}
                  <div className="absolute top-6 left-6">
                    <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-lg ${
                      item.type === 'video' ? 'bg-[#1E232F]/80 text-white' : 'bg-white/90 text-[#1E232F]'
                    }`}>
                      {item.type === 'video' ? 'Video Intro' : 'Gallery'}
                    </div>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Feature Detail Section */}
        <div className="mt-20 bg-[#F9FAFB] rounded-[48px] p-8 md:p-12 border border-gray-100">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-1 space-y-6">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                    <svg className="w-8 h-8 text-[#1E232F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                 </div>
                 <h3 className="text-[28px] font-bold text-[#1E232F]">Transparency Through <br /> Verified Content</h3>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3 p-6 bg-white rounded-3xl shadow-sm border border-gray-50">
                    <h4 className="text-[17px] font-bold text-[#1E232F]">Verified Clinic Tours</h4>
                    <p className="text-gray-500 text-[14px]">Explore the clinical environment, hygiene standards, and patient zones before you step in.</p>
                 </div>
                 <div className="space-y-3 p-6 bg-white rounded-3xl shadow-sm border border-gray-50">
                    <h4 className="text-[17px] font-bold text-[#1E232F]">Expert Introductions</h4>
                    <p className="text-gray-500 text-[14px]">Listen to doctors explain their approach to care and medical philosophies in verified video sessions.</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
}
