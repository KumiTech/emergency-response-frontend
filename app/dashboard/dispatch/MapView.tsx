"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  OverlayView,
} from "@react-google-maps/api";

const DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0c0e14" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0c0e14" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5a5e6b" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1d28" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a1d28" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#12141c" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1f2233" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#080a10" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#11131a" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a4e5a" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#11131a" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0f1218" }],
  },
];

const TYPE_COLORS: Record<string, string> = {
  crime: "#e24b4a",
  fire: "#ef9f27",
  medical: "#1d9e75",
  accident: "#378add",
  other: "#e24b4a",
};

interface Incident {
  incident_id: string;
  citizen_name: string;
  incident_type: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
}

interface Vehicle {
  vehicle_id: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
  current_lat: number | null;
  current_lng: number | null;
}

interface MapViewProps {
  incidents: Incident[];
  vehicles: Vehicle[];
  selectedId: string | null;
  theme: string;
  onSelectIncident: (id: string) => void;
}

function IncidentMarker({
  color,
  isSelected,
  onClick,
  label,
}: {
  color: string;
  isSelected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{ cursor: "pointer", position: "relative", width: 28, height: 28 }}
    >
      {isSelected && (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: color,
              opacity: 0.4,
              transform: "translate(-50%,-50%)",
              animation: "ping-beacon 1.5s ease-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: color,
              opacity: 0.25,
              transform: "translate(-50%,-50%)",
              animation: "ping-beacon 1.5s ease-out 0.4s infinite",
            }}
          />
        </>
      )}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 10px ${color}88, 0 0 4px ${color}44`,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 28,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          padding: "1px 5px",
          background: `${color}22`,
          color: color,
          borderRadius: 3,
          border: `1px solid ${color}44`,
          whiteSpace: "nowrap",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function MapView({
  incidents,
  vehicles,
  selectedId,
  theme,
  onSelectIncident,
}: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [, setMapReady] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const inc = incidents.find((i) => i.incident_id === selectedId);
    
    if (inc) {
      const targetLat = Number(inc.latitude);
      const targetLng = Number(inc.longitude);
      const targetZoom = 11;
      
      const currentCenter = mapRef.current.getCenter();
      const currentLat = currentCenter?.lat() || targetLat;
      const currentLng = currentCenter?.lng() || targetLng;
      const currentZoom = mapRef.current.getZoom() || 12;

      // Calculate approximate distance to see if it's off-screen
      const distance = Math.sqrt(
        Math.pow(targetLat - currentLat, 2) + Math.pow(targetLng - currentLng, 2)
      );
      const isFar = distance > 0.02; // Roughly 2km apart

      if (isFar && currentZoom > 12) {
        // 1. It's far! Smoothly ZOOM OUT first so we don't teleport
        let zOut = currentZoom;
        const outInterval = setInterval(() => {
          if (zOut <= 12) {
            clearInterval(outInterval);
            
            // 2. Now that we are high up, GLIDE to the new point
            mapRef.current?.panTo({ lat: targetLat, lng: targetLng });
            
            // 3. Wait for the glide to finish, then smoothly ZOOM IN
            setTimeout(() => {
               let zIn = 12;
               const inInterval = setInterval(() => {
                 if (zIn >= targetZoom) {
                   mapRef.current?.setZoom(targetZoom);
                   clearInterval(inInterval);
                 } else {
                   zIn += 0.2;
                   mapRef.current?.setZoom(zIn);
                 }
               }, 20);
            }, 700); // 700ms glide duration
            
          } else {
            zOut -= 0.4; // Zoom out speed
            mapRef.current?.setZoom(zOut);
          }
        }, 20);
      } else {
         // They are close! Normal glide and zoom.
         mapRef.current.panTo({ lat: targetLat, lng: targetLng });
         
         if (currentZoom !== targetZoom) {
           let zIn = currentZoom;
           const step = currentZoom < targetZoom ? 0.2 : -0.2;
           setTimeout(() => {
              const inInterval = setInterval(() => {
                if ((step > 0 && zIn >= targetZoom) || (step < 0 && zIn <= targetZoom)) {
                  mapRef.current?.setZoom(targetZoom);
                  clearInterval(inInterval);
                } else {
                  zIn += step;
                  mapRef.current?.setZoom(zIn);
                }
              }, 20);
           }, 400);
         }
      }
    }
  }, [selectedId, incidents]);

  if (!isLoaded) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        Loading map…
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={{ lat: 5.6037, lng: -0.187 }}
      zoom={12}
      onLoad={onLoad}
      options={{
        styles: theme === "dark" ? DARK_STYLE : [],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }}
    >
      {incidents
        .filter((i) => i.status !== "resolved")
        .map((inc) => (
          <OverlayView
            key={inc.incident_id}
            position={{ lat: Number(inc.latitude), lng: Number(inc.longitude) }}

            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <IncidentMarker
              color={TYPE_COLORS[inc.incident_type] || TYPE_COLORS.other}
              isSelected={inc.incident_id === selectedId}
              onClick={() => onSelectIncident(inc.incident_id)}
              label={inc.incident_id.slice(0, 8)}
            />
          </OverlayView>
        ))}

      {vehicles
        .filter(
          (v) => v.status === "dispatched" && v.current_lat && v.current_lng
        )
        .map((v) => (
          <OverlayView
            key={v.vehicle_id}
            position={{ lat: Number(v.current_lat), lng: Number(v.current_lng) }}

            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#378add",
                border: "2px solid #fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
              }}
            >
              🚐
            </div>
          </OverlayView>
        ))}
    </GoogleMap>
  );
}
