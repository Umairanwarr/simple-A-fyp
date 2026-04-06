import React from 'react';
import AuthNavbar from '../../components/auth/AuthNavbar';
import VerificationCodeForm from '../../components/auth/VerificationCodeForm';
import Footer from '../../components/landingPage/Footer';

export default function VerificationCode() {
  return (
    <div className="font-sans flex flex-col w-full bg-white min-h-screen">
      <AuthNavbar hideControls={true} />
      <VerificationCodeForm />
      <Footer />
    </div>
  );
}
