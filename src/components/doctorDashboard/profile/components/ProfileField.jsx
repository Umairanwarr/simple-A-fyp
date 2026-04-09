import React from 'react';

export default function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly = false,
  error,
  disabled = false,
  multiline = false,
  rows = 4
}) {
  const baseClassName = readOnly
    ? 'w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#4B5563]'
    : 'w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20 disabled:opacity-70';

  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-bold text-[#6B7280]">{label}</span>

      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          rows={rows}
          className={`${baseClassName} resize-y min-h-[120px]`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          className={baseClassName}
        />
      )}

      {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
    </label>
  );
}
