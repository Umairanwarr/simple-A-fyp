import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthNavbar from '../../components/auth/AuthNavbar';
import Footer from '../../components/landingPage/Footer';
import { PasswordField, validatePassword } from '../../components/auth/SharedFields';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!validatePassword(password)) {
      toast.error('Password must be at least 9 characters with 1 uppercase letter and 1 special character');
      return;
    }
    toast.success('Password successfully reset');
    setTimeout(() => {
      navigate('/signin');
    }, 1500);
  };

  const isFormValid = () => {
    return password && confirmPassword;
  };

  return (
    <div className="font-sans flex flex-col w-full bg-white min-h-screen">
      <AuthNavbar hideControls />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full flex-grow flex items-center justify-center py-10 px-6 bg-white min-h-[calc(100vh-250px)]">
        <div className="w-full max-w-[500px]">
          <div className="text-center mb-10">
            <h1 className="text-[34px] sm:text-[40px] text-[#6B7280] font-medium tracking-tight mb-2">
              Reset <span className="text-[#1EBDB8] font-bold">Password</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#6B7280] leading-tight">
              Create a new password
            </h2>
            <p className="text-[#9CA3AF] text-[13.5px] sm:text-[14px] font-medium mt-1">
              Enter a new secure password for your account
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleReset}>
            {/* New Password */}
            <PasswordField
              id="new"
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword['new']}
              togglePasswordVisibility={togglePasswordVisibility}
            />

            {/* Confirm Password */}
            <PasswordField
              id="confirm"
              label="Confirm Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPassword={showPassword['confirm']}
              togglePasswordVisibility={togglePasswordVisibility}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm mt-4 ${
                isFormValid() ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Reset Password
            </button>

            {/* Back to Sign In */}
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="text-[#6B7280] font-bold text-[16px] hover:text-[#4B5563] transition-colors text-center mt-2"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
