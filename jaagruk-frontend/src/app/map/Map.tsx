"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { CATEGORY_META, ComplaintCategory, ComplaintStatus } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";

// Helper to center the map when the city changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MapProps {
  issues: any[];
  selectedCity: string;
  selectedComplaint: any | null;
  setSelectedComplaint: (complaint: any | null) => void;
}

const getMarkerIcon = (category: string, isSelected: boolean) => {
  const colors: Record<string, string> = {
    pothole: "#ef4444",          // red
    "water-leakage": "#3b82f6",  // blue
    streetlight: "#eab308",      // yellow
    garbage: "#22c55e",          // green
    electrical: "#f97316",       // orange
    other: "#6b7280"             // grey
  };
  
  const colorsBackend: Record<string, string> = {
    POTHOLE: "#ef4444",
    DAMAGED_ROAD: "#ef4444",
    WATER_LEAKAGE: "#3b82f6",
    BROKEN_LIGHT: "#eab308",
    GARBAGE: "#22c55e",
    OTHER: "#6b7280"
  };

  const color = colorsBackend[category] || colors[category.toLowerCase().replace(/_/g, "-")] || "#6b7280";
  const size = isSelected ? 36 : 28;
  
  const svgHtml = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
            fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="9" r="3" fill="#ffffff"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgHtml,
    className: "custom-leaflet-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

function SeverityDots({ severity }: { severity: number }) {
  return (
    <div className="flex items-center gap-1 my-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={`w-2.5 h-2.5 rounded-full border ${
            dot <= severity ? "bg-red-500 border-red-500" : "bg-transparent border-gray-400"
          }`}
        />
      ))}
      <span className="text-[10px] font-semibold text-gray-500 ml-1 font-mono">Sev {severity}/5</span>
    </div>
  );
}

function mapBackendCategory(category: string): ComplaintCategory {
  const c = (category || "").toLowerCase().replace(/_/g, "-");
  if (c === "damaged-road") return "pothole";
  if (c === "broken-light") return "streetlight";
  if (["pothole", "water-leakage", "streetlight", "garbage", "electrical", "drainage", "other"].includes(c)) {
    return c as ComplaintCategory;
  }
  return "other";
}

function mapBackendStatus(status: string): ComplaintStatus {
  const s = (status || "").toLowerCase().replace(/_/g, "-");
  if (s === "open" || s === "submitted") return "submitted";
  if (s === "in-progress") return "in-progress";
  if (s === "resolved") return "resolved";
  if (s === "rejected") return "rejected";
  return "submitted";
}

export default function Map({
  issues,
  selectedCity,
  selectedComplaint,
  setSelectedComplaint,
}: MapProps) {
  // City coordinate mappings for center focus
  const cityCenters: Record<string, [number, number]> = {
    Bangalore: [12.9716, 77.5946],
    Mumbai: [19.0760, 72.8777],
    Delhi: [28.6139, 77.2090]
  };

  const center = cityCenters[selectedCity] || [19.0760, 72.8777];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
      >
        <ChangeView center={center} zoom={12} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {issues.map((issue) => {
          const isSelected = selectedComplaint?.id === String(issue.id);
          const mappedCat = mapBackendCategory(issue.category);
          const mappedStatus = mapBackendStatus(issue.status);
          const meta = CATEGORY_META[mappedCat];
          const lat = issue.location?.lat ?? issue.lat;
          const lng = issue.location?.lng ?? issue.lng;
          const imageUrl = issue.imageUrl ?? issue.image_url;

          if (lat == null || lng == null) return null;

          return (
            <Marker
              key={issue.id}
              position={[lat, lng]}
              icon={getMarkerIcon(issue.category, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedComplaint({
                    ...issue,
                    id: String(issue.id),
                    imageUrl: imageUrl,
                    title: issue.title || (issue.description ? issue.description.split("\n\n")[0] : "Civic Grievance"),
                    category: mappedCat,
                    status: mappedStatus,
                    location: {
                      address: issue.location?.address || issue.address || "Unknown Address",
                      city: selectedCity,
                      lat,
                      lng
                    }
                  });
                },
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
