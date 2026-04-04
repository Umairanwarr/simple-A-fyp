import React from 'react';
import AuthNavbar from '../../components/auth/AuthNavbar';
import SignUpForm from '../../components/auth/SignUpForm';
import Footer from '../../components/landingPage/Footer';

export default function SignUp() {
  return (
    <div className="font-sans flex flex-col w-full bg-white min-h-screen">
      <AuthNavbar />
      <SignUpForm />
      <Footer />
    </div>
  );
}
