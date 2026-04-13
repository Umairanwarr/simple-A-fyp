import { API_BASE_URL, apiRequest } from './apiClient';

export const fetchConversations = async (token) => {
  if (!token) throw new Error('Missing token');

  return apiRequest('/chat/conversations', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const fetchMessages = async (token, otherUserId) => {
  if (!token) throw new Error('Missing token');
  if (!otherUserId) throw new Error('Missing other user id');

  return apiRequest(`/chat/messages/${otherUserId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const sendMessageRest = async (token, payload) => {
  if (!token) throw new Error('Missing token');

  return apiRequest('/chat/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload || {})
  });
};
