import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  createClinicService,
  createClinicServiceAvailability,
  deleteClinicDoctor,
  deleteClinicService,
  fetchClinicDoctors,
  fetchClinicServices,
  registerClinicDoctor,
  updateClinicDoctor
} from '../../services/authApi';
import { getClinicSessionProfile } from '../../utils/authSession';

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
  const clinicProfile = useMemo(() => getClinicSessionProfile(), []);
  const currentPlan = String(clinicProfile?.currentPlan || 'platinum').toLowerCase();
  const canManageServices = currentPlan === 'gold' || currentPlan === 'diamond';
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceTypeToCreate, setServiceTypeToCreate] = useState('lab');
  const [serviceForm, setServiceForm] = useState({ name: '', date: '', fromTime: '', toTime: '', priceInRupees: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    specialization: '',
    avatar: null
  });

  useEffect(() => {
    const loadClinicDoctors = async () => {
      try {
        setIsLoading(true);
        const clinicToken = localStorage.getItem('clinicToken');
        const [doctorResponse, serviceResponse] = await Promise.all([
          fetchClinicDoctors(clinicToken),
          fetchClinicServices(clinicToken).catch(() => ({ services: [] }))
        ]);
        setDoctors(Array.isArray(doctorResponse?.doctors) ? doctorResponse.doctors : []);
        setServices(Array.isArray(serviceResponse?.services) ? serviceResponse.services : []);
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

  const closeModal = () => {
    if (isSubmitting) return;
    setIsRegisterModalOpen(false);
    setFormData({
      id: '',
      fullName: '',
      specialization: '',
      avatar: null
    });
  };

  const resetServiceForm = () => {
    setServiceForm({ name: '', date: '', fromTime: '', toTime: '', priceInRupees: '' });
  };

  const openServiceModal = (serviceType) => {
    if (!canManageServices) {
      toast.info(`Upgrade to Gold or Diamond plan to use ${serviceType === 'facility' ? 'Facilities' : 'Labs'}.`);
      return;
    }
    setServiceTypeToCreate(serviceType);
    resetServiceForm();
    setIsServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    if (isSubmitting) return;
    setIsServiceModalOpen(false);
    resetServiceForm();
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

    try {
      setIsSubmitting(true);
      const clinicToken = localStorage.getItem('clinicToken');

      if (!clinicToken) {
        throw new Error('Please login again to continue');
      }

      const payload = new FormData();
      payload.append('fullName', String(formData.fullName || '').trim());
      payload.append('specialization', String(formData.specialization || '').trim());
      if (formData.avatar) payload.append('avatar', formData.avatar);

      let response;
      if (formData.id) {
        response = await updateClinicDoctor(clinicToken, formData.id, payload);
      } else {
        if (!formData.avatar) {
          toast.error('Doctor avatar is required');
          return;
        }
        response = await registerClinicDoctor(clinicToken, payload);
      }

      if (response?.doctor) {
        setDoctors((previousDoctors) => (
          formData.id
            ? previousDoctors.map((doctor) => (String(doctor.id) === String(formData.id) ? { ...doctor, ...response.doctor } : doctor))
            : [response.doctor, ...previousDoctors]
        ));
      }

      toast.success(response?.message || (formData.id ? 'Doctor updated successfully' : 'Doctor registered successfully'));
      closeModal();
    } catch (error) {
      toast.error(error?.message || 'Could not register doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDoctor = (doctor) => {
    setFormData({
      id: doctor.id,
      fullName: String(doctor.fullName || ''),
      specialization: String(doctor.specialization || ''),
      avatar: null
    });
    setIsRegisterModalOpen(true);
  };

  const handleDeleteDoctor = async (doctor) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${doctor.fullName}?`);
    if (!confirmed) return;

    try {
      const clinicToken = localStorage.getItem('clinicToken');
      await deleteClinicDoctor(clinicToken, doctor.id);
      setDoctors((previousDoctors) => previousDoctors.filter((item) => String(item.id) !== String(doctor.id)));
      toast.success('Doctor deleted successfully');
    } catch (error) {
      toast.error(error?.message || 'Could not delete doctor');
    }
  };

  const handleCreateService = async (event) => {
    event.preventDefault();
    if (!canManageServices) {
      toast.info('Upgrade to Gold or Diamond plan to add Labs and Facilities.');
      return;
    }

    const name = String(serviceForm.name || '').trim();
    const date = String(serviceForm.date || '').trim();
    const fromTime = String(serviceForm.fromTime || '').trim();
    const toTime = String(serviceForm.toTime || '').trim();
    const priceInRupees = Math.max(0, Math.trunc(Number(serviceForm.priceInRupees || 0)));

    if (!name || !date || !fromTime || !toTime || priceInRupees <= 0) {
      toast.error('Service name, slot date/time and price are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const clinicToken = localStorage.getItem('clinicToken');
      if (!clinicToken) throw new Error('Please login again to continue');

      const createResponse = await createClinicService(clinicToken, {
        name,
        serviceType: serviceTypeToCreate
      });
      const createdService = createResponse?.service;
      if (!createdService?.id) throw new Error('Service could not be created');

      const slotResponse = await createClinicServiceAvailability(clinicToken, createdService.id, {
        date,
        fromTime,
        toTime,
        priceInRupees
      });

      const serviceWithSlot = {
        ...createdService,
        slots: Array.isArray(slotResponse?.slots) ? slotResponse.slots : (createdService?.slots || [])
      };
      setServices((prev) => [serviceWithSlot, ...prev]);
      toast.success(`${serviceTypeToCreate === 'facility' ? 'Facility' : 'Lab'} added successfully`);
      closeServiceModal();
    } catch (error) {
      toast.error(error?.message || 'Could not create service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (service) => {
    const name = String(service?.name || 'this service');
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const clinicToken = localStorage.getItem('clinicToken');
      await deleteClinicService(clinicToken, service.id);
      setServices((prev) => prev.filter((item) => String(item.id) !== String(service.id)));
      toast.success('Service deleted successfully');
    } catch (error) {
      toast.error(error?.message || 'Could not delete service');
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

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openServiceModal('lab')}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-[18px] font-bold transition-all ${
              canManageServices
                ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white shadow-lg shadow-[#1EBDB8]/20'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title={canManageServices ? 'Add Labs' : 'Available on Gold and Diamond plans'}
          >
            Add Labs
          </button>
          <button
            type="button"
            onClick={() => openServiceModal('facility')}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-[18px] font-bold transition-all ${
              canManageServices
                ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white shadow-lg shadow-[#1EBDB8]/20'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title={canManageServices ? 'Add Facilities' : 'Available on Gold and Diamond plans'}
          >
            Add Facilities
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-8 py-4 rounded-[24px] font-bold shadow-lg shadow-[#1EBDB8]/20 transition-all active:scale-95 group"
          >
            <svg className="group-hover:rotate-90 transition-transform duration-300" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Register New Doctor
          </button>
        </div>
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Actions</th>
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
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleEditDoctor(doctor)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">Edit</button>
                        <button type="button" onClick={() => handleDeleteDoctor(doctor)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-bold text-[#1F2432]">Labs & Facilities</h3>
            <p className="text-[13px] text-slate-500 mt-1">These services are visible on clinic profile for patient bookings.</p>
          </div>
          {!canManageServices && (
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full">
              Gold / Diamond only
            </span>
          )}
        </div>

        {services.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-[15px] font-semibold text-slate-700">No labs or facilities added</p>
            <p className="text-[13px] text-slate-400 mt-1">Use Add Labs or Add Facilities to create bookable services.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Service</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Available Slots</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-[15px] font-semibold text-slate-800">{service.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-md text-[12px] font-bold bg-slate-50 border border-slate-100 text-slate-700 capitalize">
                        {service.serviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-semibold text-slate-700">{Array.isArray(service.slots) ? service.slots.length : 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteService(service)}
                        disabled={!canManageServices}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          canManageServices ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1F2432]/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl p-7">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-[22px] font-bold text-[#1F2432]">{formData.id ? 'Edit Doctor' : 'Register New Doctor'}</h3>
                <p className="text-[13px] text-[#6B7280] mt-1">{formData.id ? 'Update doctor details and optionally replace avatar.' : 'Add doctor name, specialization, and profile avatar.'}</p>
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
                  {isSubmitting ? (formData.id ? 'Updating...' : 'Registering...') : (formData.id ? 'Update Doctor' : 'Register Doctor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isServiceModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1F2432]/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl p-7">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-[22px] font-bold text-[#1F2432]">Add {serviceTypeToCreate === 'facility' ? 'Facility' : 'Lab'}</h3>
                <p className="text-[13px] text-[#6B7280] mt-1">Create a bookable clinic service with its first slot.</p>
              </div>
              <button type="button" onClick={closeServiceModal} disabled={isSubmitting} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <input
                type="text"
                placeholder={`${serviceTypeToCreate === 'facility' ? 'Facility' : 'Lab'} name`}
                value={serviceForm.name}
                onChange={(event) => setServiceForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full bg-[#F8FAFC] rounded-[12px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none border border-gray-200"
                required
              />
              <div className="grid grid-cols-3 gap-3">
                <input type="date" value={serviceForm.date} onChange={(event) => setServiceForm((prev) => ({ ...prev, date: event.target.value }))} className="bg-[#F8FAFC] rounded-[12px] px-3 py-3 text-[13px] text-[#1F2432] border border-gray-200 [color-scheme:light]" required />
                <input type="time" value={serviceForm.fromTime} onChange={(event) => setServiceForm((prev) => ({ ...prev, fromTime: event.target.value }))} className="bg-[#F8FAFC] rounded-[12px] px-3 py-3 text-[13px] text-[#1F2432] border border-gray-200 [color-scheme:light]" required />
                <input type="time" value={serviceForm.toTime} onChange={(event) => setServiceForm((prev) => ({ ...prev, toTime: event.target.value }))} className="bg-[#F8FAFC] rounded-[12px] px-3 py-3 text-[13px] text-[#1F2432] border border-gray-200 [color-scheme:light]" required />
              </div>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Service fee (Rs.)"
                value={serviceForm.priceInRupees}
                onChange={(event) => setServiceForm((prev) => ({ ...prev, priceInRupees: event.target.value }))}
                className="w-full bg-[#F8FAFC] rounded-[12px] px-4 py-3.5 text-[#1F2432] placeholder:text-[#9CA3AF] text-[14px] border border-gray-200"
                required
              />
              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={closeServiceModal} disabled={isSubmitting} className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-[#6B7280] bg-[#F3F4F6]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60">
                  {isSubmitting ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
