import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import VerificationCode from './pages/auth/VerificationCode';
import ResetPassword from './pages/auth/ResetPassword';
import PatientDashboard from './pages/patientDashboard/Dashboard';
import PatientProfile from './pages/patientDashboard/Profile';
import PatientAppointments from './pages/patientDashboard/Appointments';
import PatientExplore from './pages/patientDashboard/Explore';
import PatientFavorites from './pages/patientDashboard/Favorites';
import PatientHistory from './pages/patientDashboard/History';
import PatientChats from './pages/patientDashboard/Chats';
import PatientDoctorProfile from './pages/patientDashboard/DoctorProfile';
import ClinicDashboard from './pages/clinicDashboard/Dashboard';
import DoctorDashboard from './pages/doctorDashboard/Dashboard';
import DoctorProfile from './pages/doctorDashboard/Profile';
import DoctorReviewsPage from './pages/doctorDashboard/Reviews';
import DoctorSchedule from './pages/doctorDashboard/Schedule';
import DoctorAppointments from './pages/doctorDashboard/Appointments';
import DoctorClinic from './pages/doctorDashboard/Clinic';
import DoctorAvailability from './pages/doctorDashboard/Availability';
import DoctorStreaming from './pages/doctorDashboard/Streaming';
import DoctorSubscriptions from './pages/doctorDashboard/Subscriptions';
import DoctorPrescriptions from './pages/doctorDashboard/Prescriptions';
import DoctorMedia from './pages/doctorDashboard/Media';
import StoreDashboard from './pages/storeDashboard/Dashboard';
import AdminLogin from './pages/admin/adminLogin/AdminLogin';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import Patients from './pages/admin/dashboard/users/Patients';
import Doctors from './pages/admin/dashboard/users/Doctors';
import Clinics from './pages/admin/dashboard/users/Clinics';
import Stores from './pages/admin/dashboard/users/Stores';
import DoctorReviews from './pages/admin/dashboard/reviews/DoctorReviews';
import BugReports from './pages/admin/dashboard/bugs/BugReports';
import RequireAdminAuth from './components/admin/auth/RequireAdminAuth';
import RequireRoleAuth from './components/auth/RequireRoleAuth';
import RedirectAuthenticatedUser from './components/auth/RedirectAuthenticatedUser';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
          path="/"
          element={(
            <RedirectAuthenticatedUser roles={['patient', 'doctor', 'clinic', 'medical-store']}>
              <LandingPage />
            </RedirectAuthenticatedUser>
          )}
        />
        <Route
          path="/signup"
          element={(
            <RedirectAuthenticatedUser roles={['patient', 'doctor', 'clinic', 'medical-store']}>
              <SignUp />
            </RedirectAuthenticatedUser>
          )}
        />
        <Route
          path="/signin"
          element={(
            <RedirectAuthenticatedUser roles={['patient', 'doctor', 'clinic', 'medical-store']}>
              <SignIn />
            </RedirectAuthenticatedUser>
          )}
        />
        <Route path="/verification-code" element={<VerificationCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientDashboard />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/dashboard/profile"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientProfile />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/dashboard/appointments"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientAppointments />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/dashboard/explore"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientExplore />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/dashboard/favorites"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientFavorites />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/dashboard/history"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientHistory />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/dashboard/chats"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientChats />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/dashboard/doctor/:doctorId"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientDoctorProfile />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/clinic/dashboard"
          element={(
            <RequireRoleAuth tokenKey="clinicToken" userKey="clinic" expectedRole="clinic">
              <ClinicDashboard />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorDashboard />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard/profile"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorProfile />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard/reviews"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorReviewsPage />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard/schedule"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorSchedule />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard/appointments"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorAppointments />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard/clinic"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorClinic />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard/availability"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorAvailability />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard/streaming"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorStreaming />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard/subscriptions"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorSubscriptions />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard/prescriptions"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorPrescriptions />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/doctor/dashboard/media"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorMedia />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/store/dashboard"
          element={(
            <RequireRoleAuth tokenKey="medicalStoreToken" userKey="medicalStore" expectedRole="medical-store">
              <StoreDashboard />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/admin/login"
          element={(
            <RedirectAuthenticatedUser roles={['admin']}>
              <AdminLogin />
            </RedirectAuthenticatedUser>
          )}
        />
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
        <Route
          path="/admin/reviews"
          element={(
            <RequireAdminAuth>
              <DoctorReviews />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/bug-reports"
          element={(
            <RequireAdminAuth>
              <BugReports />
            </RequireAdminAuth>
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
