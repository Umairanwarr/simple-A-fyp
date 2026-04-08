import React from 'react';

export default function DigitalPrescription() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-[24px] font-bold text-[#1F2432]">New Digital Prescription</h3>
            <p className="text-[#9ca3af] mt-1">Prescriptions are automatically sent to the patient's vault.</p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[14px] font-bold text-[#1F2432] ml-1">Patient Name</label>
                <input type="text" placeholder="Search patient..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1EBDB8] transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-bold text-[#1F2432] ml-1">Diagnosis</label>
                <input type="text" placeholder="Diagnosis title..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1EBDB8] transition-colors" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#1F2432] ml-1">Medications & Dosage</label>
              <textarea placeholder="List medicines, frequency, and duration..." rows="4" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1EBDB8] transition-colors resize-none"></textarea>
            </div>

            <button className="w-full py-5 bg-[#1EBDB8] text-white font-bold rounded-2xl shadow-lg hover:bg-[#1CAAAE] transition-all hover:scale-[1.01]">
              Generate & Send Prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
