import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GenderModal from './GenderModal';

export default function SignUpForm() {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div className="w-full flex justify-center px-6 py-10 md:py-16 bg-white min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-[500px]">
        {/* Modal */}
        <GenderModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
        <div className="text-center mb-12">
          <h1 className="text-[34px] sm:text-[40px] text-[#6B7280] font-medium tracking-tight mb-2">
            Create an <span className="text-[#1EBDB8] font-bold">Account</span>
          </h1>
        </div>

        <div className="mb-8">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#6B7280] leading-tight">
            Tell us about yourself
          </h2>
          <p className="text-[#9CA3AF] text-[13.5px] sm:text-[14px] font-medium mt-1">
            To book your appointment, we need to verify a few things
          </p>
        </div>

        <form className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[13.5px] font-bold text-[#6B7280]">Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your Email address" 
              className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
            />
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#6B7280]">
                First Legal Name
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 mt-0.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </label>
              <input 
                type="text" 
                placeholder="Enter your First name" 
                className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#6B7280]">
                Last Legal Name
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 mt-0.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </label>
              <input 
                type="text" 
                placeholder="Enter your last name" 
                className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
              />
            </div>
          </div>

          {/* DOB */}
          <div className="flex flex-col gap-2">
            <label className="text-[13.5px] font-bold text-[#6B7280]">Date of birth</label>
            <input 
              type="text" 
              placeholder="mm/dd/yy" 
              className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-3 mt-1 mb-2">
            <label className="text-[13.5px] font-bold text-[#6B7280]">Gender</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="w-[18px] h-[18px] rounded-full border-[2.5px] border-[#1F2937] flex items-center justify-center p-[2px]">
                  <div className="w-full h-full bg-[#1F2937] rounded-full hidden group-has-[:checked]:block"></div>
                </div>
                <input type="radio" name="gender" value="male" className="hidden" defaultChecked />
                <span className="text-[#4B5563] text-[14.5px] font-medium leading-none mt-0.5">Male</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="w-[18px] h-[18px] rounded-full border-[2.5px] border-[#4B5563] group-has-[:checked]:border-[#1F2937] flex items-center justify-center p-[2px]">
                  <div className="w-full h-full bg-[#1F2937] rounded-full hidden group-has-[:checked]:block"></div>
                </div>
                <input type="radio" name="gender" value="female" className="hidden" />
                <span className="text-[#4B5563] text-[14.5px] font-medium leading-none mt-0.5">Female</span>
              </label>
            </div>
            
            <button 
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-[#1F2937] text-[13px] font-bold underline decoration-2 underline-offset-4 mt-2 text-left"
            >
              Add more sex and gender info <span className="font-medium text-[#6B7280] no-underline">(optional)</span>
            </button>
          </div>

          {/* Continue Button */}
          <button type="button" onClick={() => navigate('/verification')} className="w-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white py-4 rounded-full font-bold text-[15px] transition-colors shadow-sm mt-3">
            Continue
          </button>
          
          <div className="flex items-center gap-4 my-2">
            <div className="h-[1.5px] flex-1 bg-[#E5E7EB]"></div>
            <span className="text-[#6B7280] text-[13px] font-bold">Or</span>
            <div className="h-[1.5px] flex-1 bg-[#E5E7EB]"></div>
          </div>
          
          <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border-[1.5px] border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] py-3.5 rounded-xl font-bold text-[15.5px] transition-colors shadow-sm">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-[22px] h-[22px]" alt="Google logo"/>
            Continue with Google
          </button>
          
        </form>
      </div>
    </div>
  );
}
