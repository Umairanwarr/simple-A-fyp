import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import DoctorCard from '../shared/DoctorCard';
import { exploreSpecialties, patientDoctorDirectory } from '../data/doctorDirectory';
import {
  fetchPatientExploreDoctors,
  fetchPatientExploreStores,
  fetchPatientExploreClinics,
  fetchPatientClinicDoctors,
  bookPatientClinicDoctorAppointment
} from '../../../services/authApi';

const normalize = (value) => String(value || '').trim().toLowerCase();
const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || '').trim());

export default function ExploreScreen({
  favoriteDoctorIds = [],
  favoriteActionDoctorIds = [],
  onToggleFavoriteDoctor,
  onScheduleDoctor,
  onOrderFromStore
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Clinic detail viewing states
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [isLoadingClinicDoctors, setIsLoadingClinicDoctors] = useState(false);
  const [selectedClinicDoctor, setSelectedClinicDoctor] = useState(null);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);

  const favoriteDoctorIdSet = useMemo(() => {
    return new Set((Array.isArray(favoriteDoctorIds) ? favoriteDoctorIds : []).map((doctorId) => String(doctorId)));
  }, [favoriteDoctorIds]);

  const favoriteActionDoctorIdSet = useMemo(() => {
    return new Set((Array.isArray(favoriteActionDoctorIds) ? favoriteActionDoctorIds : []).map((doctorId) => String(doctorId)));
  }, [favoriteActionDoctorIds]);

  const hasQuery = normalize(searchQuery).length > 0;
  const hasSpecialtyFilter = Boolean(selectedSpecialty);

  const fallbackDoctors = useMemo(() => {
    const query = normalize(searchQuery);
    const queryTokens = query.split(/\s+/).filter(Boolean);
    const shouldApplySpecialtyFilter = !query && hasSpecialtyFilter;

    return patientDoctorDirectory.filter((doctor) => {
      const matchesSpecialty = !shouldApplySpecialtyFilter
        || normalize(doctor.specialtyTag) === normalize(selectedSpecialty);

      if (!matchesSpecialty) {
        return false;
      }

      if (queryTokens.length === 0) {
        return true;
      }

      const searchableText = [
        doctor.name,
        doctor.specialty,
        doctor.specialtyTag,
        doctor.location
      ].join(' ').toLowerCase();

      return queryTokens.some((token) => searchableText.includes(token));
    }).map(d => ({ ...d, type: 'doctor' }));
  }, [searchQuery, selectedSpecialty, hasSpecialtyFilter]);

  useEffect(() => {
    let isMounted = true;
    const delayTimer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        // Fetch doctors, stores, and clinics in parallel
        const [doctorData, storeData, clinicData] = await Promise.all([
          fetchPatientExploreDoctors({
            query: searchQuery,
            specialty: hasQuery ? '' : selectedSpecialty
          }),
          fetchPatientExploreStores({
            query: searchQuery
          }),
          fetchPatientExploreClinics({
            query: searchQuery
          }).catch(() => ({ clinics: [] }))
        ]);

        if (isMounted) {
          const combined = [
            ...(Array.isArray(doctorData?.doctors) ? doctorData.doctors : []),
            ...(Array.isArray(storeData?.stores) ? storeData.stores : []),
            ...(Array.isArray(clinicData?.clinics) ? clinicData.clinics : [])
          ];
          setResults(combined);
        }
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error?.message || 'Could not load search results right now');
        setResults([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 220);

    return () => {
      isMounted = false;
      clearTimeout(delayTimer);
    };
  }, [searchQuery, selectedSpecialty, hasQuery]);

  const handleOpenClinic = async (clinic) => {
    if (!clinic?.id) return;
    try {
      setSelectedClinic(clinic);
      setClinicDoctors([]);
      setSelectedClinicDoctor(null);
      setIsLoadingClinicDoctors(true);

      const data = await fetchPatientClinicDoctors(clinic.id);
      setClinicDoctors(Array.isArray(data?.doctors) ? data.doctors : []);
      if (data?.doctors?.length > 0) {
        setSelectedClinicDoctor(data.doctors[0]);
      }
    } catch (err) {
      toast.error(err?.message || 'Could not load clinic doctors list');
    } finally {
      setIsLoadingClinicDoctors(false);
    }
  };

  const handleBookClinicDoctorSlot = async (slot) => {
    if (!selectedClinic || !selectedClinicDoctor || !slot) return;

    const patientToken = localStorage.getItem('patientToken');
    if (!patientToken) {
      toast.error('Please log in again to book an appointment');
      return;
    }

    try {
      setIsBookingAppointment(true);
      const response = await bookPatientClinicDoctorAppointment(patientToken, {
        clinicId: selectedClinic.id,
        doctorId: selectedClinicDoctor.id,
        slotId: slot._id || slot.id
      });

      toast.success(response?.message || 'Appointment booked successfully with clinic doctor');

      // Update slot local state
      const updatedSlots = (selectedClinicDoctor.slots || []).filter((s) => String(s._id || s.id) !== String(slot._id || slot.id));
      const updatedDoctor = { ...selectedClinicDoctor, slots: updatedSlots };
      setSelectedClinicDoctor(updatedDoctor);

      setClinicDoctors((prev) =>
        prev.map((doc) => (String(doc.id) === String(selectedClinicDoctor.id) ? updatedDoctor : doc))
      );

      // Trigger custom events if needed
      window.dispatchEvent(new Event('patient-appointment-updated'));
    } catch (err) {
      toast.error(err?.message || 'Could not book this appointment slot');
    } finally {
      setIsBookingAppointment(false);
    }
  };

  if (selectedClinic) {
    return (
      <div className="space-y-6 pb-24">
        {/* Navigation & Header */}
        <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSelectedClinic(null)}
              className="p-3 bg-[#F4F7FB] border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-[24px] font-extrabold text-[#1F2432] tracking-tight">{selectedClinic.name}</h1>
              <p className="text-[14px] font-medium text-[#6B7280] mt-1">
                Explore registered doctors and choose a timeslot to book a consultation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] bg-[#1EBDB8]/10 text-[#1EBDB8] border border-[#1EBDB8]/20 px-3 py-1.5 rounded-xl">
              Clinic Details
            </span>
          </div>
        </div>

        {/* Clinic & Doctors Content */}
        {isLoadingClinicDoctors ? (
          <div className="bg-white p-12 rounded-[30px] border border-gray-100 shadow-sm text-center">
            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#1EBDB8] rounded-full"></div>
            <p className="text-[14px] font-semibold text-[#6B7280] mt-3">Loading clinic doctors and schedules...</p>
          </div>
        ) : clinicDoctors.length === 0 ? (
          <div className="bg-white p-12 rounded-[30px] border border-gray-100 shadow-sm text-center">
            <svg className="mx-auto text-amber-500 mb-3" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[15px] font-bold text-[#6B7280]">No registered doctors found at this clinic.</p>
            <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">There are no clinic doctor schedules available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Doctors List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                <h3 className="text-[16px] font-bold text-[#1F2432] mb-3">Staff Doctors</h3>
                <div className="flex flex-col gap-3">
                  {clinicDoctors.map((doc) => {
                    const isSelected = selectedClinicDoctor?.id === doc.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedClinicDoctor(doc)}
                        className={`flex items-center justify-between gap-4 p-3.5 rounded-2xl border transition-all duration-300 ${
                          isSelected
                            ? 'bg-[#1EBDB8] border-[#1EBDB8] text-white shadow-lg translate-y-[-1px]'
                            : 'bg-white border-gray-100 text-[#1F2432] hover:border-[#1EBDB8]/30 hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-gray-200 flex items-center justify-center shrink-0">
                            {doc.image ? (
                              <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[15px] font-bold text-[#1EBDB8] uppercase">
                                {String(doc.name || 'D').charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="text-left min-w-0">
                            <p className={`text-[15px] font-bold tracking-tight truncate ${isSelected ? 'text-white' : 'text-[#1F2432]'}`}>
                              Dr. {doc.name}
                            </p>
                            <p className={`text-[12px] font-medium truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#6B7280]'}`}>
                              {doc.specialty} • {(doc.slots || []).length} active slots
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          <svg className={`transition-transform duration-200 ${isSelected ? 'text-white scale-110' : 'text-gray-400'}`} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Doctor's Slots */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm flex flex-col justify-between">
              {selectedClinicDoctor ? (
                <div>
                  <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-gray-200 flex items-center justify-center shrink-0">
                        {selectedClinicDoctor.image ? (
                          <img src={selectedClinicDoctor.image} alt={selectedClinicDoctor.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[16px] font-bold text-[#1EBDB8] uppercase">
                            {String(selectedClinicDoctor.name || 'D').charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[17px] font-bold text-[#1F2432]">Dr. {selectedClinicDoctor.name}</h4>
                        <p className="text-[12px] font-semibold text-[#1EBDB8] mt-0.5">{selectedClinicDoctor.specialty}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#1EBDB8] uppercase tracking-[0.1em] bg-[#1EBDB8]/10 px-2.5 py-1 rounded-lg">
                      {(selectedClinicDoctor.slots || []).length} active slots
                    </span>
                  </div>

                  {(selectedClinicDoctor.slots || []).length === 0 ? (
                    <div className="border border-dashed border-gray-200 bg-[#F8FAFC] rounded-2xl p-8 text-center flex flex-col items-center">
                      <svg className="text-[#6B7280]/30 mb-2.5" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p className="text-[14px] font-bold text-[#6B7280]">No availability slots set up</p>
                      <p className="text-[12.5px] text-[#9CA3AF] font-medium mt-1">There are no availability slots added for Dr. {selectedClinicDoctor.name} yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(selectedClinicDoctor.slots || []).map((slot) => {
                        const mode = String(slot.consultationMode || '').toLowerCase();
                        let modeBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                        if (mode === 'offline') modeBadge = 'bg-blue-50 text-blue-700 border border-blue-100';
                        else if (mode === 'video') modeBadge = 'bg-purple-50 text-purple-700 border border-purple-100';

                        return (
                          <div key={slot._id || slot.id} className="p-4 rounded-2xl border border-gray-100 bg-[#FAFAFB]/60 flex flex-col justify-between gap-4 hover:border-[#1EBDB8]/30 transition-all">
                            <div>
                              <p className="text-[13.5px] font-bold text-[#1F2432]">{slot.date}</p>
                              <p className="text-[12.5px] font-medium text-[#4B5563] mt-0.5">{slot.fromTime} - {slot.toTime}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${modeBadge}`}>
                                  {mode === 'offline' ? 'Clinic Visit' : mode === 'video' ? 'Video' : 'Online'}
                                </span>
                                <span className="text-[12.5px] font-bold text-[#111827]">
                                  Rs. {slot.priceInRupees || 0}
                                </span>
                              </div>
                              {mode === 'offline' && slot.offlineAddress && (
                                <p className="text-[11px] text-[#6B7280] mt-1 leading-tight">{slot.offlineAddress}</p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleBookClinicDoctorSlot(slot)}
                              disabled={isBookingAppointment}
                              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white text-[12.5px] font-bold hover:shadow-lg disabled:opacity-60 transition-all duration-200"
                            >
                              {isBookingAppointment ? 'Booking...' : 'Book Timeslot'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-12">
                  <p className="text-[#6B7280]">Select a staff doctor to see their schedules.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const shouldShowSearchResults = hasQuery || hasSpecialtyFilter;
  const effectiveResults = results.length > 0 ? results : fallbackDoctors;

  const resultsToDisplay = shouldShowSearchResults
    ? effectiveResults
    : effectiveResults.slice(0, 3);

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col gap-6">
        <div className="bg-[#1F2432] rounded-full pl-5 pr-2 py-2.5 flex items-center gap-3 shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search disease, specialists, clinics, or medical stores"
            className="flex-1 bg-transparent text-white placeholder:text-white/60 text-[15px] outline-none"
          />

          <div className="hidden md:flex items-center gap-2 text-white/85 text-[14px] font-semibold border-l border-white/25 pl-4 pr-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Mountain View, CA</span>
          </div>

          <button
            type="button"
            className="w-14 h-14 rounded-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white flex items-center justify-center transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      {!hasQuery && (
        <section className="space-y-5">
          <h2 className="text-[#1EBDB8] font-bold text-[24px]">Explore Treatments across specialties</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {exploreSpecialties.map((specialty) => {
              const isSelected = selectedSpecialty === specialty.id;

              return (
                <button
                  key={specialty.id}
                  type="button"
                  onClick={() => setSelectedSpecialty((prev) => (prev === specialty.id ? '' : specialty.id))}
                  className={`bg-white rounded-[24px] border p-4 h-[132px] shadow-[0px_4px_12px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center gap-3 transition-all ${
                    isSelected
                      ? 'border-[#1EBDB8] ring-2 ring-[#1EBDB8]/25 text-[#1EBDB8]'
                      : 'border-gray-100 text-[#1EBDB8] hover:border-[#1EBDB8]/40'
                  }`}
                >
                  <div className="w-11 h-11 flex items-center justify-center">
                    <img src={specialty.icon} alt={specialty.label} className="w-10 h-10 object-contain" />
                  </div>
                  <span className="text-[13px] font-bold text-center leading-tight text-[#1EBDB8]">
                    {specialty.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-5">
        <h2 className="text-[#1EBDB8] font-bold text-[24px]">
          {shouldShowSearchResults ? 'Search Results' : 'Sponsored'}
        </h2>

        {loadError && (
          <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4">
            <p className="text-[13px] font-medium text-amber-700">{loadError}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center">
            <p className="text-[16px] font-bold text-[#4B5563]">Searching...</p>
          </div>
        ) : resultsToDisplay.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center">
            <p className="text-[16px] font-bold text-[#4B5563]">No results found</p>
            <p className="text-[13px] text-[#9CA3AF] mt-1">Try another search term or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {resultsToDisplay.map((item) => (
              <DoctorCard
                key={`${item.type}-${item.id}`}
                doctor={item}
                showFavorite={shouldShowSearchResults && Boolean(onToggleFavoriteDoctor) && isValidObjectId(item.id)}
                isFavorite={favoriteDoctorIdSet.has(String(item.id))}
                isFavoritePending={favoriteActionDoctorIdSet.has(String(item.id))}
                onFavoriteToggle={onToggleFavoriteDoctor}
                actionLabel={item.type === 'clinic' ? 'View Clinic' : item.type === 'doctor' ? 'Schedule Appointment' : 'Order Medicine'}
                onActionClick={
                  item.type === 'clinic'
                    ? () => handleOpenClinic(item)
                    : item.type === 'doctor'
                    ? (isValidObjectId(item.id) ? onScheduleDoctor : undefined) 
                    : (isValidObjectId(item.id) ? () => onOrderFromStore?.(item) : undefined)
                }
                containerClassName="bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
