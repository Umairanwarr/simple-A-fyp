import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PatientDashboardLayout from './PatientDashboardLayout';
import { fetchPatientPrescriptions } from '../../services/authApi';

const getPrescriptionSerialNumber = (prescription) => {
  const suffix = String(prescription?._id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return prescription?.serialNumber || `#SIMPLE-${suffix || '000000'}`;
};

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatPrescriptionDate = (date) => (
  date
    ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A'
);

const downloadPrescription = (prescription) => {
  const doctor = prescription.doctorId || {};
  const serialNumber = getPrescriptionSerialNumber(prescription);
  const safeSerial = serialNumber.replace(/[^a-zA-Z0-9-]/g, '');
  const date = formatPrescriptionDate(prescription.createdAt);
  const hasAttachment = Boolean(prescription.attachmentUrl);
  const isPdf = prescription.attachmentFileType === 'raw';

  const prescriptionContent = hasAttachment
    ? `<div class="section">
        <h2>${isPdf ? 'PDF Prescription' : 'Image Prescription'}</h2>
        ${isPdf
          ? `<p><strong>Attached PDF:</strong> <a href="${escapeHtml(prescription.attachmentUrl)}">${escapeHtml(prescription.attachmentUrl)}</a></p>`
          : `<div class="attachment"><img src="${escapeHtml(prescription.attachmentUrl)}" alt="Prescription attachment" /></div>`
        }
      </div>`
    : `<div class="section">
        <h2>Prescription Notes</h2>
        <div class="notes">${escapeHtml(prescription.notes || 'No content provided.')}</div>
      </div>`;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Prescription ${escapeHtml(serialNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1f2432; margin: 40px; line-height: 1.5; }
      .header { border-bottom: 2px solid #1ebdb8; margin-bottom: 24px; padding-bottom: 16px; }
      .serial { color: #1ebdb8; font-size: 22px; font-weight: 700; margin: 0 0 8px; }
      .meta { color: #6b7280; margin: 4px 0; }
      .section { margin-top: 24px; }
      .notes { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; white-space: pre-wrap; }
      .attachment img { border: 1px solid #e5e7eb; border-radius: 12px; display: block; max-width: 100%; margin-top: 12px; }
      a { color: #1ebdb8; word-break: break-all; }
    </style>
  </head>
  <body>
    <div class="header">
      <p class="serial">${escapeHtml(serialNumber)}</p>
      <h1>Prescription</h1>
      <p class="meta"><strong>Doctor:</strong> Dr. ${escapeHtml(doctor.fullName || 'Doctor')}</p>
      <p class="meta"><strong>Specialization:</strong> ${escapeHtml(doctor.specialization || 'General')}</p>
      <p class="meta"><strong>Date:</strong> ${escapeHtml(date)}</p>
    </div>
    ${prescriptionContent}
  </body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `prescription-${safeSerial || 'SIMPLE'}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function PrescriptionCard({ prescription }) {
  const doctor = prescription.doctorId || {};
  const hasImage = !!prescription.attachmentUrl;
  const isPdf = prescription.attachmentFileType === 'raw';
  const serialNumber = getPrescriptionSerialNumber(prescription);

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
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-[12px] font-bold text-[#1EBDB8] bg-[#E8FBFA] px-3 py-1 rounded-full">
            {serialNumber}
          </div>
          <div className="text-[13px] font-semibold text-[#6B7280]">
            {formatPrescriptionDate(prescription.createdAt)}
          </div>
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

      <button
        type="button"
        onClick={() => downloadPrescription(prescription)}
        className="self-start inline-flex items-center gap-2 rounded-xl bg-[#1EBDB8] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#1CAAAE] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        Download Prescription
      </button>
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
      } catch {
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
