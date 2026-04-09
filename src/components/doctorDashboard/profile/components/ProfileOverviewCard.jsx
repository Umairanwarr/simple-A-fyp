import React from 'react';

export default function ProfileOverviewCard({
  avatarUrl,
  fullName,
  email,
  isProfileComplete,
  missingFieldNames,
  onAvatarUploadClick,
  isAvatarSaving
}) {
  return (
    <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 sm:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-[86px] h-[86px] rounded-full border-4 border-white overflow-hidden bg-[#E5F8F6] shadow-sm shrink-0">
              <img src={avatarUrl} alt={fullName || 'Doctor'} className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-[20px] font-bold text-[#1F2432]">{fullName || 'Doctor'}</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${
                    isProfileComplete
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  <span>●</span>
                  {isProfileComplete ? 'Profile complete' : 'Profile incomplete'}
                </span>
              </div>
              <p className="text-[13px] text-[#6B7280] font-medium mt-1">{email || 'Doctor Account'}</p>
              {!isProfileComplete && (
                <p className="text-[12px] text-rose-600 font-medium mt-1">
                  Missing: {missingFieldNames}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onAvatarUploadClick}
            disabled={isAvatarSaving}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-bold w-full sm:w-auto"
          >
            {isAvatarSaving ? 'Uploading...' : 'Update Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}
