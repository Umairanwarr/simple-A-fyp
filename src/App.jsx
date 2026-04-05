import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import VerificationCode from './pages/auth/VerificationCode';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/patientDashboard/Dashboard';
import ClinicDashboard from './pages/clinicDashboard/Dashboard';
import DoctorDashboard from './pages/doctorDashboard/Dashboard';
import StoreDashboard from './pages/storeDashboard/Dashboard';
import AdminLogin from './pages/admin/adminLogin/AdminLogin';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import Patients from './pages/admin/dashboard/users/Patients';
import Doctors from './pages/admin/dashboard/users/Doctors';
import Clinics from './pages/admin/dashboard/users/Clinics';
import Stores from './pages/admin/dashboard/users/Stores';
import RequireAdminAuth from './components/admin/auth/RequireAdminAuth';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verification-code" element={<VerificationCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/store/dashboard" element={<StoreDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={(
            <RequireAdminAuth>
              <AdminDashboard />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/users/patients"
          element={(
            <RequireAdminAuth>
              <Patients />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/users/doctors"
          element={(
            <RequireAdminAuth>
              <Doctors />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/users/clinics"
          element={(
            <RequireAdminAuth>
              <Clinics />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/users/stores"
          element={(
            <RequireAdminAuth>
              <Stores />
            </RequireAdminAuth>
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
