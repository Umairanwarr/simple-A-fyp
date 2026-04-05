import React from 'react';
import AuthNavbar from '../../../components/auth/AuthNavbar';
import AdminSignInForm from '../../../components/admin/auth/AdminSignInForm';
import Footer from '../../../components/landingPage/Footer';

export default function AdminLogin() {
  return (
    <div className="font-sans flex flex-col w-full bg-[#FAFAFA] min-h-screen">
      <AuthNavbar hideControls={true} />
      <div className="flex-grow flex items-center justify-center py-10">
        <AdminSignInForm />
      </div>
      <Footer />
    </div>
  );
}
