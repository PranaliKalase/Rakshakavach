"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';
import { ArrowRight, Flame, ShieldAlert, Layers } from 'lucide-react';
import { getProjectCoordinates, INDIA_CENTER, DEFAULT_ZOOM } from '@/lib/map-utils';

interface LeafletMapInnerProps {
  projects: Project[];
  center?: [number, number];
  zoom?: number;
  showHotspotsToggle?: boolean;
}

export default function LeafletMapInner({ 
  projects, 
  center = INDIA_CENTER, 
  zoom = DEFAULT_ZOOM,
  showHotspotsToggle = true
}: LeafletMapInnerProps) {
  const [mounted, setMounted] = useState(false);
  const [LeafletModules, setLeafletModules] = useState<any>(null);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
      import('react-leaflet-cluster'),
      import('leaflet/dist/leaflet.css' as any)
    ]).then(([reactLeaflet, leafletModule, clusterModule]) => {
      const L = leafletModule.default || leafletModule;
      const MarkerClusterGroup = clusterModule.default || clusterModule;

      const getMarkerIcon = (priorityStr: string) => {
        const pUpper = String(priorityStr || '').toUpperCase();
        let color = '#10B981'; // Green (NORMAL)
        let ringColor = 'rgba(16, 185, 129, 0.35)';

        if (pUpper.includes('HIGH')) {
          color = '#EF4444'; // Red (HIGH_PRIORITY)
          ringColor = 'rgba(239, 68, 68, 0.5)';
        } else if (pUpper.includes('ATTENTION') || pUpper.includes('MEDIUM')) {
          color = '#F59E0B'; // Amber (ATTENTION)
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
              box-shadow: 0 2px 6px rgba(0,0,0,0.35);
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

      setLeafletModules({
        L,
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        Popup: reactLeaflet.Popup,
        Circle: reactLeaflet.Circle,
        useMap: reactLeaflet.useMap,
        MarkerClusterGroup,
        getMarkerIcon
      });
    }).catch(err => console.error("Leaflet client load error:", err));
  }, []);

  // Compute District Hotspots for Risk Visualization Overlay
  const districtHotspots = useMemo(() => {
    const distMap: Record<string, { district: string; center: [number, number]; total: number; highPriority: number; trustSum: number }> = {};
    projects.forEach((p, idx) => {
      const pAny = p as any;
      const dName = p.districtName || p.districtId || p.district || pAny.district_name || "District";
      const coords = getProjectCoordinates(p, idx);
      if (!distMap[dName]) {
        distMap[dName] = { district: dName, center: coords, total: 0, highPriority: 0, trustSum: 0 };
      }
      distMap[dName].total += 1;
      const prio = String(p.priority || pAny.verification_priority || '').toUpperCase();
      if (prio.includes('HIGH') || (p.trustScore && p.trustScore < 75)) {
        distMap[dName].highPriority += 1;
      }
      distMap[dName].trustSum += (p.trustScore ?? pAny.trust_score ?? 85);
    });

    return Object.values(distMap).map(d => {
      const avgTrust = d.total > 0 ? d.trustSum / d.total : 100;
      let color = '#10B981'; // Green (Trust > 80)
      if (avgTrust < 60 || d.highPriority > 0) {
        color = '#EF4444'; // Red (Trust < 60 or high risk present)
      } else if (avgTrust <= 80) {
        color = '#F59E0B'; // Yellow (Trust 60-80)
      }

      return {
        ...d,
        avgTrust: avgTrust.toFixed(1),
        color,
        radius: Math.min(35000, 10000 + d.total * 3000)
      };
    });
  }, [projects]);

  if (!mounted || !LeafletModules) {
    return (
      <div className="w-full h-[520px] bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-8 text-slate-500">
        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <span className="text-xs font-bold text-slate-700">Loading India Project Intelligence Map...</span>
      </div>
    );
  }

  const { L, MapContainer, TileLayer, Marker, Popup, Circle, useMap, MarkerClusterGroup, getMarkerIcon } = LeafletModules;

  function MapController({ centerPos, zoomLevel }: { centerPos: [number, number]; zoomLevel: number }) {
    const map = useMap();
    useEffect(() => {
      if (map) {
        map.setView(centerPos, zoomLevel);
      }
    }, [map, centerPos, zoomLevel]);
    return null;
  }

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* MAP CONTROLS OVERLAY (RISK ZONES TOGGLE) */}
      {showHotspotsToggle && (
        <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-md flex items-center gap-2 text-xs font-bold text-slate-800">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Risk Zones</span>
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`ml-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${
              showHotspots ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {showHotspots ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapController centerPos={center} zoomLevel={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | RAKSHKAVACH'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* STEP 7: INDIA RISK HOTSPOT LAYER */}
        {showHotspots && districtHotspots.map((spot) => (
          <Circle
            key={`hotspot-${spot.district}`}
            center={spot.center}
            radius={spot.radius}
            pathOptions={{
              color: spot.color,
              fillColor: spot.color,
              fillOpacity: 0.18,
              weight: 1.5,
              dashArray: '4, 4'
            }}
          />
        ))}

        {/* STEP 5: CLUSTERED PROJECT MARKERS */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster: any) => {
            const childMarkers = cluster.getAllChildMarkers();
            const count = childMarkers.length;
            
            return L.divIcon({
              html: `<div style="
                background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
                color: #ffffff;
                font-weight: 800;
                font-size: 11px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                border: 2px solid #ffffff;
              ">
                <span>${count}</span>
              </div>`,
              className: 'custom-leaflet-cluster-icon',
              iconSize: L.point(36, 36, true),
            });
          }}
        >
          {projects.map((p, idx) => {
            const pAny = p as any;
            const coords = getProjectCoordinates(p, idx);
            const priority = p.priority || pAny.verification_priority || 'NORMAL';
            const icon = getMarkerIcon(priority);
            const pUpper = String(priority).toUpperCase();

            return (
              <Marker key={p.id || idx} position={coords} icon={icon}>
                {/* STEP 6: PROJECT POPUP */}
                <Popup>
                  <div className="p-3 font-sans space-y-2 bg-white text-slate-800 max-w-[280px]">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {p.projectCode || pAny.project_code || p.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        pUpper.includes('HIGH')
                          ? 'bg-red-100 text-red-700' 
                          : pUpper.includes('ATTENTION') || pUpper.includes('MEDIUM')
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {String(priority).replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight line-clamp-2">
                        {p.workName || pAny.work_name || pAny.title || 'MPLADS Project Work'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {p.districtName || p.districtId || p.district || 'District'}, {p.state || 'Maharashtra'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Constituency: {p.constituencyName || p.constituencyId || pAny.constituency_name || 'C001'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Physical</span>
                        <span className="font-bold text-slate-800">{p.physicalProgress ?? pAny.physical_progress ?? 0}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Financial</span>
                        <span className="font-bold text-slate-800">{p.financialProgress ?? pAny.financial_progress ?? 0}%</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] pt-1 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Trust Score:</span>
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {p.trustScore ? p.trustScore.toFixed(1) : (pAny.trust_score ? pAny.trust_score : '95.0')} / 100
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>Recommended By:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[130px]">{p.mpName || pAny.mp_name || 'Hon\'ble MP'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>Status:</span>
                        <span className="font-bold text-emerald-700">{p.status || 'SANCTIONED'}</span>
                      </div>
                    </div>

                    <div className="pt-1.5">
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
        </MarkerClusterGroup>
      </MapContainer>

      {/* MAP LEGEND OVERLAY */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
          Geospatial Risk Legend (India)
        </span>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-700">
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
            <span>Risk Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
