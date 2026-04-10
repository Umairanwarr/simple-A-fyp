import { API_BASE_URL, apiRequest } from './apiClient';

export const registerPatient = async (payload) => {
  return apiRequest('/auth/patient/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const registerDoctor = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/auth/doctor/register`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Could not register doctor');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const registerClinic = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/auth/clinic/register`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Could not register clinic');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const registerMedicalStore = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/auth/store/register`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Could not register medical store');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const sendPatientOtp = async (email, purpose = 'signup') => {
  return apiRequest('/auth/patient/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email, purpose })
  });
};

export const verifyPatientOtp = async ({ email, otp, purpose = 'signup' }) => {
  return apiRequest('/auth/patient/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp, purpose })
  });
};

export const sendDoctorOtp = async (email) => {
  return apiRequest('/auth/doctor/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const sendDoctorLoginOtp = async (email) => {
  return apiRequest('/auth/doctor/send-login-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const sendClinicOtp = async (email) => {
  return apiRequest('/auth/clinic/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const sendClinicLoginOtp = async (email) => {
  return apiRequest('/auth/clinic/send-login-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const sendMedicalStoreOtp = async (email) => {
  return apiRequest('/auth/store/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const sendMedicalStoreLoginOtp = async (email) => {
  return apiRequest('/auth/store/send-login-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const verifyDoctorOtp = async ({ email, otp }) => {
  return apiRequest('/auth/doctor/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
};

export const verifyClinicOtp = async ({ email, otp }) => {
  return apiRequest('/auth/clinic/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
};

export const verifyMedicalStoreOtp = async ({ email, otp }) => {
  return apiRequest('/auth/store/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
};

export const resetPatientPassword = async ({ email, resetToken, password, confirmPassword }) => {
  return apiRequest('/auth/patient/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, resetToken, password, confirmPassword })
  });
};

export const loginPatient = async ({ email, password }) => {
  return apiRequest('/auth/patient/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const fetchPatientExploreDoctors = async ({ query = '', specialty = '' } = {}) => {
  const searchParams = new URLSearchParams();

  if (String(query || '').trim()) {
    searchParams.set('q', String(query).trim());
  }

  if (String(specialty || '').trim()) {
    searchParams.set('specialty', String(specialty).trim());
  }

  const queryString = searchParams.toString();
  const path = `/auth/patient/doctors${queryString ? `?${queryString}` : ''}`;

  return apiRequest(path, {
    method: 'GET'
  });
};

export const fetchPatientDoctorProfile = async (token, doctorId) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!doctorId) {
    throw new Error('Doctor id is required');
  }

  return apiRequest(`/auth/patient/doctors/${doctorId}/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchPatientProfile = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/patient/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const updatePatientProfile = async (token, payload) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/patient/profile', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload || {})
  });
};

export const createPatientAppointmentPaymentIntent = async (token, payload) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/patient/appointments/payment-intent', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload || {})
  });
};

export const confirmPatientAppointmentPayment = async (token, paymentIntentId) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!paymentIntentId) {
    throw new Error('Payment intent id is required');
  }

  return apiRequest('/auth/patient/appointments/confirm-payment', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ paymentIntentId })
  });
};

export const fetchPatientAppointments = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/patient/appointments', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchPatientAppointmentHistory = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/patient/appointments/history', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchPatientNotifications = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/patient/notifications', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const markPatientNotificationsRead = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/patient/notifications/read', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchPatientPendingReviewAppointment = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/patient/appointments/pending-review', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const submitPatientAppointmentReview = async (token, appointmentId, payload) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!appointmentId) {
    throw new Error('Appointment id is required');
  }

  return apiRequest(`/auth/patient/appointments/${appointmentId}/review`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload || {})
  });
};

export const skipPatientAppointmentReview = async (token, appointmentId, confirmSkip = true) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!appointmentId) {
    throw new Error('Appointment id is required');
  }

  return apiRequest(`/auth/patient/appointments/${appointmentId}/review/skip`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      confirmSkip: Boolean(confirmSkip)
    })
  });
};

export const cancelPatientAppointment = async (token, appointmentId, confirmNoRefund = true) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!appointmentId) {
    throw new Error('Appointment id is required');
  }

  return apiRequest(`/auth/patient/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      confirmNoRefund: Boolean(confirmNoRefund)
    })
  });
};

export const fetchPatientFavoriteDoctors = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/patient/favorites', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const addPatientFavoriteDoctor = async (token, doctorId) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!doctorId) {
    throw new Error('Doctor id is required');
  }

  return apiRequest(`/auth/patient/favorites/${doctorId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const removePatientFavoriteDoctor = async (token, doctorId) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!doctorId) {
    throw new Error('Doctor id is required');
  }

  return apiRequest(`/auth/patient/favorites/${doctorId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const loginPatientWithGoogle = async (idToken) => {
  return apiRequest('/auth/patient/google-login', {
    method: 'POST',
    body: JSON.stringify({ idToken })
  });
};

export const loginDoctor = async ({ email, password, otp }) => {
  return apiRequest('/auth/doctor/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, otp })
  });
};

export const fetchDoctorAnalytics = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/doctor/analytics', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchDoctorNotifications = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/doctor/notifications', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const markDoctorNotificationsRead = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/doctor/notifications/read', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchDoctorReviews = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/doctor/reviews', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchDoctorSchedule = async (token, { fromDate = '', toDate = '' } = {}) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  const searchParams = new URLSearchParams();

  if (String(fromDate || '').trim()) {
    searchParams.set('fromDate', String(fromDate || '').trim());
  }

  if (String(toDate || '').trim()) {
    searchParams.set('toDate', String(toDate || '').trim());
  }

  const queryString = searchParams.toString();

  return apiRequest(`/auth/doctor/schedule${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchDoctorAppointments = async (token) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/doctor/appointments', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const cancelDoctorUpcomingAppointment = async (token, appointmentId) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!appointmentId) {
    throw new Error('Appointment id is required');
  }

  return apiRequest(`/auth/doctor/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchDoctorProfile = async (token) => {
  return apiRequest('/auth/doctor/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const updateDoctorProfile = async (token, payload) => {
  return apiRequest('/auth/doctor/profile', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};

export const fetchDoctorAvailability = async (token) => {
  return apiRequest('/auth/doctor/availability', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const addDoctorAvailability = async (token, payload) => {
  return apiRequest('/auth/doctor/availability', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};

export const updateDoctorAvailabilitySlot = async (token, slotId, payload) => {
  return apiRequest(`/auth/doctor/availability/${slotId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};

export const deleteDoctorAvailabilitySlot = async (token, slotId) => {
  return apiRequest(`/auth/doctor/availability/${slotId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const loginClinic = async ({ email, password, otp }) => {
  return apiRequest('/auth/clinic/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, otp })
  });
};

export const loginMedicalStore = async ({ email, password, otp }) => {
  return apiRequest('/auth/store/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, otp })
  });
};

export const loginAdmin = async ({ email, password }) => {
  return apiRequest('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const submitBugReport = async (token, payload = {}) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  return apiRequest('/auth/bug-reports', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};

export const fetchAdminBugReports = async (token, { search = '', role = '', status = '' } = {}) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  const searchParams = new URLSearchParams();

  if (String(search || '').trim()) {
    searchParams.set('search', String(search || '').trim());
  }

  if (String(role || '').trim()) {
    searchParams.set('role', String(role || '').trim());
  }

  if (String(status || '').trim()) {
    searchParams.set('status', String(status || '').trim());
  }

  const queryString = searchParams.toString();

  return apiRequest(`/auth/bug-reports/admin${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const updateAdminBugReportStatus = async (token, bugReportId, status) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!bugReportId) {
    throw new Error('Bug report id is required');
  }

  return apiRequest(`/auth/bug-reports/admin/${bugReportId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
};

export const deleteAdminBugReport = async (token, bugReportId) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!bugReportId) {
    throw new Error('Bug report id is required');
  }

  return apiRequest(`/auth/bug-reports/admin/${bugReportId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

const uploadAvatarForRole = async (path, token, file) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!file) {
    throw new Error('Avatar image file is required');
  }

  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Could not upload avatar');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const updatePatientAvatar = async (token, file) => {
  return uploadAvatarForRole('/auth/patient/avatar', token, file);
};

export const updateDoctorAvatar = async (token, file) => {
  return uploadAvatarForRole('/auth/doctor/avatar', token, file);
};

export const updateClinicAvatar = async (token, file) => {
  return uploadAvatarForRole('/auth/clinic/avatar', token, file);
};

export const updateMedicalStoreAvatar = async (token, file) => {
  return uploadAvatarForRole('/auth/store/avatar', token, file);
};

export const fetchAdminPatients = async (token) => {
  return apiRequest('/auth/admin/patients', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchAdminDoctors = async (token) => {
  return apiRequest('/auth/admin/doctors', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchAdminClinics = async (token) => {
  return apiRequest('/auth/admin/clinics', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchAdminMedicalStores = async (token) => {
  return apiRequest('/auth/admin/stores', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteAdminPatient = async (token, patientId) => {
  return apiRequest(`/auth/admin/patients/${patientId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteAdminDoctor = async (token, doctorId) => {
  return apiRequest(`/auth/admin/doctors/${doctorId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteAdminClinic = async (token, clinicId) => {
  return apiRequest(`/auth/admin/clinics/${clinicId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteAdminMedicalStore = async (token, storeId) => {
  return apiRequest(`/auth/admin/stores/${storeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchAdminStats = async (token) => {
  return apiRequest('/auth/admin/stats', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchAdminNotifications = async (token) => {
  return apiRequest('/auth/admin/notifications', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const markAdminNotificationsRead = async (token) => {
  return apiRequest('/auth/admin/notifications/read', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchAdminDoctorReviews = async (token, doctorName = '') => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  const searchParams = new URLSearchParams();

  if (String(doctorName || '').trim()) {
    searchParams.set('doctorName', String(doctorName || '').trim());
  }

  const queryString = searchParams.toString();
  const endpointPath = `/auth/admin/reviews${queryString ? `?${queryString}` : ''}`;

  return apiRequest(endpointPath, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteAdminDoctorReview = async (token, reviewId) => {
  if (!token) {
    throw new Error('Unauthorized: Missing token');
  }

  if (!reviewId) {
    throw new Error('Review id is required');
  }

  return apiRequest(`/auth/admin/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const reviewAdminDoctorApplication = async (token, doctorId, status, note = '') => {
  const modernStatus = status === 'approve'
    ? 'approved'
    : status === 'decline'
      ? 'declined'
      : status;

  const legacyStatus = modernStatus === 'approved'
    ? 'approve'
    : modernStatus === 'declined'
      ? 'decline'
      : modernStatus;

  try {
    // Try legacy format first because some running backend instances still validate approve/decline.
    return await apiRequest(`/auth/admin/doctors/${doctorId}/review`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: legacyStatus,
        applicationStatus: modernStatus,
        decision: legacyStatus,
        note
      })
    });
  } catch (error) {
    const mustRetryWithLegacy =
      error?.status === 400 &&
      /status must be either approved or declined|approve|decline|approved|declined/i.test(
        String(error?.message || '')
      ) &&
      legacyStatus !== modernStatus;

    if (!mustRetryWithLegacy || legacyStatus === modernStatus) {
      throw error;
    }

    // Fallback for newer backend instances expecting approved/declined.
    return apiRequest(`/auth/admin/doctors/${doctorId}/review`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: modernStatus,
        applicationStatus: modernStatus,
        decision: modernStatus,
        note
      })
    });
  }
};

export const reviewAdminClinicApplication = async (token, clinicId, status, note = '') => {
  const modernStatus = status === 'approve'
    ? 'approved'
    : status === 'decline'
      ? 'declined'
      : status;

  const legacyStatus = modernStatus === 'approved'
    ? 'approve'
    : modernStatus === 'declined'
      ? 'decline'
      : modernStatus;

  try {
    return await apiRequest(`/auth/admin/clinics/${clinicId}/review`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: legacyStatus,
        applicationStatus: modernStatus,
        decision: legacyStatus,
        note
      })
    });
  } catch (error) {
    const mustRetryWithModern =
      error?.status === 400 &&
      /status must be either approved or declined|approve|decline|approved|declined/i.test(
        String(error?.message || '')
      ) &&
      legacyStatus !== modernStatus;

    if (!mustRetryWithModern || legacyStatus === modernStatus) {
      throw error;
    }

    return apiRequest(`/auth/admin/clinics/${clinicId}/review`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: modernStatus,
        applicationStatus: modernStatus,
        decision: modernStatus,
        note
      })
    });
  }
};

export const reviewAdminMedicalStoreApplication = async (token, storeId, status, note = '') => {
  const modernStatus = status === 'approve'
    ? 'approved'
    : status === 'decline'
      ? 'declined'
      : status;

  const legacyStatus = modernStatus === 'approved'
    ? 'approve'
    : modernStatus === 'declined'
      ? 'decline'
      : modernStatus;

  try {
    return await apiRequest(`/auth/admin/stores/${storeId}/review`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: legacyStatus,
        applicationStatus: modernStatus,
        decision: legacyStatus,
        note
      })
    });
  } catch (error) {
    const mustRetryWithModern =
      error?.status === 400 &&
      /status must be either approved or declined|approve|decline|approved|declined/i.test(
        String(error?.message || '')
      ) &&
      legacyStatus !== modernStatus;

    if (!mustRetryWithModern || legacyStatus === modernStatus) {
      throw error;
    }

    return apiRequest(`/auth/admin/stores/${storeId}/review`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: modernStatus,
        applicationStatus: modernStatus,
        decision: modernStatus,
        note
      })
    });
  }
};
