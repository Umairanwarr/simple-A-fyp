import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PatientDashboardLayout from './PatientDashboardLayout';
import { fetchPatientPrescriptions } from '../../services/authApi';

function PrescriptionCard({ prescription }) {
  const doctor = prescription.doctorId || {};
  const hasImage = !!prescription.attachmentUrl;
  const isPdf = prescription.attachmentFileType === 'raw';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
            {doctor.avatarDocument?.url ? (
              <img src={doctor.avatarDocument.url} alt={doctor.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#1EBDB8] text-white flex items-center justify-center font-bold text-lg">
                {String(doctor.fullName || 'D').charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#1F2432]">Dr. {doctor.fullName || 'Doctor'}</h3>
            <p className="text-[13px] text-[#6B7280]">{doctor.specialization || 'General'}</p>
          </div>
        </div>
        <div className="text-[13px] font-semibold text-[#1EBDB8] bg-[#E8FBFA] px-3 py-1 rounded-full shrink-0">
          {new Date(prescription.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="pt-1">
        {hasImage ? (
          <div className="space-y-3">
            <p className="text-[14px] font-semibold text-[#4B5563]">Prescription Image:</p>
            {isPdf ? (
              <a
                href={prescription.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <svg className="w-8 h-8 text-[#1EBDB8] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9" />
                </svg>
                <span className="font-semibold text-[14px] text-[#1EBDB8]">Open PDF Prescription</span>
              </a>
            ) : (
              <a href={prescription.attachmentUrl} target="_blank" rel="noreferrer"
                className="block rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-[300px] hover:shadow-md transition-all cursor-pointer">
                <img src={prescription.attachmentUrl} alt="Prescription" className="w-full object-contain max-h-[300px]" />
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[14px] font-semibold text-[#4B5563]">Prescription:</p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[14px] leading-relaxed text-[#1F2432] whitespace-pre-wrap">
                {prescription.notes || 'No content provided.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadPrescriptions = async () => {
      try {
        const token = localStorage.getItem('patientToken');
        if (!token) return;
        const data = await fetchPatientPrescriptions(token);
        if (mounted && data.prescriptions) {
          setPrescriptions(data.prescriptions);
        }
      } catch (err) {
        toast.error('Could not load prescriptions');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadPrescriptions();
    return () => { mounted = false; };
  }, []);

  return (
    <PatientDashboardLayout activeTab="prescriptions">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-[#1F2432]">My Prescriptions</h2>
          <p className="text-[15px] text-[#6B7280] mt-1">View prescriptions sent by your doctors.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-[3px] border-[#1EBDB8] border-t-transparent animate-spin"></div>
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prescriptions.map((p) => (
              <PrescriptionCard key={p._id} prescription={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-[#1F2432]">No Prescriptions Yet</h3>
            <p className="text-[#6B7280] mt-2">Your doctor's prescriptions will securely appear here.</p>
          </div>
        )}
      </div>
    </PatientDashboardLayout>
  );
}
