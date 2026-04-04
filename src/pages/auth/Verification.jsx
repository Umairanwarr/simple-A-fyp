import React from 'react';
import AuthNavbar from '../../components/auth/AuthNavbar';
import VerificationForm from '../../components/auth/VerificationForm';
import Footer from '../../components/landingPage/Footer';

export default function Verification() {
  return (
    <div className="font-sans flex flex-col w-full bg-white min-h-screen">
      <AuthNavbar hideControls={true} />
      <VerificationForm />
      <Footer />
    </div>
  );
}
