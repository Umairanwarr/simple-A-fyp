import React from 'react';

const mediaAssets = [
  { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800', title: 'Reception Area', status: 'Approved', date: 'Oct 12, 2023' },
  { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800', title: 'Surgical Suite 1', status: 'Approved', date: 'Oct 14, 2023' },
  { id: 3, type: 'video', url: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800', title: 'Facility Walkthrough', status: 'Pending', date: 'Oct 20, 2023' },
  { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1504813184591-01592fd039e5?w=800', title: 'Diagnostic Lab', status: 'Approved', date: 'Oct 22, 2023' },
  { id: 5, type: 'image', url: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800', title: 'Patient Lounge', status: 'Rejected', date: 'Oct 25, 2023' },
];

export default function PromotionalMedia() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Asset Management Header */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Facility Media Assets</h3>
          <p className="text-sm text-gray-500">Manage promotional images and videos for your clinic profile.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#1F2432] text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95 whitespace-nowrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Upload Asset
          </button>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaAssets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="aspect-video relative group overflow-hidden bg-slate-100">
               <img 
                 src={asset.url} 
                 alt={asset.title} 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
               />
               
               {/* Status Badge */}
               <div className="absolute top-3 left-3">
                 <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${
                   asset.status === 'Approved' ? 'bg-emerald-50/90 text-emerald-600 border-emerald-100' :
                   asset.status === 'Pending' ? 'bg-amber-50/90 text-amber-600 border-amber-100' :
                   'bg-red-50/90 text-red-600 border-red-100'
                 }`}>
                   {asset.status}
                 </span>
               </div>

               {/* Video Indicator Overlay */}
               {asset.type === 'video' && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                   <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white shadow-xl">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg>
                   </div>
                 </div>
               )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                 <div>
                   <h4 className="text-[15px] font-semibold text-slate-800 leading-snug">{asset.title}</h4>
                   <p className="text-[11px] text-gray-400 font-medium mt-1">{asset.date}</p>
                 </div>
                 <div className="flex gap-1">
                    <button className="p-2 text-gray-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                    </button>
                 </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg transition-colors">
                  View Detail
                </button>
                <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Upload Placeholder */}
        <div className="aspect-square sm:aspect-auto border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-[#1EBDB8] hover:text-[#1EBDB8] hover:bg-slate-50/50 transition-all cursor-pointer group p-8 text-center">
           <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform group-hover:bg-[#1EBDB8]/5 group-hover:border-[#1EBDB8]/20">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           </div>
           <p className="font-semibold text-[15px] text-slate-700">Add new media</p>
           <p className="text-[12px] mt-1 font-medium text-slate-400">JPG, PNG or MP4 (Max 50MB)</p>
        </div>
      </div>
    </div>
  );
}
