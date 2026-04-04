import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignInForm() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex-grow flex items-center justify-center py-10 px-6 bg-white min-h-[calc(100vh-250px)]">
      <div className="w-full max-w-[500px]">
        <h1 className="text-[32px] md:text-[36px] font-bold text-[#1F2937] tracking-tight mb-10">
          To log in, enter your email address
        </h1>

        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#6B7280]">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full"
            />
          </div>

          <div className="flex flex-col gap-6 mt-2">
            <button
              type="button"
              onClick={() => navigate('/verification')}
              className="w-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm"
            >
              Continue
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="h-[1.5px] flex-1 bg-[#E5E7EB]"></div>
              <span className="text-[#6B7280] text-[13px] font-bold">Or</span>
              <div className="h-[1.5px] flex-1 bg-[#E5E7EB]"></div>
            </div>

            <div className="flex flex-col gap-4">
              <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border-[1.5px] border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] py-3.5 rounded-xl font-bold text-[16px] transition-colors shadow-sm">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-[20px] h-[20px]" alt="Google logo" />
                Continue with Google
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
