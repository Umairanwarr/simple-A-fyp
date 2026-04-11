import React from 'react';

const formatReadableDate = (rawDate) => {
  if (!rawDate) {
    return '';
  }

  return new Date(rawDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

const formatModeLabel = (mode) => {
  return String(mode || '').toLowerCase() === 'offline' ? 'Offline (Clinic Visit)' : 'Online';
};

const getModeBadgeClassName = (mode) => {
  return String(mode || '').toLowerCase() === 'offline'
    ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
    : 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]';
};

const formatFeeInRupees = (value) => {
  const parsedFee = Number(value);

  if (!Number.isFinite(parsedFee)) {
    return 'Rs. 0';
  }

  return `Rs. ${Math.max(0, Math.trunc(parsedFee))}`;
};

export default function AvailabilityList({
  slots,
  onEdit,
  onDelete,
  isActionsDisabled,
  disabledHint
}) {
  return (
    <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-bold text-[#1F2432]">Saved Availability Slots</h3>
        <span className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.12em]">
          {slots.length} Total
        </span>
      </div>

      {isActionsDisabled && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[12px] font-medium text-amber-700">
            {disabledHint || 'Complete your profile first to manage availability slots.'}
          </p>
        </div>
      )}

      {slots.length === 0 ? (
        <div className="border border-dashed border-gray-200 bg-[#F8FAFC] rounded-2xl p-8 text-center">
          <p className="text-[14px] font-bold text-[#6B7280]">No availability slots added yet</p>
          <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
            Add your first date and time range using the form above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[940px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Date</th>
                <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">From</th>
                <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">To</th>
                <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Mode</th>
                <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Offline Address</th>
                <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Fee</th>
                <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className="border-b border-gray-50 hover:bg-[#F8FAFC]/60 transition-colors">
                  <td className="px-3 py-4 text-[14px] font-bold text-[#1F2432]">{formatReadableDate(slot.date)}</td>
                  <td className="px-3 py-4 text-[14px] font-medium text-[#4B5563]">{slot.fromTime}</td>
                  <td className="px-3 py-4 text-[14px] font-medium text-[#4B5563]">{slot.toTime}</td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${getModeBadgeClassName(slot.consultationMode)}`}>
                      {formatModeLabel(slot.consultationMode)}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-[13px] font-medium text-[#4B5563] max-w-[280px] truncate" title={slot.offlineAddress || ''}>
                    {slot.consultationMode === 'offline'
                      ? (slot.offlineAddress || 'Not set')
                      : '-'}
                  </td>
                  <td className="px-3 py-4 text-[14px] font-semibold text-[#1F2432]">{formatFeeInRupees(slot.priceInRupees)}</td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(slot)}
                        disabled={isActionsDisabled}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(slot)}
                        disabled={isActionsDisabled}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
