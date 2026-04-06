import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#1A1F2D] pt-16 px-6 lg:px-10">
      <div className="max-w-[1300px] mx-auto">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-8 border-b border-[#303649]">
          <div className="flex items-center gap-3 z-10 w-48 mb-6 md:mb-0">
            <img src="/logo.svg" alt="Simple Logo" className="h-10 w-10 object-contain" />
            <span className="text-[26px] font-semibold text-white tracking-wide leading-none pt-1">Simple</span>
          </div>

          <div className="flex gap-4">
            {/* Facebook */}
            <a href="#" className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 320 512"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" /></svg>
            </a>
            {/* Instagram */}
            <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFDF40] via-[#FD1D1D] to-[#833AB4] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" /></svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 448 512"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" /></svg>
            </a>
            {/* YouTube */}
            <a href="#" className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 576 512"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" /></svg>
            </a>
            {/* Pinterest */}
            <a href="#" className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 496 512"><path d="M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.8-78 113.8-25.8 0-46.3-21.3-40-47.5 7.6-31.9 22.2-66.3 22.2-89.3 0-20.6-11.1-37.8-34.1-37.8-27.1 0-48.9 28.1-48.9 65.9 0 23.9 8.1 40 8.1 40s-27.6 116.7-33.1 140.2c-10.5 44.8-3.9 107.1-2.6 118.9.3 2.1-2.2 3.4-3.8 2-11.2-9.6-32.9-39.2-44.5-81-1.6-5.8-30.2-117.3-30.2-117.3-17.1-34.3-24-74-24-116.3C0 114.6 114.6 0 256 0c137 0 248 111 248 248z" /></svg>
            </a>
          </div>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 xl:gap-24 py-16">
          {/* Col 1 */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold text-[16px] mb-8">About Simple</h3>
            <p className="text-gray-300 text-[14px] leading-relaxed">
              Simple is a medical care Pakistan platform bridging the gap in speciality care by connecting patients around the states from their homes to the top hospitals and specialists in Pakistan.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h3 className="text-white font-semibold text-[16px] mb-8">Useful Link</h3>
            <ul className="flex flex-col gap-4 text-gray-300 text-[14px]">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Second Opinion</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Treatment in Pakistan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Clinal Trial</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pakistan Hospital</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blogs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Medical Intake Form</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h3 className="text-white font-semibold text-[16px] mb-8">Contact Info</h3>

            <div className="flex items-start gap-4 mb-8">
              <img src="https://flagcdn.com/w40/pk.png" alt="Pakistan Flag" className="w-8 h-8 object-cover rounded-full border border-gray-600 mt-1 shadow-sm" />
              <div>
                <p className="text-white font-medium text-[15px]">Pakistan Office :</p>
                <p className="text-gray-400 text-[13px] mt-1.5">Islamabad, Pakistan</p>
              </div>
            </div>

            <div className="bg-[#303649] rounded-xl p-3.5 px-4 flex items-center gap-3 w-fit pr-8">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span className="text-gray-200 text-[14px] font-medium">health@simple.com</span>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h3 className="text-white font-semibold text-[16px] mb-8">Legal</h3>
            <ul className="flex flex-col gap-4 text-gray-300 text-[14px]">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">License</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Downloads</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#303649] py-8 text-[#9CA3AF] text-[13px]">
          © 2026 Simple Pakistan. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}
