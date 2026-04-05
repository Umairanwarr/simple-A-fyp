import React from 'react';
import Navbar from '../components/landingPage/Navbar';
import Hero from '../components/landingPage/Hero';
import Services from '../components/landingPage/Services';
import ProvidersBanner from '../components/landingPage/ProvidersBanner';
import SubscriptionPlans from '../components/landingPage/SubscriptionPlans';
import LiveStreams from '../components/landingPage/LiveStreams';
import Hospitals from '../components/landingPage/Hospitals';
import TopSpecialties from '../components/landingPage/TopSpecialties';
import TopProviders from '../components/landingPage/TopProviders';
import Stores from '../components/landingPage/Stores';
import MediaGallery from '../components/landingPage/MediaGallery';
import Footer from '../components/landingPage/Footer';

export default function LandingPage() {
  return (
    <div className="font-sans flex flex-col w-full bg-white relative">
      <Navbar />
      <div className="bg-[#1E232F] flex flex-col min-h-[0vh] xl:min-h-0 relative z-0 pb-10">
        <Hero />
      </div>
      <div id="services">
        <Services />
      </div>
      <div id="top-doctors">
        <TopProviders />
      </div>
      <div id="specialties">
        <TopSpecialties />
      </div>

      <div id="subscription-plans">
        <SubscriptionPlans />
      </div>

      <div id="live-streams">
        <LiveStreams />
      </div>
      <div id="clinics">
        <Hospitals />
      </div>
      <div id="medical-stores">
        <Stores />
      </div>
      {/* <div id="gallery">
        <MediaGallery />
      </div> */}
      <Footer />
    </div>
  );
}
