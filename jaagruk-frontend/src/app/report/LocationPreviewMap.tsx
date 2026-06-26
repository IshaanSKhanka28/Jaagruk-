"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface LocationPreviewMapProps {
  lat: number;
  lng: number;
  address: string;
}

// Custom SVG pin — avoids Leaflet's default marker-icon bundling issue
const pinIcon = L.divIcon({
  html: `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
            fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="9" r="3" fill="#ffffff"/>
    </svg>
  `,
  className: "custom-leaflet-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function LocationPreviewMap({ lat, lng, address }: LocationPreviewMapProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 mt-4">
      <MapContainer
        // key forces a re-center when coordinates change
        key={`${lat},${lng}`}
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        attributionControl={false}
        style={{ height: "200px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} icon={pinIcon}>
          {address && <Popup>{address}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
}
