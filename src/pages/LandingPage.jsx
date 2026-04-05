import React, { useEffect, useState } from 'react';
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
  const [noticeModal, setNoticeModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    const savedNotice =
      sessionStorage.getItem('doctorApplicationNotice') ||
      sessionStorage.getItem('clinicApplicationNotice') ||
      sessionStorage.getItem('medicalStoreApplicationNotice');

    if (!savedNotice) {
      return;
    }

    try {
      const parsedNotice = JSON.parse(savedNotice);
      setNoticeModal({
        isOpen: true,
        title: parsedNotice.title || 'Application Submitted',
        message:
          parsedNotice.message ||
          'Your application has been submitted. Admin will review your request and you will receive an email update.'
      });
    } catch (error) {
      setNoticeModal({
        isOpen: true,
        title: 'Application Submitted',
        message:
          'Your application has been submitted. Admin will review your request and you will receive an email update.'
      });
    } finally {
      sessionStorage.removeItem('doctorApplicationNotice');
      sessionStorage.removeItem('clinicApplicationNotice');
      sessionStorage.removeItem('medicalStoreApplicationNotice');
    }
  }, []);

  return (
    <div className="font-sans flex flex-col w-full bg-white relative">
      {noticeModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px] flex items-center justify-center px-4">
          <div className="w-full max-w-[560px] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-[24px] sm:text-[28px] font-bold text-[#1F2937] mb-3">{noticeModal.title}</h2>
            <p className="text-[15px] leading-relaxed text-[#4B5563] mb-6">{noticeModal.message}</p>
            <button
              type="button"
              onClick={() => setNoticeModal((prev) => ({ ...prev, isOpen: false }))}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white font-bold text-[14px] transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

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
