export default function Navbar() {
  return (
    <nav className="relative w-full max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
      <a href="/" className="flex items-center gap-3 z-10 w-48 hover:opacity-80 transition-opacity">
        <img src="/logo.svg" alt="Simple Logo" className="h-10 w-10 object-contain" />
        <span className="text-[26px] font-semibold text-white tracking-wide leading-none pt-1">Simple</span>
      </a>
      
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-[15px] font-medium text-gray-200">
        <a href="#" className="hover:text-white transition-colors">Experience</a>
        <a href="#" className="hover:text-white transition-colors">Global Plans</a>
        <a href="#" className="hover:text-white transition-colors">Consultation</a>
        <a href="#" className="hover:text-white transition-colors">Help</a>
      </div>
      
      <div className="flex items-center justify-end gap-8 text-[15px] font-medium z-10 w-48">
        <a href="/signin" className="text-gray-200 hover:text-white transition-colors hidden md:block">Login</a>
        <a href="/signup" className="bg-white text-[#1E232F] px-7 py-2.5 rounded-full hover:bg-gray-100 transition-colors shadow-sm">
          Sign Up
        </a>
      </div>
    </nav>
  );
}
