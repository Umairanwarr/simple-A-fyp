import { io } from 'socket.io-client';
import { API_BASE_URL } from './apiClient';

let socket = null;

const getServerBase = () => {
  // API_BASE_URL is like http://host:port/api
  try {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  } catch (err) {
    return API_BASE_URL;
  }
};

export const connectSocket = (token) => {
  if (!token) {
    return null;
  }

  if (socket && socket.connected) return socket;

  const base = getServerBase();

  socket = io(base, {
    auth: { token },
    transports: ['websocket']
  });

  return socket;
};

export const disconnectSocket = () => {
  try {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  } catch (err) {
    // ignore
  }
};

export const getSocket = () => socket;
