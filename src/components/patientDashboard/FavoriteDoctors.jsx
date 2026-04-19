import React, { useMemo } from 'react';
import DoctorCard from './shared/DoctorCard';

export default function FavoriteDoctors({
  title = 'Favorite Doctors',
  showViewAll = true,
  onViewAll,
  isGridView = false,
  doctors = [],
  favoriteDoctorIds = [],
  favoriteActionDoctorIds = [],
  onToggleFavoriteDoctor,
  onScheduleDoctor,
  onOrderFromStore,
  isLoading = false
}) {
  const availableDoctors = Array.isArray(doctors) ? doctors : [];
  const doctorsToDisplay = isGridView
    ? availableDoctors
    : availableDoctors.slice(0, 3);
  const favoriteDoctorIdSet = useMemo(() => {
    return new Set((Array.isArray(favoriteDoctorIds) ? favoriteDoctorIds : []).map((doctorId) => String(doctorId)));
  }, [favoriteDoctorIds]);
  const pendingFavoriteDoctorIdSet = useMemo(() => {
    return new Set((Array.isArray(favoriteActionDoctorIds) ? favoriteActionDoctorIds : []).map((doctorId) => String(doctorId)));
  }, [favoriteActionDoctorIds]);
  const listClassName = isGridView
    ? 'grid grid-cols-1 xl:grid-cols-3 gap-6'
    : 'flex gap-4 md:gap-6 overflow-x-auto pb-4 px-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]';
  const cardClassName = isGridView
    ? 'bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative'
    : 'min-w-[85%] sm:min-w-[360px] max-w-[360px] snap-start bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative';

  return (
    <div className="flex flex-col pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#1EBDB8] font-bold text-[24px]">{title}</h2>
        {showViewAll ? (
          <button
            type="button"
            onClick={() => onViewAll?.()}
            className="text-[#1EBDB8] font-bold text-[14px] hover:underline underline-offset-4"
          >
            View all
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center">
          <p className="text-[16px] font-bold text-[#4B5563]">Loading favorite doctors...</p>
        </div>
      ) : doctorsToDisplay.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center">
          <p className="text-[16px] font-bold text-[#4B5563]">No favorite doctors yet</p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">Search doctors and tap the heart icon to add favorites.</p>
        </div>
      ) : (
        <div className={listClassName}>
          {doctorsToDisplay.map((doc) => (
            <DoctorCard
              key={`${doc.type}-${doc.id}`}
              doctor={doc}
              showFavorite
              isFavorite={favoriteDoctorIdSet.has(String(doc.id))}
              isFavoritePending={pendingFavoriteDoctorIdSet.has(String(doc.id))}
              onFavoriteToggle={onToggleFavoriteDoctor}
              actionLabel={doc.type === 'doctor' ? 'Schedule Appointment' : 'Order Medicine'}
              onActionClick={
                doc.type === 'doctor'
                  ? () => onScheduleDoctor?.(doc)
                  : () => onOrderFromStore?.(doc)
              }
              containerClassName={cardClassName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
