import React from 'react';
import Navbar from '../components/landingPage/Navbar';
import Hero from '../components/landingPage/Hero';
import Services from '../components/landingPage/Services';
import ProvidersBanner from '../components/landingPage/ProvidersBanner';
import Hospitals from '../components/landingPage/Hospitals';
import TopSpecialties from '../components/landingPage/TopSpecialties';
import TopProviders from '../components/landingPage/TopProviders';
import Footer from '../components/landingPage/Footer';

export default function LandingPage() {
  return (
    <div className="font-sans flex flex-col w-full bg-white">
      <div className="bg-[#1E232F] flex flex-col min-h-[0vh] xl:min-h-0 relative z-0 pb-10">
        <Navbar />
        <Hero />
      </div>
      <Services />
      <ProvidersBanner />
      <Hospitals />
      <TopSpecialties />
      <TopProviders />
      <Footer />
    </div>
  );
}
