import { useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const watchLocation = useCallback((callback) => {
    if (!navigator.geolocation) return null;
    return navigator.geolocation.watchPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(loc);
        if (callback) callback(loc);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );
  }, []);

  const clearWatch = useCallback((watchId) => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error, loading, getLocation, watchLocation, clearWatch };
};