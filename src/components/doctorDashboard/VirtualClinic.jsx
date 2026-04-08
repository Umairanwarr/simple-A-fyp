import React from 'react';

export default function VirtualClinic() {
  const appointments = [
    { name: 'John Doe', time: '10:30 AM', status: 'Online', type: 'Video Call' },
    { name: 'Jane Smith', time: '11:15 AM', status: 'Offline', type: 'Video Call' },
    { name: 'Robert Wilson', time: '12:00 PM', status: 'Online', type: 'Consultation' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[#1F2432]">Today's Appointments</h3>
          <button className="text-[14px] font-bold text-[#1EBDB8] hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {appointments.map((apt, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#1EBDB8]/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-[#1EBDB8]/10 rounded-full flex items-center justify-center text-lg">👤</div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${apt.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#1F2432]">{apt.name}</p>
                  <p className="text-[13px] text-[#9ca3af] font-medium">{apt.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-[14px] font-bold text-[#1F2432]">{apt.time}</p>
                <button className="px-4 py-2 bg-[#1EBDB8] text-white text-[12px] font-bold rounded-xl hover:bg-[#1CAAAE]">Start Call</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
