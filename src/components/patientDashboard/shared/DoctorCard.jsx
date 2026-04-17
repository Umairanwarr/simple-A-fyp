import React from 'react';

export default function DoctorCard({
  doctor,
  showFavorite = true,
  isFavorite = false,
  isFavoritePending = false,
  onFavoriteToggle,
  containerClassName = '',
  actionLabel = 'Schedule Appointment',
  onActionClick
}) {
  const cardClassName = containerClassName
    || 'bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative';

  const isStore = doctor.type === 'store';
  
  // Logic to check if store is open
  const isStoreOpen = React.useMemo(() => {
    if (!isStore || !doctor.availability) return true;

    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startStr, endStr] = doctor.availability.split('-').map(s => s.trim());
      
      const parseTimeToMinutes = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        return hours * 60 + minutes;
      };

      const startMinutes = parseTimeToMinutes(startStr);
      const endMinutes = parseTimeToMinutes(endStr);

      if (startMinutes < endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      } else {
        // Overnight range (e.g., 10 PM - 2 AM)
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }
    } catch (e) {
      console.error('Error parsing operating hours:', e);
      return true; // Default to open if parsing fails
    }
  }, [isStore, doctor.availability]);

  const effectiveActionLabel = isStore && !isStoreOpen ? 'Store Closed' : actionLabel;
  const isActionDisabled = typeof onActionClick !== 'function' || (isStore && !isStoreOpen);

  return (
    <div className={cardClassName}>
      {showFavorite && (
        <button
          type="button"
          onClick={() => onFavoriteToggle?.(doctor)}
          disabled={isFavoritePending}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-6 right-6 transition-transform ${
            isFavorite
              ? 'text-red-500 hover:scale-110'
              : 'text-[#9CA3AF] hover:text-red-500 hover:scale-110'
          } ${isFavoritePending ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className="w-[88px] h-[88px] rounded-full overflow-hidden border-2 border-[#E5E7EB] bg-[#F9FAFB] shrink-0">
          <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col pr-6 pt-0.5">
          <h3 className="text-[#1EBDB8] font-bold text-[17px]">{doctor.name}</h3>
          <p className="text-[#1F2937] font-semibold text-[13px] mt-0.5">{doctor.specialty}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span className="text-[#6B7280] font-bold text-[11px]">
              {doctor.rating}
              <span className="font-medium text-[#9CA3AF]"> . {doctor.reviews}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-2 text-[#6B7280]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="text-[12px] font-medium">{doctor.location}</span>
        </div>
        <div className="flex gap-2 text-[11px]">
          <span className="font-bold text-[#1F2937]">
            {doctor.type === 'store' ? 'Operating Hours' : 'Next Available'}
          </span>
          <span className="font-bold text-[#1F2937]">{doctor.availability}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={isActionDisabled}
        onClick={() => onActionClick?.(doctor)}
        className={`w-full py-3.5 rounded-[10px] font-bold text-[14px] transition-colors mt-auto shadow-sm ${
          isStore && !isStoreOpen 
            ? 'bg-gray-400 cursor-not-allowed text-white' 
            : 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white'
        }`}
      >
        {effectiveActionLabel}
      </button>
    </div>
  );
}
