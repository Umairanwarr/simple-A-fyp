import React from 'react';

export default function GenderModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-[550px] p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-[28px] md:text-[32px] font-bold text-[#1F2937] leading-tight mb-4">
          Add more sex and gender info
        </h2>
        
        <p className="text-[#6B7280] text-[15px] md:text-[16px] leading-relaxed mb-10">
          Simple is committed to creating a safe experience for all patients. 
          If you would like to share any additional sex or gender options with your provider, please select all that apply.
        </p>

        <div className="flex flex-col gap-5 mb-10">
          <label className="flex items-center gap-4 cursor-pointer group">
            <input type="checkbox" className="w-6 h-6 border-2 border-gray-300 rounded accent-[#1EBDB8] cursor-pointer" />
            <span className="text-[#4B5563] text-[16px] font-medium">Assigned Female at birth</span>
          </label>
          
          <label className="flex items-center gap-4 cursor-pointer group">
            <input type="checkbox" className="w-6 h-6 border-2 border-gray-300 rounded accent-[#1EBDB8] cursor-pointer" />
            <span className="text-[#4B5563] text-[16px] font-medium">Assigned Male at birth</span>
          </label>
          
          <label className="flex items-center gap-4 cursor-pointer group">
            <input type="checkbox" className="w-6 h-6 border-2 border-gray-300 rounded accent-[#1EBDB8] cursor-pointer" />
            <span className="text-[#4B5563] text-[16px] font-medium">Cisgender</span>
          </label>
          
          <button type="button" className="text-[#4B5563] text-[15px] font-bold text-left hover:text-[#1F2937] transition-colors mt-1">
            And More....
          </button>
        </div>

        <div className="flex items-center justify-end gap-4 mt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-10 py-3.5 rounded-full border border-gray-300 text-[#6B7280] font-bold text-[16px] hover:bg-gray-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="px-10 py-3.5 rounded-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white font-bold text-[16px] transition-all shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
