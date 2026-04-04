import React from 'react';

export default function UpcomingAppointments() {
  const appointments = [1, 2, 3].map((_, i) => ({
    id: i,
    date: 'Wednesday, 20th October',
    time: '11 AM - 12 PM',
    type: 'Video Appointment',
    status: 'Booked',
    doctor: {
      name: 'Dr. Adam Cooper',
      specialty: 'Dermatologist, Cosmetologist',
      image: '/topdoc.svg'
    }
  }));

  return (
    <div className="flex flex-col mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#1EBDB8] font-bold text-[24px]">Upcoming Appointments</h2>
        <a href="#" className="text-[#1EBDB8] font-bold text-[14px] hover:underline underline-offset-4">View all</a>
      </div>

      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 px-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {appointments.map((appt) => (
          <div key={appt.id} className="min-w-[85%] sm:min-w-[380px] max-w-[380px] snap-start bg-white rounded-[32px] p-7 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between h-[320px]">
            <div>
              <h3 className="text-[#1EBDB8] font-extrabold text-[23px] tracking-tight mb-5">{appt.date}</h3>
              <p className="text-[#1F2937] font-extrabold text-[22px] tracking-tight mb-4">{appt.time}</p>
              <p className="text-[#1F2937] font-bold text-[18px] mb-1">{appt.type}</p>
              <p className="text-[#05D182] font-bold text-[18px]">{appt.status}</p>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <div className="w-[52px] h-[52px] bg-transparent shrink-0 flex items-end">
                  <img src={appt.doctor.image} alt={appt.doctor.name} className="w-[120%] h-[120%] object-contain object-bottom -ml-2" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#1F2937] font-extrabold text-[16px]">{appt.doctor.name}</span>
                  <span className="text-[#6B7280] font-medium text-[13px]">{appt.doctor.specialty}</span>
                </div>
              </div>
              <button className="bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-8 py-3 rounded-full font-bold text-[16px] transition-colors shadow-sm">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
