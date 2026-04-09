import React from 'react';

export default function ReportBugButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-8 right-10 w-[72px] h-[72px] bg-[#1EBDB8] hover:bg-[#1CAAAE] rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 z-50"
      aria-label="Report a bug"
      title="Report a bug"
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="20" y1="8" x2="17" y2="8"></line>
        <line x1="7" y1="8" x2="4" y2="8"></line>
        <line x1="20" y1="16" x2="17" y2="16"></line>
        <line x1="7" y1="16" x2="4" y2="16"></line>
        <path d="M14 4h-4"></path>
        <path d="M15 8a3 3 0 1 0-6 0v8a3 3 0 0 0 6 0z"></path>
        <path d="M12 4v4"></path>
      </svg>
    </button>
  );
}
