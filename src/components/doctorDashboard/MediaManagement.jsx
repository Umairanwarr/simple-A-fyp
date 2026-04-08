import React from 'react';

export default function MediaManagement() {
  const mediaItems = [
    { type: 'Image', name: 'ProfilePhoto.jpg', status: 'Approved', preview: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop' },
    { type: 'Video', name: 'IntroVideo.mp4', status: 'Pending', preview: 'https://images.unsplash.com/photo-1576091160550-217359f488d5?w=200&h=200&fit=crop' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[18px] font-bold text-[#1F2432]">Your Media Files</h3>
          <button className="px-6 py-2 bg-[#1EBDB8]/10 text-[#1EBDB8] font-bold rounded-full hover:bg-[#1EBDB8]/20 transition-colors">+ Upload New</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-[#1EBDB8] transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#1EBDB8]/10 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#1EBDB8]">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <p className="text-[14px] font-bold text-[#9ca3af] group-hover:text-[#1EBDB8]">Add Media</p>
          </div>

          {mediaItems.map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 group relative">
              <div className="h-40 bg-gray-200 relative">
                <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold ${item.status === 'Approved' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                  {item.status}
                </div>
              </div>
              <div className="p-4">
                <p className="text-[14px] font-bold text-[#1F2432] truncate">{item.name}</p>
                <p className="text-[12px] text-[#9ca3af] font-medium">{item.type} • Profile</p>
              </div>
              <div className="absolute inset-0 bg-[#1F2432]/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-3 bg-white rounded-full text-[#1F2432] hover:scale-110 transition-transform">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                 </button>
                 <button className="p-3 bg-red-500 rounded-full text-white hover:scale-110 transition-transform">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
