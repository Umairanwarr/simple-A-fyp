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
import PatientLiveStreams from './pages/patientDashboard/LiveStreams';
import PatientPrescriptions from './pages/patientDashboard/Prescriptions';
import PatientDoctorProfile from './pages/patientDashboard/DoctorProfile';
import PatientStoreProfile from './pages/patientDashboard/StoreProfile';
import ClinicDashboard from './pages/clinicDashboard/Dashboard';
import ClinicStaff from './pages/clinicDashboard/Staff';
import ClinicSubscriptions from './pages/clinicDashboard/Subscriptions';
import ClinicMedia from './pages/clinicDashboard/Media';
import ClinicStreaming from './pages/clinicDashboard/Streaming';
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
import DoctorChats from './pages/doctorDashboard/Chats';
import StoreDashboard from './pages/storeDashboard/Dashboard';
import StoreInventory from './pages/storeDashboard/Inventory';
import StoreSubscriptions from './pages/storeDashboard/Subscriptions';
import StoreOrders from './pages/storeDashboard/Orders';
import StoreProfilePage from './pages/storeDashboard/Profile';
import StoreMedia from './pages/storeDashboard/Media';
import StoreDelivery from './pages/storeDashboard/Delivery';
import AdminLogin from './pages/admin/adminLogin/AdminLogin';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import Patients from './pages/admin/dashboard/users/Patients';
import Doctors from './pages/admin/dashboard/users/Doctors';
import Clinics from './pages/admin/dashboard/users/Clinics';
import Stores from './pages/admin/dashboard/users/Stores';
import SubscriptionPricing from './pages/admin/dashboard/subscriptions/SubscriptionPricing';
import PremiumUsers from './pages/admin/dashboard/subscriptions/PremiumUsers';
import MediaModeration from './pages/admin/dashboard/media/MediaModeration';
import DoctorReviews from './pages/admin/dashboard/reviews/DoctorReviews';
import BugReports from './pages/admin/dashboard/bugs/BugReports';
import AdminLiveStreams from './pages/admin/dashboard/AdminLiveStreams';
import AdminWithdrawRequests from './pages/admin/dashboard/AdminWithdrawRequests';
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
          path="/dashboard/prescriptions"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientPrescriptions />
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
          path="/dashboard/store/:storeId"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientStoreProfile />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/dashboard/livestreams"
          element={(
            <RequireRoleAuth tokenKey="patientToken" userKey="patient" expectedRole="patient">
              <PatientLiveStreams />
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
          path="/clinic/dashboard/staff"
          element={(
            <RequireRoleAuth tokenKey="clinicToken" userKey="clinic" expectedRole="clinic">
              <ClinicStaff />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/clinic/dashboard/subscriptions"
          element={(
            <RequireRoleAuth tokenKey="clinicToken" userKey="clinic" expectedRole="clinic">
              <ClinicSubscriptions />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/clinic/dashboard/media"
          element={(
            <RequireRoleAuth tokenKey="clinicToken" userKey="clinic" expectedRole="clinic">
              <ClinicMedia />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/clinic/dashboard/streaming"
          element={(
            <RequireRoleAuth tokenKey="clinicToken" userKey="clinic" expectedRole="clinic">
              <ClinicStreaming />
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
          path="/doctor/dashboard/chats"
          element={(
            <RequireRoleAuth tokenKey="doctorToken" userKey="doctor" expectedRole="doctor">
              <DoctorChats />
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
          path="/store/dashboard/profile"
          element={(
            <RequireRoleAuth tokenKey="medicalStoreToken" userKey="medicalStore" expectedRole="medical-store">
              <StoreProfilePage />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/store/dashboard/inventory"
          element={(
            <RequireRoleAuth tokenKey="medicalStoreToken" userKey="medicalStore" expectedRole="medical-store">
              <StoreInventory />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/store/dashboard/subscriptions"
          element={(
            <RequireRoleAuth tokenKey="medicalStoreToken" userKey="medicalStore" expectedRole="medical-store">
              <StoreSubscriptions />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/store/dashboard/orders"
          element={(
            <RequireRoleAuth tokenKey="medicalStoreToken" userKey="medicalStore" expectedRole="medical-store">
              <StoreOrders />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/store/dashboard/media"
          element={(
            <RequireRoleAuth tokenKey="medicalStoreToken" userKey="medicalStore" expectedRole="medical-store">
              <StoreMedia />
            </RequireRoleAuth>
          )}
        />
        <Route
          path="/store/dashboard/delivery"
          element={(
            <RequireRoleAuth tokenKey="medicalStoreToken" userKey="medicalStore" expectedRole="medical-store">
              <StoreDelivery />
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
          path="/admin/subscription-pricing"
          element={(
            <RequireAdminAuth>
              <SubscriptionPricing />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/premium-users"
          element={(
            <RequireAdminAuth>
              <PremiumUsers />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/media-moderation"
          element={(
            <RequireAdminAuth>
              <MediaModeration />
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
        <Route
          path="/admin/live-streams"
          element={(
            <RequireAdminAuth>
              <AdminLiveStreams />
            </RequireAdminAuth>
          )}
        />
        <Route
          path="/admin/withdraw-requests"
          element={(
            <RequireAdminAuth>
              <AdminWithdrawRequests />
            </RequireAdminAuth>
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
