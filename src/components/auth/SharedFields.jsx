import React, { memo } from 'react';

export const PasswordField = memo(function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  showPassword,
  togglePasswordVisibility,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13.5px] font-bold text-[#6B7280]">{label}</label>
      <div className="relative">
        <input
          name={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full pr-12"
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(id)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
});

export const FilePicker = memo(function FilePicker({
  label,
  name,
  file,
  onChange,
  accept = "image/*,.pdf"
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13.5px] font-bold text-[#6B7280]">{label}</label>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-[#F5F5F5E5] border-gray-300 hover:border-[#1EBDB8] hover:bg-[#F0FDFB] transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <svg className="w-8 h-8 mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-[#6B7280] text-[13.5px]"><span className="font-bold">Click to upload</span> or drag and drop</p>
            <p className="text-[12px] text-[#9CA3AF]">PDF, PNG, JPG</p>
          </div>
          <input name={name} type="file" className="hidden" accept={accept} onChange={onChange} />
        </label>
      </div>
      {file && (
        <div className="mt-2 text-[13px] font-medium text-[#1EBDB8] flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10.04 10.04 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          {file.name}
        </div>
      )}
    </div>
  );
});

export const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = password.length >= 9;
  return hasUpperCase && hasSpecialChar && hasMinLength;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
