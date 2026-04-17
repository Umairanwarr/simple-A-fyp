import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { fetchDoctorCompletedPatients, createDoctorPrescription, fetchDoctorPrescriptions, deleteDoctorPrescription } from '../../services/authApi';

export default function DigitalPrescription() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sentPrescriptions, setSentPrescriptions] = useState([]);
  const [isPrescriptionsLoading, setIsPrescriptionsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  const fileInputRef = useRef(null);

  const loadPrescriptions = async (token) => {
    try {
      setIsPrescriptionsLoading(true);
      const data = await fetchDoctorPrescriptions(token);
      if (data.prescriptions) setSentPrescriptions(data.prescriptions);
    } catch (err) {
      // silent
    } finally {
      setIsPrescriptionsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('doctorToken');
    if (!token) return;

    const loadPatients = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDoctorCompletedPatients(token);
        if (mounted && data.patients) setPatients(data.patients);
      } catch (err) {
        toast.error('Could not load patients list');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadPatients();
    loadPrescriptions(token);
    
    return () => { mounted = false; };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setNotes('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    if (imageFile) removeImage();
  };

  const handleSubmit = async () => {
    if (!selectedPatientId) return toast.error('Please select a patient first');
    if (!notes.trim() && !imageFile) return toast.error('Please provide either prescription notes or an image');

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('doctorToken');
      
      const formData = new FormData();
      formData.append('patientId', selectedPatientId);
      if (notes.trim()) formData.append('notes', notes);
      if (imageFile) formData.append('prescriptions', imageFile);

      await createDoctorPrescription(token, formData);
      toast.success('Prescription sent successfully');
      
      setSelectedPatientId('');
      setNotes('');
      removeImage();
      loadPrescriptions(token);
    } catch (err) {
      toast.error(err.message || 'Failed to send prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (prescriptionId) => {
    if (!window.confirm('Delete this prescription? This cannot be undone.')) return;
    try {
      setDeletingId(prescriptionId);
      const token = localStorage.getItem('doctorToken');
      await deleteDoctorPrescription(token, prescriptionId);
      setSentPrescriptions(prev => prev.filter(p => String(p._id) !== String(prescriptionId)));
      toast.success('Prescription deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete prescription');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Form */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-[24px] font-bold text-[#1F2432]">New Digital Prescription</h3>
            <p className="text-[#9ca3af] mt-1">Prescriptions are automatically sent to the patient's vault.</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#1F2432] ml-1">Select Patient</label>
              <div className="relative">
                <select 
                  value={selectedPatientId} 
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[#111827] focus:outline-none focus:border-[#1EBDB8] transition-colors appearance-none cursor-pointer"
                >
                  <option value="">{isLoading ? 'Loading patients...' : 'Choose a patient...'}</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              <p className="text-[13px] text-[#6B7280] ml-1">Only patients with completed appointments appear</p>
            </div>
            
            {!imageFile && (
              <>
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-[#1F2432] ml-1">Medications & Dosage</label>
                  <textarea 
                    value={notes}
                    onChange={handleNotesChange}
                    disabled={isSubmitting}
                    placeholder="List medicines, frequency, and duration..." 
                    rows="4" 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1EBDB8] transition-colors resize-none text-[#111827]"
                  ></textarea>
                </div>
                
                <div className="flex items-center gap-4 py-1 opacity-75">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">OR</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[14px] font-bold text-[#1F2432] ml-1">Upload Prescription Image</label>
              {!imagePreview ? (
                <div 
                  onClick={() => !notes.trim() && !isSubmitting && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${notes.trim() || isSubmitting ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' : 'border-[#1EBDB8]/40 bg-[#F4FDFD] hover:bg-[#E8FBFA] cursor-pointer'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                    disabled={!!notes.trim() || isSubmitting}
                  />
                  <svg className={`mx-auto h-8 w-8 mb-2 ${notes.trim() ? 'text-gray-400' : 'text-[#1EBDB8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className={`text-[14px] font-medium ${notes.trim() ? 'text-gray-500' : 'text-[#1F2432]'}`}>
                    {notes.trim() ? 'Manual text entered — image disabled' : 'Click to browse or drag image here'}
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 w-full">
                  <img src={imagePreview} alt="Prescription" className="w-full object-contain bg-gray-50 max-h-[300px]" />
                  <button 
                    onClick={removeImage}
                    disabled={isSubmitting}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md text-red-500 hover:bg-gray-50 transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || (!notes.trim() && !imageFile) || !selectedPatientId}
              className={`w-full py-5 text-white font-bold rounded-2xl shadow-lg transition-all ${isSubmitting || (!notes.trim() && !imageFile) || !selectedPatientId ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1EBDB8] hover:bg-[#1CAAAE] hover:scale-[1.01]'}`}
            >
              {isSubmitting ? 'Sending...' : 'Send Prescription'}
            </button>
          </div>
        </div>
      </div>

      {/* Sent Prescriptions */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <h3 className="text-[20px] font-bold text-[#1F2432] mb-6">Sent Prescriptions</h3>
        {isPrescriptionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 rounded-full border-[3px] border-[#1EBDB8] border-t-transparent animate-spin"></div>
          </div>
        ) : sentPrescriptions.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280]">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25" />
            </svg>
            <p className="font-medium">No prescriptions sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sentPrescriptions.map(rx => {
              const patient = rx.patientId || {};
              const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient';
              const hasImage = !!rx.attachmentUrl;
              return (
                <div key={rx._id} className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-2xl border border-gray-100 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      {patient.avatarDocument?.url ? (
                        <img src={patient.avatarDocument.url} alt={patientName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#1EBDB8] text-white flex items-center justify-center font-bold text-sm">
                          {String(patientName).charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[14px] text-[#1F2432] truncate">{patientName}</p>
                      <p className="text-[12px] text-[#6B7280] truncate">
                        {hasImage ? '📎 Image prescription' : rx.notes?.slice(0, 60) + (rx.notes?.length > 60 ? '...' : '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[12px] text-[#6B7280]">
                      {new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      onClick={() => handleDelete(rx._id)}
                      disabled={deletingId === rx._id}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Delete prescription"
                    >
                      {deletingId === rx._id ? (
                        <div className="w-4 h-4 rounded-full border-2 border-red-400 border-t-transparent animate-spin"></div>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                          <path d="M10 11v6M14 11v6"></path>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
