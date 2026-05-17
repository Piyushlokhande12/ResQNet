import { useEffect, useRef } from "react";

export default function EmergencyMap({
  victimLocation,
  responderLocation,
  nearbyServices = [],
  height = 400,
}) {
  const mapRef     = useRef(null); // DOM element
  const leafletRef = useRef(null); // L.map instance
  const markersRef = useRef({});

  // ── Bootstrap Leaflet dynamically (avoids SSR / Vite CSS issues) ──────────
  useEffect(() => {
    if (leafletRef.current) return; // already initialized

    // Inject Leaflet CSS via <link> tag — most reliable method in Vite
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Dynamically import Leaflet so CSS is guaranteed loaded first
    import("leaflet").then((L) => {
      const Leaflet = L.default;

      if (!mapRef.current || leafletRef.current) return;

      // Fix broken default icons in Vite/Webpack
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center = victimLocation
        ? [victimLocation.lat, victimLocation.lng]
        : [22.7196, 75.8577]; // fallback: Indore

      const map = Leaflet.map(mapRef.current, {
        center,
        zoom: 15,
        zoomControl: true,
      });

      // ── Tile layer: OpenStreetMap (light, free, no key) ──────────────────
      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletRef.current = map;

      // Add markers now that map is ready
      addVictimMarker(Leaflet, map, victimLocation);
      addResponderMarker(Leaflet, map, responderLocation);
      addServiceMarkers(Leaflet, map, nearbyServices);
    });

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
        markersRef.current = {};
      }
    };
  }, []); // run once

  // ── Helper: create colored circle marker ──────────────────────────────────
  const makeIcon = (L, color, label) =>
    L.divIcon({
      className: "",
      html: `
        <div style="position:relative;">
          <div style="
            width:18px;height:18px;border-radius:50% 50% 50% 0;
            background:${color};border:2px solid white;
            transform:rotate(-45deg);
            box-shadow:0 2px 6px rgba(0,0,0,0.35);
          "></div>
          <div style="
            position:absolute;top:-22px;left:50%;transform:translateX(-50%);
            background:${color};color:white;font-size:9px;font-weight:700;
            padding:2px 5px;border-radius:3px;white-space:nowrap;
          ">${label}</div>
        </div>`,
      iconSize:   [18, 18],
      iconAnchor: [9, 18],
      popupAnchor:[0, -22],
    });

  const addVictimMarker = (L, map, loc) => {
    if (!loc) return;
    const latlng = [loc.lat, loc.lng];

    if (markersRef.current.victim) {
      markersRef.current.victim.setLatLng(latlng);
    } else {
      markersRef.current.victim = L.marker(latlng, { icon: makeIcon(L, "#e53e3e", "You") })
        .addTo(map)
        .bindPopup(`<b style="color:#e53e3e">🚨 Your Location</b><br/><small>${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}</small>`);

      // Pulsing circle
      markersRef.current.victimCircle = L.circle(latlng, {
        radius: 60, color: "#e53e3e",
        fillColor: "#e53e3e", fillOpacity: 0.12, weight: 1,
      }).addTo(map);
    }
  };

  const addResponderMarker = (L, map, loc) => {
    if (!loc) return;
    const latlng = [loc.lat, loc.lng];
    if (markersRef.current.responder) {
      markersRef.current.responder.setLatLng(latlng);
    } else {
      markersRef.current.responder = L.marker(latlng, { icon: makeIcon(L, "#3182ce", "Responder") })
        .addTo(map)
        .bindPopup(`<b style="color:#3182ce">🚑 Responder</b><br/><small>En route to you</small>`);
    }
  };

  const addServiceMarkers = (L, map, services) => {
    (markersRef.current.services || []).forEach((m) => m.remove());
    markersRef.current.services = [];
    services.forEach((s) => {
      const m = L.marker([s.location.lat, s.location.lng], { icon: makeIcon(L, "#38a169", s.name.slice(0, 10)) })
        .addTo(map)
        .bindPopup(`
          <b style="color:#38a169">${s.name}</b><br/>
          <small>${s.address || ""}</small><br/>
          ${s.rating ? `<small>⭐ ${s.rating}</small><br/>` : ""}
          <a href="https://maps.google.com/?q=${s.location.lat},${s.location.lng}" target="_blank" style="color:#3182ce;font-size:12px">Open in Google Maps</a>
        `);
      markersRef.current.services.push(m);
    });
  };

  // ── Reactively update victim marker when location changes ─────────────────
  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !victimLocation) return;
    import("leaflet").then((L) => {
      const Leaflet = L.default;
      const latlng  = [victimLocation.lat, victimLocation.lng];

      if (markersRef.current.victim) {
        markersRef.current.victim.setLatLng(latlng);
        markersRef.current.victimCircle?.setLatLng(latlng);
      } else {
        addVictimMarker(Leaflet, map, victimLocation);
      }
      map.setView(latlng, 15);
    });
  }, [victimLocation]);

  // ── Reactively update responder marker ───────────────────────────────────
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    import("leaflet").then((L) => {
      const Leaflet = L.default;
      if (responderLocation) {
        addResponderMarker(Leaflet, map, responderLocation);
      } else if (markersRef.current.responder) {
        markersRef.current.responder.remove();
        delete markersRef.current.responder;
      }
    });
  }, [responderLocation]);

  // ── Reactively update service markers ────────────────────────────────────
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    import("leaflet").then((L) => {
      const Leaflet = L.default;
      addServiceMarkers(Leaflet, map, nearbyServices);
      if (nearbyServices.length > 0 && victimLocation) {
        const bounds = [
          [victimLocation.lat, victimLocation.lng],
          ...nearbyServices.map((s) => [s.location.lat, s.location.lng]),
        ];
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });
  }, [nearbyServices]);

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
      {/* Map container */}
      <div ref={mapRef} style={{ width: "100%", height, zIndex: 1 }} />

      {/* Legend overlay */}
      <div style={{
        position: "absolute", bottom: 28, left: 10, zIndex: 1000,
        background: "rgba(255,255,255,0.92)",
        borderRadius: 8, padding: "6px 10px",
        display: "flex", flexDirection: "column", gap: 4,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        pointerEvents: "none",
      }}>
        {victimLocation && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e53e3e" }} />
            <span style={{ color: "#333" }}>Your Location</span>
          </div>
        )}
        {responderLocation && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3182ce" }} />
            <span style={{ color: "#333" }}>Responder</span>
          </div>
        )}
        {nearbyServices.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#38a169" }} />
            <span style={{ color: "#333" }}>Nearby Services</span>
          </div>
        )}
      </div>
    </div>
  );
}