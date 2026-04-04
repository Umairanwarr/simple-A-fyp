import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Prevent scrolling when mobile menu is open
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Mobile Menu Overlay - Highest level sibling */}
      <div className={`fixed inset-0 bg-[#1E232F]/98 z-[10000] transition-all duration-500 md:hidden flex flex-col items-center justify-start p-6 gap-10 text-center pt-36 overflow-y-auto ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}>
          {/* Main Links */}
          <div className="flex flex-col gap-8 text-[18px] font-bold text-gray-200">
            <a href="#services" onClick={toggleMenu} className="hover:text-[#1EBDB8] uppercase tracking-[3px] transition-all">Services</a>
            <a href="#live-streams" onClick={toggleMenu} className="hover:text-[#1EBDB8] uppercase tracking-[3px] transition-all flex items-center justify-center gap-3">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
               Live Streams
            </a>
            <a href="#clinics" onClick={toggleMenu} className="hover:text-[#1EBDB8] uppercase tracking-[3px] transition-all">Clinics</a>
            <a href="#top-doctors" onClick={toggleMenu} className="hover:text-[#1EBDB8] uppercase tracking-[3px] transition-all">Doctors</a>
            <a href="#gallery" onClick={toggleMenu} className="hover:text-[#1EBDB8] uppercase tracking-[3px] transition-all">Gallery</a>
            <a href="#medical-stores" onClick={toggleMenu} className="hover:text-[#1EBDB8] uppercase tracking-[3px] transition-all">Stores</a>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-12 bg-white/10" />

          {/* Auth Buttons */}
          <div className="flex flex-col items-center gap-6 w-full max-w-[280px]">
            <a 
              href="/signin" 
              onClick={toggleMenu}
              className="text-[18px] font-medium text-gray-200 hover:text-white h-10 flex items-center"
            >
              Login
            </a>
            <a 
              href="/signup" 
              onClick={toggleMenu}
              className="w-full bg-[#1EBDB8] text-white px-7 py-3.5 rounded-full text-center font-bold text-[17px] shadow-lg active:scale-95 transition-all"
            >
              Sign Up
            </a>
          </div>
      </div>

      <nav className={`fixed top-0 left-0 w-full z-[10010] transition-all duration-300 ${
        scrolled && !isOpen ? 'bg-[#1E232F]/95 backdrop-blur-xl py-4 shadow-2xl border-b border-white/5' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between relative">
          {/* Mobile Menu Button - Hamburger */}
          <button 
            onClick={toggleMenu}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 z-[11000] text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            <span className={`h-0.5 w-6 bg-white transition-all duration-300 rounded-full ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`h-0.5 w-6 bg-white transition-all duration-300 rounded-full ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-6 bg-white transition-all duration-300 rounded-full ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          {/* Logo - Centered on Mobile, Left on Desktop */}
          <a 
            href="/" 
            className={`flex items-center gap-3 z-[11000] hover:opacity-80 transition-opacity absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:left-0 md:w-48 ${isOpen ? 'md:flex' : 'flex'}`}
          >
            <img src="/logo.svg" alt="Simple Logo" className="h-10 w-10 object-contain" />
            <span className="text-[26px] font-semibold text-white tracking-wide leading-none pt-1">Simple</span>
          </a>
          
          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[14px] font-bold text-gray-300">
            <a href="#services" className="hover:text-white transition-colors uppercase tracking-wider">Services</a>
            <a href="#live-streams" className="hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
               Live
            </a>
            <a href="#clinics" className="hover:text-white transition-colors uppercase tracking-wider">Clinics</a>
            <a href="#top-doctors" className="hover:text-white transition-colors uppercase tracking-wider">Doctors</a>
            <a href="#gallery" className="hover:text-white transition-colors uppercase tracking-wider">Gallery</a>
            <a href="#medical-stores" className="hover:text-white transition-colors uppercase tracking-wider">Stores</a>
          </div>
          
          {/* Right side buttons - Login/SignUp Desktop, Hidden on Mobile */}
          <div className="hidden md:flex items-center justify-end gap-8 text-[15px] font-medium z-10 w-48">
            <a href="/signin" className="text-gray-200 hover:text-white transition-colors">Login</a>
            <a href="/signup" className="bg-[#1EBDB8] text-white px-7 py-2.5 rounded-full hover:bg-[#1CAAAE] transition-colors shadow-sm font-semibold">
              Sign Up
            </a>
          </div>

          {/* Mobile Spacer (to keep logo centered when menu btn is on left) */}
          <div className="md:hidden w-10" aria-hidden="true" />
        </div>
      </nav>
    </>
  );
}
