const AVATAR_FIELDS = [
  'avatarUrl',
  'avatar',
  'profileImage',
  'image',
  'imageUrl',
  'photoUrl'
];

const DASHBOARD_SESSION_CONFIGS = [
  {
    tokenKey: 'adminToken',
    userKey: 'admin',
    expectedRole: 'admin',
    dashboardPath: '/admin/dashboard'
  },
  {
    tokenKey: 'doctorToken',
    userKey: 'doctor',
    expectedRole: 'doctor',
    dashboardPath: '/doctor/dashboard'
  },
  {
    tokenKey: 'clinicToken',
    userKey: 'clinic',
    expectedRole: 'clinic',
    dashboardPath: '/clinic/dashboard'
  },
  {
    tokenKey: 'medicalStoreToken',
    userKey: 'medicalStore',
    expectedRole: 'medical-store',
    dashboardPath: '/store/dashboard'
  },
  {
    tokenKey: 'patientToken',
    userKey: 'patient',
    expectedRole: 'patient',
    dashboardPath: '/dashboard'
  }
];

const parseStoredObject = (storageKey) => {
  const rawValue = localStorage.getItem(storageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return null;
  }
};

const extractAvatarValue = (record) => {
  if (!record || typeof record !== 'object') {
    return '';
  }

  for (const key of AVATAR_FIELDS) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const buildAvatarUrl = (record, name, background = '1EBDB8') => {
  const providedAvatar = extractAvatarValue(record);

  if (typeof providedAvatar === 'string' && providedAvatar.trim()) {
    return providedAvatar.trim();
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff&bold=true`;
};

export const hasSessionAvatar = (userKey) => {
  const user = parseStoredObject(userKey);
  return Boolean(extractAvatarValue(user));
};

export const updateSessionAvatar = (userKey, avatarUrl) => {
  const existingUser = parseStoredObject(userKey);

  if (!existingUser) {
    return;
  }

  const nextUser = {
    ...existingUser,
    avatarUrl: String(avatarUrl || '').trim()
  };

  localStorage.setItem(userKey, JSON.stringify(nextUser));
};

export const saveSessionUser = (userKey, userPayload) => {
  const nextUser = {
    ...(userPayload || {})
  };

  const incomingAvatar = extractAvatarValue(nextUser);

  if (!incomingAvatar) {
    const existingUser = parseStoredObject(userKey);
    const preservedAvatar = extractAvatarValue(existingUser);

    if (preservedAvatar) {
      nextUser.avatarUrl = preservedAvatar;
    }
  }

  localStorage.setItem(userKey, JSON.stringify(nextUser));
};

const decodeJwtPayload = (token) => {
  try {
    const tokenParts = String(token || '').split('.');

    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = tokenParts[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');

    return JSON.parse(atob(paddedPayload));
  } catch (error) {
    return null;
  }
};

export const isJwtTokenValid = (token, expectedRole) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const payload = decodeJwtPayload(token);

  if (!payload || typeof payload !== 'object') {
    return false;
  }

  if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
    return false;
  }

  if (expectedRole && payload.role !== expectedRole) {
    return false;
  }

  return true;
};

export const hasValidRoleSession = ({ tokenKey, userKey, expectedRole }) => {
  const token = localStorage.getItem(tokenKey);

  if (!isJwtTokenValid(token, expectedRole)) {
    return false;
  }

  const user = parseStoredObject(userKey);

  return Boolean(user && user.id);
};

export const clearRoleSession = ({ tokenKey, userKey }) => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
};

export const getAuthenticatedDashboardPath = () => {
  for (const config of DASHBOARD_SESSION_CONFIGS) {
    if (hasValidRoleSession(config)) {
      return config.dashboardPath;
    }

    if (localStorage.getItem(config.tokenKey) || localStorage.getItem(config.userKey)) {
      clearRoleSession(config);
    }
  }

  return '';
};

export const getAuthenticatedDashboardPathByRoles = (allowedRoles = []) => {
  const normalizedRoles = Array.isArray(allowedRoles)
    ? allowedRoles.map((role) => String(role || '').trim()).filter(Boolean)
    : [];

  if (normalizedRoles.length === 0) {
    return getAuthenticatedDashboardPath();
  }

  const allowedRoleSet = new Set(normalizedRoles);

  for (const config of DASHBOARD_SESSION_CONFIGS) {
    if (!allowedRoleSet.has(config.expectedRole)) {
      continue;
    }

    if (hasValidRoleSession(config)) {
      return config.dashboardPath;
    }

    if (localStorage.getItem(config.tokenKey) || localStorage.getItem(config.userKey)) {
      clearRoleSession(config);
    }
  }

  return '';
};

export const getPatientSessionProfile = () => {
  const patient = parseStoredObject('patient') || {};
  const name = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient';

  return {
    name,
    email: patient.email || '',
    phoneNumber: patient.phone || '',
    avatarUrl: buildAvatarUrl(patient, name)
  };
};

export const getDoctorSessionProfile = () => {
  const doctor = parseStoredObject('doctor') || {};
  const name = String(doctor.fullName || '').trim() || 'Doctor';
  const normalizedPlan = String(doctor.currentPlan || '').trim().toLowerCase();
  const currentPlan = ['platinum', 'gold', 'diamond'].includes(normalizedPlan)
    ? normalizedPlan
    : 'platinum';

  return {
    name,
    email: doctor.email || '',
    avatarUrl: buildAvatarUrl(doctor, name),
    currentPlan
  };
};

export const getClinicSessionProfile = () => {
  const clinic = parseStoredObject('clinic') || {};
  const name = String(clinic.name || '').trim() || 'Clinic';

  return {
    name,
    email: clinic.email || '',
    avatarUrl: buildAvatarUrl(clinic, name)
  };
};

export const getMedicalStoreSessionProfile = () => {
  const medicalStore = parseStoredObject('medicalStore') || {};
  const name = String(medicalStore.name || '').trim() || 'Medical Store';
  const normalizedPlan = String(medicalStore.currentPlan || '').trim().toLowerCase();
  const currentPlan = ['platinum', 'gold', 'diamond'].includes(normalizedPlan)
    ? normalizedPlan
    : 'platinum';

  return {
    name,
    email: medicalStore.email || '',
    avatarUrl: buildAvatarUrl(medicalStore, name),
    currentPlan
  };
};
