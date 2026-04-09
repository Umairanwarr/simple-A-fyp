import React from 'react';

export default function AvailabilityForm({
  form,
  isEditing,
  isSubmitting,
  isBlocked,
  blockMessage,
  onChange,
  onSubmit,
  onCancelEdit
}) {
  const isDisabled = isSubmitting || isBlocked;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#1F2432]">
            {isEditing ? 'Edit Availability Slot' : 'Add Availability Slot'}
          </h2>
          <p className="text-[13.5px] text-[#9CA3AF] font-medium mt-1">
            Select date, start/end time, mode, and consultation fee in Rs.
          </p>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={isDisabled}
            className="px-3 py-2 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-gray-50"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-[13px] font-bold text-[#6B7280]">Date</span>
          <input
            type="date"
            value={form.date}
            disabled={isDisabled}
            onChange={(event) => onChange('date', event.target.value)}
            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#6B7280]">From</span>
          <input
            type="time"
            value={form.fromTime}
            disabled={isDisabled}
            onChange={(event) => onChange('fromTime', event.target.value)}
            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#6B7280]">To</span>
          <input
            type="time"
            value={form.toTime}
            disabled={isDisabled}
            onChange={(event) => onChange('toTime', event.target.value)}
            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#6B7280]">Consultation Mode</span>
          <select
            value={form.consultationMode}
            disabled={isDisabled}
            onChange={(event) => onChange('consultationMode', event.target.value)}
            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
            required
          >
            <option value="online">Online</option>
            <option value="offline">Offline (Clinic Visit)</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#6B7280]">Fee (Rs.)</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.priceInRupees}
            disabled={isDisabled}
            onChange={(event) => onChange('priceInRupees', event.target.value)}
            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
            required
          />
        </label>

        <div className="md:col-span-6 flex justify-end mt-1">
          <button
            type="submit"
            disabled={isDisabled}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-bold transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Slot' : 'Add Slot'}
          </button>
        </div>

        {isBlocked && (
          <p className="md:col-span-6 text-[12px] font-medium text-amber-700 mt-2">
            {blockMessage || 'Complete your profile first to manage availability slots.'}
          </p>
        )}
      </form>
    </div>
  );
}
