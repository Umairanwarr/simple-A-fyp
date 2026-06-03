const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-javascript-api';

let googleMapsLoadPromise = null;

export const getGoogleMapsApiKey = () => {
  return String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
};

export const loadGoogleMaps = () => {
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is not configured'));
  }

  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google Maps failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve(window.google), { once: true });
    script.addEventListener('error', () => reject(new Error('Google Maps failed to load')), { once: true });

    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
};
