const PRODUCTION_API_BASE_URL = 'https://simple-fyp-backend--nwareacc01.replit.app/api';
const LOCAL_API_BASE_URL = 'http://localhost:3002/api';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isLoopbackApiUrl = configuredApiBaseUrl && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(configuredApiBaseUrl);

const API_BASE_URL = import.meta.env.PROD
  ? (configuredApiBaseUrl && !isLoopbackApiUrl ? configuredApiBaseUrl : PRODUCTION_API_BASE_URL)
  : (configuredApiBaseUrl || LOCAL_API_BASE_URL);

export const apiRequest = async (path, options = {}) => {
  const { headers: customHeaders = {}, ...restOptions } = options;

  const isFormDataBody = restOptions?.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
      ...customHeaders
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export { API_BASE_URL };
