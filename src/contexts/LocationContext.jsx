import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export function useUserLocation() {
  return useContext(LocationContext);
}

export function LocationProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const requestGPS = (forceReal = false) => {
    setIsLoadingLocation(true);
    setLocationError("");
    
    if (demoMode && !forceReal) {
      setUserLocation({ lat: 19.0441, lng: 73.0255, acc: 10, timestamp: Date.now(), source: 'demo' });
      setIsLoadingLocation(false);
      return;
    }
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLoadingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy,
          timestamp: pos.timestamp,
          source: 'gps'
        });
        setIsLoadingLocation(false);
      },
      (err) => {
        let msg = "Unable to access your location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please enable location access in Chrome and click \"Use My Location\" again.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location information is unavailable.";
        } else if (err.code === err.TIMEOUT) {
          msg = "The request to get user location timed out.";
        }
        setLocationError(msg);
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // If demoMode is toggled, update immediately
  useEffect(() => {
    if (demoMode) requestGPS();
  }, [demoMode]);

  return (
    <LocationContext.Provider value={{
      userLocation,
      locationError,
      isLoadingLocation,
      demoMode,
      setDemoMode,
      requestGPS
    }}>
      {children}
    </LocationContext.Provider>
  );
}
