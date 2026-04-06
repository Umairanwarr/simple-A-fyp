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

export const fetchAdminStats = async (token) => {
  return apiRequest('/auth/admin/stats', {
    method: 'GET',
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
