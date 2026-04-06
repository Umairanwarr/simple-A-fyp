import React from 'react';
import AuthNavbar from '../../components/auth/AuthNavbar';
import SignInForm from '../../components/auth/SignInForm';
import Footer from '../../components/landingPage/Footer';

export default function SignIn() {
  return (
    <div className="font-sans flex flex-col w-full bg-white min-h-screen">
      <AuthNavbar type="signin" />
      <SignInForm />
      <Footer />
    </div>
  );
}
