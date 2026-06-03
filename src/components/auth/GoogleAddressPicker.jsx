import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin } from 'lucide-react';
import { getGoogleMapsApiKey, loadGoogleMaps } from '../../utils/googleMapsLoader';

const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 };

const getCoordinatesFromLatLng = (latLng) => ({
  latitude: latLng.lat(),
  longitude: latLng.lng()
});

export default function GoogleAddressPicker({
  label,
  placeholder,
  value,
  onChange
}) {
  const inputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const reverseGeocodeRef = useRef(null);
  const didRequestCurrentLocationRef = useRef(false);
  const hasApiKey = Boolean(getGoogleMapsApiKey());
  const [mapsReady, setMapsReady] = useState(false);
  const [loadError, setLoadError] = useState(() => (
    hasApiKey ? '' : 'Google Maps key is missing. You can still type the address manually.'
  ));
  const [locationMessage, setLocationMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!hasApiKey) return undefined;

    loadGoogleMaps()
      .then(() => {
        if (!cancelled) {
          setMapsReady(true);
          setLoadError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Google Maps could not load. You can still type the address manually.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasApiKey]);

  useEffect(() => {
    if (!mapsReady || !inputRef.current || !mapContainerRef.current || mapRef.current) {
      return undefined;
    }

    const { google } = window;
    const map = new google.maps.Map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false
    });
    const marker = new google.maps.Marker({
      map,
      position: DEFAULT_CENTER,
      draggable: true,
      visible: false
    });
    const geocoder = new google.maps.Geocoder();
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      componentRestrictions: { country: 'pk' }
    });

    mapRef.current = map;
    markerRef.current = marker;
    geocoderRef.current = geocoder;
    autocompleteRef.current = autocomplete;

    const updateMarker = (position, shouldZoom = true) => {
      marker.setPosition(position);
      marker.setVisible(true);
      map.setCenter(position);
      if (shouldZoom) map.setZoom(16);
    };

    const applyAddress = ({ address, placeId = '', latitude = '', longitude = '' }) => {
      onChange({ address, placeId, latitude, longitude });
    };

    const placeListener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const location = place?.geometry?.location;
      const nextAddress = String(place?.formatted_address || place?.name || inputRef.current?.value || '').trim();

      if (!nextAddress) return;

      if (location) {
        const coordinates = getCoordinatesFromLatLng(location);
        updateMarker(location);
        applyAddress({
          address: nextAddress,
          placeId: String(place?.place_id || '').trim(),
          ...coordinates
        });
        return;
      }

      applyAddress({ address: nextAddress });
    });

    const reverseGeocode = (latLng) => {
      const coordinates = getCoordinatesFromLatLng(latLng);

      updateMarker(latLng);
      geocoder.geocode({ location: latLng }, (results, status) => {
        const firstResult = Array.isArray(results) ? results[0] : null;
        const resolvedAddress = status === 'OK' && firstResult?.formatted_address
          ? firstResult.formatted_address
          : `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;

        applyAddress({
          address: resolvedAddress,
          placeId: String(firstResult?.place_id || '').trim(),
          ...coordinates
        });
      });
    };
    reverseGeocodeRef.current = reverseGeocode;

    const mapListener = map.addListener('click', (event) => {
      if (event.latLng) reverseGeocode(event.latLng);
    });

    const dragListener = marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) reverseGeocode(position);
    });

    return () => {
      google.maps.event.removeListener(placeListener);
      google.maps.event.removeListener(mapListener);
      google.maps.event.removeListener(dragListener);
      google.maps.event.clearInstanceListeners(autocomplete);
      google.maps.event.clearInstanceListeners(marker);
      google.maps.event.clearInstanceListeners(map);
      reverseGeocodeRef.current = null;
    };
  }, [mapsReady, onChange]);

  const locateCurrentPosition = useCallback((shouldShowStatus = true) => {
    if (!mapsReady || !window.google?.maps || !reverseGeocodeRef.current) {
      return;
    }

    if (!navigator.geolocation) {
      setLocationMessage('Current location is not supported by this browser.');
      return;
    }

    if (shouldShowStatus) {
      setIsLocating(true);
      setLocationMessage('');
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng = new window.google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        reverseGeocodeRef.current?.(latLng);
        setIsLocating(false);
        setLocationMessage('');
      },
      () => {
        setIsLocating(false);
        setLocationMessage('Allow location access to use your current location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [mapsReady]);

  useEffect(() => {
    if (!mapsReady || didRequestCurrentLocationRef.current) {
      return;
    }

    didRequestCurrentLocationRef.current = true;
    const locateTimer = window.setTimeout(() => {
      locateCurrentPosition(false);
    }, 0);

    return () => {
      window.clearTimeout(locateTimer);
    };
  }, [locateCurrentPosition, mapsReady]);

  const handleManualChange = (event) => {
    onChange({
      address: event.target.value,
      placeId: '',
      latitude: '',
      longitude: ''
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13.5px] font-bold text-[#6B7280]">{label}</label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1EBDB8]" />
        <input
          ref={inputRef}
          name="address"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleManualChange}
          className="w-full bg-[#F5F5F5E5] rounded-[10px] pl-10 pr-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      {loadError && (
        <p className="text-[12px] font-medium text-[#9CA3AF]">{loadError}</p>
      )}

      {hasApiKey && (
        <div className="overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-[#F5F5F5E5]">
          <div ref={mapContainerRef} className="h-[220px] w-full" />
          <div className="flex flex-col gap-2 border-t border-[#E5E7EB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] font-medium text-[#6B7280]">
              Search above, click the map, or drag the pin to set the exact location.
            </p>
            <button
              type="button"
              onClick={() => locateCurrentPosition(true)}
              disabled={!mapsReady || isLocating}
              className="inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-[#1EBDB8]/30 bg-white px-3 py-2 text-[12px] font-bold text-[#1EBDB8] transition-colors hover:bg-[#1EBDB8]/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LocateFixed className="h-3.5 w-3.5" />
              {isLocating ? 'Locating...' : 'Use current location'}
            </button>
          </div>
          {locationMessage && (
            <p className="border-t border-[#E5E7EB] px-3 py-2 text-[12px] font-medium text-[#9CA3AF]">
              {locationMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
