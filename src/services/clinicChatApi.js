import { API_BASE_URL, apiRequest } from './apiClient';

export const fetchClinicConversations = async (token) => {
  if (!token) throw new Error('Missing token');
  return apiRequest('/clinic-chat/conversations', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const fetchClinicMessages = async (token, otherUserId) => {
  if (!token) throw new Error('Missing token');
  if (!otherUserId) throw new Error('Missing other user id');
  return apiRequest(`/clinic-chat/messages/${otherUserId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const fetchClinicPartnerInfo = async (token, partnerId) => {
  if (!token) throw new Error('Missing token');
  if (!partnerId) throw new Error('Missing partnerId');
  return apiRequest(`/clinic-chat/partner/${partnerId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const searchClinicsForChat = async (token, query) => {
  if (!token) throw new Error('Missing token');
  return apiRequest(`/clinic-chat/search-clinics?q=${encodeURIComponent(query || '')}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const sendClinicChatMessageRest = async (token, payload) => {
  if (!token) throw new Error('Missing token');
  return apiRequest('/clinic-chat/messages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload || {})
  });
};

export const uploadChatMedia = async (token, file) => {
  if (!token) throw new Error('Missing token');
  const form = new FormData();
  form.append('media', file);
  const res = await fetch(`${API_BASE_URL}/chat/upload-media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
};
