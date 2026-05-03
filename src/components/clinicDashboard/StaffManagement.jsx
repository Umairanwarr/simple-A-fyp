import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchClinicDoctors, registerClinicDoctor } from '../../services/authApi';

const specialties = [
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Surgeon',
  'Urologist'
];

const formatNextAppointment = (appointmentRecord) => {
  const dateValue = String(appointmentRecord?.date || '').trim();
  const fromTimeValue = String(appointmentRecord?.fromTime || '').trim();

  if (!dateValue || !fromTimeValue) {
    return 'No upcoming appointment';
  }

  const parsedDateTime = new Date(`${dateValue}T${fromTimeValue}:00`);

  if (Number.isNaN(parsedDateTime.getTime())) {
    return `${dateValue} ${fromTimeValue}`;
  }

  return parsedDateTime.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    avatar: null
  });

  useEffect(() => {
    const loadClinicDoctors = async () => {
      try {
        setIsLoading(true);
        const clinicToken = localStorage.getItem('clinicToken');
        const response = await fetchClinicDoctors(clinicToken);
        setDoctors(Array.isArray(response?.doctors) ? response.doctors : []);
      } catch (error) {
        toast.error(error?.message || 'Could not load clinic doctors');
      } finally {
        setIsLoading(false);
      }
    };

    loadClinicDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = String(searchTerm || '').trim().toLowerCase();
    if (!query) return doctors;

    return doctors.filter((doctor) => {
      const name = String(doctor?.fullName || '').toLowerCase();
      const specialization = String(doctor?.specialization || '').toLowerCase();
      return name.includes(query) || specialization.includes(query);
    });
  }, [doctors, searchTerm]);

  const totalDoctors = doctors.length;
  const uniqueSpecialties = new Set(
    doctors
      .map((doctor) => String(doctor?.specialization || '').trim())
      .filter(Boolean)
  ).size;
  const doctorsWithAvatar = doctors.filter((doctor) => String(doctor?.avatarUrl || '').trim()).length;
  const totalUpcomingAppointments = doctors.reduce((count, doctor) => {
    return count + Math.max(0, Math.trunc(Number(doctor?.appointmentStats?.upcomingAppointments || 0)));
  }, 0);
  const recentlyAdded = doctors.filter((doctor) => {
    const parsedDate = doctor?.createdAt ? new Date(doctor.createdAt) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) return false;
    return parsedDate.getTime() >= Date.now() - (7 * 24 * 60 * 60 * 1000);
  }).length;

  const closeModal = () => {
    if (isSubmitting) return;
    setIsRegisterModalOpen(false);
    setFormData({
      fullName: '',
      specialization: '',
      avatar: null
    });
  };

  const handleRegisterDoctor = async (event) => {
    event.preventDefault();

    if (!String(formData.fullName || '').trim()) {
      toast.error('Doctor name is required');
      return;
    }

    if (!String(formData.specialization || '').trim()) {
      toast.error('Doctor specialization is required');
      return;
    }

    if (!formData.avatar) {
      toast.error('Doctor avatar is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const clinicToken = localStorage.getItem('clinicToken');

      if (!clinicToken) {
        throw new Error('Please login again to continue');
      }

      const payload = new FormData();
      payload.append('fullName', String(formData.fullName || '').trim());
      payload.append('specialization', String(formData.specialization || '').trim());
      payload.append('avatar', formData.avatar);

      const response = await registerClinicDoctor(clinicToken, payload);

      if (response?.doctor) {
        setDoctors((previousDoctors) => [response.doctor, ...previousDoctors]);
      }

      toast.success(response?.message || 'Doctor registered successfully');
      closeModal();
    } catch (error) {
      toast.error(error?.message || 'Could not register doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 group focus-within:ring-2 focus-within:ring-[#1EBDB8]/20 transition-all w-full md:w-[420px]">
          <svg className="text-gray-400 group-focus-within:text-[#1EBDB8] transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Search by doctor name or specialization..."
            className="ml-3 text-[15px] font-medium text-[#1F2432] bg-transparent outline-none border-none placeholder:text-gray-400 w-full"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-8 py-4 rounded-[24px] font-bold shadow-lg shadow-[#1EBDB8]/20 transition-all active:scale-95 group"
        >
          <svg className="group-hover:rotate-90 transition-transform duration-300" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Register New Doctor
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {isLoading ? (
          <div className="px-6 py-14 text-center">
            <div className="w-8 h-8 border-[3px] border-[#1EBDB8]/20 border-t-[#1EBDB8] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[14px] font-medium text-slate-500">Loading clinic doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-[15px] font-semibold text-slate-700">No doctors found</p>
            <p className="text-[13px] text-slate-400 mt-1">Register your first doctor to start building your clinic staff.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Doctor Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Specialization</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Upcoming</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Next Appointment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50/40 transition-colors group/row">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                          {doctor.avatarUrl ? (
                            <img
                              src={doctor.avatarUrl}
                              alt={doctor.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-[#1EBDB8] uppercase">
                              {String(doctor.fullName || '').trim().charAt(0) || 'D'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-[15px] font-medium text-slate-800 group-hover/row:text-[#1EBDB8] transition-colors">
                            {doctor.fullName}
                          </p>
                          <p className="text-[11px] text-gray-400">ID: #{String(doctor.id || '').slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[12px] font-medium rounded-md border border-slate-100">
                        {doctor.specialization || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                        {Math.max(0, Math.trunc(Number(doctor?.appointmentStats?.upcomingAppointments || 0)))} upcoming
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[13px] font-medium text-slate-500">{formatNextAppointment(doctor?.appointmentStats?.nextAppointment)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Doctors', val: String(totalDoctors) },
          { label: 'Upcoming Appointments', val: String(totalUpcomingAppointments) },
          { label: 'Specialties', val: String(uniqueSpecialties) },
          { label: 'With Avatar', val: String(doctorsWithAvatar) },
          { label: 'Added This Week', val: String(recentlyAdded) }
        ].map((item) => (
          <div key={item.label} className="bg-white p-5 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-2xl font-semibold text-slate-800">{item.val}</p>
          </div>
        ))}
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1F2432]/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl p-7">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-[22px] font-bold text-[#1F2432]">Register New Doctor</h3>
                <p className="text-[13px] text-[#6B7280] mt-1">Add doctor name, specialization, and profile avatar.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleRegisterDoctor} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[13.5px] font-bold text-[#6B7280]">Doctor Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(event) => {
                    setFormData((previousData) => ({ ...previousData, fullName: event.target.value }));
                  }}
                  placeholder="e.g., Dr. Sarah Wilson"
                  disabled={isSubmitting}
                  className="bg-[#F8FAFC] rounded-[12px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/30 transition-all border border-gray-200 focus:border-[#1EBDB8]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13.5px] font-bold text-[#6B7280]">Specialization</label>
                <select
                  value={formData.specialization}
                  onChange={(event) => {
                    setFormData((previousData) => ({ ...previousData, specialization: event.target.value }));
                  }}
                  disabled={isSubmitting}
                  className="bg-[#F8FAFC] rounded-[12px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#1EBDB8]/30 transition-all border border-gray-200 focus:border-[#1EBDB8]"
                >
                  <option value="">Select specialization</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13.5px] font-bold text-[#6B7280]">Avatar (JPG, PNG, WEBP)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] || null;
                    setFormData((previousData) => ({ ...previousData, avatar: selectedFile }));
                  }}
                  className="bg-[#F8FAFC] rounded-[12px] px-4 py-3 text-[#4B5563] text-[13px] font-medium outline-none border border-gray-200 file:mr-3 file:border-0 file:bg-[#1EBDB8]/10 file:text-[#0F766E] file:px-3 file:py-1.5 file:rounded-lg file:font-semibold"
                />
                <p className="text-[11px] text-slate-400">
                  {formData.avatar ? `Selected: ${formData.avatar.name}` : 'Choose a clear profile image for the doctor.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#1EBDB8] hover:bg-[#1CAAAE] transition-colors shadow-lg shadow-[#1EBDB8]/20 disabled:opacity-60"
                >
                  {isSubmitting ? 'Registering...' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
