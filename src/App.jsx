import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import Verification from './pages/auth/Verification';
import VerificationCode from './pages/auth/VerificationCode';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/patientDashboard/Dashboard';
import AdminLogin from './pages/admin/adminLogin/AdminLogin';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import Patients from './pages/admin/dashboard/users/Patients';
import Doctors from './pages/admin/dashboard/users/Doctors';
import Clinics from './pages/admin/dashboard/users/Clinics';
import Stores from './pages/admin/dashboard/users/Stores';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/verification-code" element={<VerificationCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users/patients" element={<Patients />} />
        <Route path="/admin/users/doctors" element={<Doctors />} />
        <Route path="/admin/users/clinics" element={<Clinics />} />
        <Route path="/admin/users/stores" element={<Stores />} />
      </Routes>
    </Router>
  );
}

export default App;
