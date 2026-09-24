"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';
import { ArrowRight } from 'lucide-react';
import { getProjectCoordinates } from '@/lib/map-utils';

interface LeafletMapInnerProps {
  projects: Project[];
  center: [number, number];
}

export default function LeafletMapInner({ projects, center }: LeafletMapInnerProps) {
  const [mounted, setMounted] = useState(false);
  const [LeafletComponents, setLeafletComponents] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
      import('leaflet/dist/leaflet.css' as any)
    ]).then(([reactLeaflet, leafletModule]) => {
      const L = leafletModule.default || leafletModule;

      const getMarkerIcon = (priority: string) => {
        let color = '#10B981'; // GREEN (NORMAL)
        let ringColor = 'rgba(16, 185, 129, 0.35)';
        if (priority === 'HIGH_PRIORITY' || priority === 'HIGH') {
          color = '#EF4444'; // RED (HIGH_PRIORITY)
          ringColor = 'rgba(239, 68, 68, 0.5)';
        } else if (priority === 'ATTENTION' || priority === 'MEDIUM') {
          color = '#F59E0B'; // AMBER (ATTENTION)
          ringColor = 'rgba(245, 158, 11, 0.4)';
        }

        const html = `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background-color: ${ringColor};
              animation: leaflet-pulse 2s infinite ease-in-out;
            "></div>
            <div style="
              position: relative;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background-color: ${color};
              border: 2px solid #ffffff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
          </div>
        `;

        return L.divIcon({
          html: html,
          className: 'custom-leaflet-marker-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });
      };

      setLeafletComponents({
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        Popup: reactLeaflet.Popup,
        Circle: reactLeaflet.Circle,
        useMap: reactLeaflet.useMap,
        getMarkerIcon
      });
    }).catch(err => console.error("Leaflet client load error:", err));
  }, []);

  if (!mounted || !LeafletComponents) {
    return (
      <div className="w-full h-[520px] bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-8 text-slate-500">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <span className="text-xs font-bold text-slate-700">Loading Geospatial Engine...</span>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle, useMap, getMarkerIcon } = LeafletComponents;

  function MapRecenter() {
    const map = useMap();
    useEffect(() => {
      if (map && center) {
        map.setView(center, map.getZoom());
      }
    }, [map]);
    return null;
  }

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer 
        center={center} 
        zoom={9} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapRecenter />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* RISK HOTSPOT VISUALIZATION: CIRCLE GLOW OVER HIGH_PRIORITY CLUSTERS */}
        {projects.map((p, idx) => {
          const coords = getProjectCoordinates(p, idx);
          const priority = p.priority || 'NORMAL';
          if (priority === 'HIGH_PRIORITY' || (p.trustScore && p.trustScore < 75)) {
            return (
              <Circle
                key={`hotspot-${p.id}`}
                center={coords}
                radius={9000}
                pathOptions={{
                  color: '#EF4444',
                  fillColor: '#EF4444',
                  fillOpacity: 0.18,
                  weight: 1.5,
                  dashArray: '4, 4'
                }}
              />
            );
          }
          return null;
        })}

        {/* MAP MARKERS FOR ALL FILTERED PROJECTS */}
        {projects.map((p, idx) => {
          const coords = getProjectCoordinates(p, idx);
          const priority = p.priority || 'NORMAL';
          const icon = getMarkerIcon(priority);

          return (
            <Marker key={p.id} position={coords} icon={icon}>
              <Popup>
                <div className="p-3 font-sans space-y-2 bg-white text-slate-800">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {p.projectCode || p.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      priority === 'HIGH_PRIORITY' 
                        ? 'bg-red-100 text-red-700' 
                        : priority === 'ATTENTION' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {priority.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight line-clamp-2">
                      {p.workName}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {p.districtName || p.districtId || p.district} • {p.constituencyName || p.constituencyId}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Physical Prog.</span>
                      <span className="font-bold text-slate-800">{p.physicalProgress}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Financial Prog.</span>
                      <span className="font-bold text-slate-800">{p.financialProgress}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Trust Score:</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {p.trustScore ? p.trustScore.toFixed(1) : '95.0'} / 100
                    </span>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={`/projects/${p.id}`}
                      className="w-full inline-flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 rounded-lg transition-colors shadow-2xs"
                    >
                      <span>View Project</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* MAP LEGEND OVERLAY */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
          Geospatial Risk Legend
        </span>
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-2xs"></span>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-2xs"></span>
            <span>Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-2xs"></span>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></span>
            <span>Risk Hotspot</span>
          </div>
        </div>
      </div>
    </div>
  );
}
