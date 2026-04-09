import React, { useEffect, useState } from 'react';

const normalizeText = (value, maxLength = 300) => {
  return String(value || '').trim().slice(0, maxLength);
};

export default function ReportBugModal({
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit
}) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSubject('');
    setDescription('');
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedSubject = normalizeText(subject, 180);
    const normalizedDescription = normalizeText(description, 3000);

    if (!normalizedSubject) {
      return;
    }

    if (normalizedDescription.length < 10) {
      return;
    }

    await onSubmit?.({
      subject: normalizedSubject,
      description: normalizedDescription
    });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center px-4">
      <div className="w-full max-w-[680px] rounded-[28px] border border-gray-100 bg-white shadow-[0_25px_65px_rgba(15,23,42,0.2)] overflow-hidden">
        <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-bold text-[#1F2937]">Report a Bug</h2>
            <p className="text-[13px] font-medium text-[#6B7280] mt-1">Tell us what went wrong so admin can fix it quickly.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
            aria-label="Close bug report modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-5">
          <div>
            <label htmlFor="bug-report-subject" className="block text-[13px] font-bold text-[#4B5563] mb-2">
              Bug Title
            </label>
            <input
              id="bug-report-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Example: Unable to submit appointment form"
              maxLength={180}
              className="w-full rounded-xl border border-gray-200 bg-[#FCFCFD] px-4 py-3 text-[14px] font-medium text-[#1F2937] outline-none focus:ring-2 focus:ring-[#1EBDB8]/25 focus:border-[#1EBDB8]"
              required
            />
          </div>

          <div>
            <label htmlFor="bug-report-description" className="block text-[13px] font-bold text-[#4B5563] mb-2">
              Bug Details
            </label>
            <textarea
              id="bug-report-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Please explain what happened and the steps to reproduce the issue."
              rows={5}
              maxLength={3000}
              className="w-full rounded-xl border border-gray-200 bg-[#FCFCFD] px-4 py-3 text-[14px] font-medium text-[#1F2937] outline-none focus:ring-2 focus:ring-[#1EBDB8]/25 focus:border-[#1EBDB8] resize-y min-h-[130px]"
              required
            />
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-[#9CA3AF] font-medium">
              <span>Minimum 10 characters required</span>
              <span>{description.length}/3000</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-[13px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || normalizeText(subject, 180).length === 0 || normalizeText(description, 3000).length < 10}
              className="px-5 py-2.5 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] text-[13px] font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
