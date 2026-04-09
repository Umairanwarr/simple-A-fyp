import React, { useEffect, useMemo, useState } from 'react';
import DoctorCard from '../shared/DoctorCard';
import { exploreSpecialties, patientDoctorDirectory } from '../data/doctorDirectory';
import { fetchPatientExploreDoctors } from '../../../services/authApi';

const normalize = (value) => String(value || '').trim().toLowerCase();
const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || '').trim());

export default function ExploreScreen({
  favoriteDoctorIds = [],
  favoriteActionDoctorIds = [],
  onToggleFavoriteDoctor,
  onScheduleDoctor
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [remoteDoctors, setRemoteDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [doctorLoadError, setDoctorLoadError] = useState('');
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
    });
  }, [searchQuery, selectedSpecialty, hasSpecialtyFilter]);

  useEffect(() => {
    let isMounted = true;
    const delayTimer = setTimeout(async () => {
      try {
        setIsLoadingDoctors(true);
        setDoctorLoadError('');

        const data = await fetchPatientExploreDoctors({
          query: searchQuery,
          specialty: hasQuery ? '' : selectedSpecialty
        });

        if (!isMounted) {
          return;
        }

        setRemoteDoctors(Array.isArray(data?.doctors) ? data.doctors : []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDoctorLoadError(error?.message || 'Could not load doctors right now');
        setRemoteDoctors([]);
      } finally {
        if (isMounted) {
          setIsLoadingDoctors(false);
        }
      }
    }, 220);

    return () => {
      isMounted = false;
      clearTimeout(delayTimer);
    };
  }, [searchQuery, selectedSpecialty, hasQuery]);

  const shouldShowSearchResults = hasQuery || hasSpecialtyFilter;
  const effectiveDoctors = remoteDoctors.length > 0 ? remoteDoctors : fallbackDoctors;
  const doctorsToDisplay = shouldShowSearchResults
    ? effectiveDoctors
    : effectiveDoctors.slice(0, 3);

  return (
    <div className="space-y-8 pb-24">
      <div className="bg-[#1F2432] rounded-full pl-5 pr-2 py-2.5 flex items-center gap-3 shadow-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search disease, hospitals"
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
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
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

        {doctorLoadError && (
          <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4">
            <p className="text-[13px] font-medium text-amber-700">{doctorLoadError}</p>
          </div>
        )}

        {isLoadingDoctors ? (
          <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center">
            <p className="text-[16px] font-bold text-[#4B5563]">Searching doctors...</p>
          </div>
        ) : doctorsToDisplay.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center">
            <p className="text-[16px] font-bold text-[#4B5563]">No doctors found</p>
            <p className="text-[13px] text-[#9CA3AF] mt-1">Try another search term or specialty filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {doctorsToDisplay.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                showFavorite={shouldShowSearchResults && Boolean(onToggleFavoriteDoctor) && isValidObjectId(doctor.id)}
                isFavorite={favoriteDoctorIdSet.has(String(doctor.id))}
                isFavoritePending={favoriteActionDoctorIdSet.has(String(doctor.id))}
                onFavoriteToggle={onToggleFavoriteDoctor}
                onActionClick={isValidObjectId(doctor.id) ? onScheduleDoctor : undefined}
                containerClassName="bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative min-h-[355px]"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
