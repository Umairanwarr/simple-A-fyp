import React from 'react';

export default function AuthNavbar({ hideControls, type }) {
  const isSignInPage = type === 'signin';
  
  return (
    <nav className="w-full flex justify-between items-center px-6 lg:px-12 py-5 bg-white border-b border-gray-100">
      <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <img 
          src="/logo.svg" 
          alt="Simple Logo" 
          className="h-9 w-auto"
          style={{ filter: 'invert(52%) sepia(85%) saturate(417%) hue-rotate(128deg) brightness(97%) contrast(93%)' }}
        />
        <span className="text-[24px] font-bold text-[#1EBDB8] tracking-wide pt-0.5">Simple</span>
      </a>
      
      {!hideControls && (
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden sm:flex items-center gap-2 text-[#6B7280] font-bold text-[13.5px]">
            <svg width="13" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Protected
          </div>
          <div className="hidden sm:block w-[1.5px] h-[34px] bg-[#E5E7EB]"></div>
          
          {isSignInPage ? (
            <a href="/signup" className="bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-7 py-2.5 rounded-full font-bold text-[13px] tracking-wide uppercase transition-colors shadow-sm">
              Sign Up
            </a>
          ) : (
            <a href="/signin" className="bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-7 py-2.5 rounded-full font-bold text-[13px] tracking-wide uppercase transition-colors shadow-sm">
              Sign In
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
