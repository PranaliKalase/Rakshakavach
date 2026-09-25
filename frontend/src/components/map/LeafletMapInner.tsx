"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';
import { ArrowRight, Flame, Layers } from 'lucide-react';
import { getProjectCoordinates, INDIA_CENTER, DEFAULT_ZOOM } from '@/lib/map-utils';

interface LeafletMapInnerProps {
  projects: Project[];
  center?: [number, number];
  zoom?: number;
  totalProjectsCount?: number;
}

// Thermal gradient requested in prompt
const THERMAL_GRADIENT = {
  0.2: "#4ade80",   // green
  0.4: "#84cc16",   // lime
  0.6: "#facc15",   // yellow
  0.8: "#fb923c",   // orange
  1.0: "#ef4444"    // red
};

export default function LeafletMapInner({ 
  projects, 
  center = INDIA_CENTER, 
  zoom = DEFAULT_ZOOM,
  totalProjectsCount
}: LeafletMapInnerProps) {
  const [mounted, setMounted] = useState(false);
  const [LeafletModules, setLeafletModules] = useState<any>(null);
  
  // Layer Toggles
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    let isSubscribed = true;

    async function initLeaflet() {
      try {
        const [reactLeaflet, leafletModule, clusterModule] = await Promise.all([
          import('react-leaflet'),
          import('leaflet'),
          import('react-leaflet-cluster')
        ]);

        const L = leafletModule.default || leafletModule;

        if (typeof window !== 'undefined') {
          (window as any).L = L;
          window.L = L;
        }

        try {
          await import('leaflet.heat' as any);
        } catch (heatErr) {
          console.warn("Leaflet.heat module failed to load:", heatErr);
        }

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

        if (isSubscribed) {
          setLeafletModules({
            L,
            MapContainer: reactLeaflet.MapContainer,
            TileLayer: reactLeaflet.TileLayer,
            Marker: reactLeaflet.Marker,
            Popup: reactLeaflet.Popup,
            useMap: reactLeaflet.useMap,
            MarkerClusterGroup,
            getMarkerIcon
          });
        }
      } catch (err) {
        console.error("Leaflet client load error:", err);
      }
    }

    initLeaflet();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Compute Heatmap Points from real project data
  const heatPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    projects.forEach((p, idx) => {
      const pAny = p as any;
      const prio = String(p.priority || pAny.verification_priority || '').toUpperCase();
      const trust = p.trustScore ?? pAny.trust_score ?? 100;
      
      let weight = 0;
      if (prio.includes('HIGH') || trust < 60) {
        weight = 1.0;
      } else if (prio.includes('ATTENTION') || prio.includes('MEDIUM') || trust < 80) {
        weight = 0.4;
      }

      if (weight > 0) {
        const coords = getProjectCoordinates(p, idx);
        points.push([coords[0], coords[1], weight]);
      }
    });

    return points;
  }, [projects]);

  const highPriorityCount = useMemo(() => {
    return projects.filter(p => {
      const prio = String(p.priority || (p as any).verification_priority || '').toUpperCase();
      return prio.includes('HIGH') || (p.trustScore && p.trustScore < 75);
    }).length;
  }, [projects]);

  // Console audit logging for thermal heatmap validation
  useEffect(() => {
    if (mounted) {
      console.log("=== RAKSHKAVACH THERMAL HEATMAP AUDIT ===");
      console.log(`Total Projects Loaded: ${totalProjectsCount || projects.length}`);
      console.log(`Projects With Coordinates: ${projects.length}`);
      console.log(`High Priority Projects: ${highPriorityCount}`);
      console.log(`Heatmap Points Generated: ${heatPoints.length}`);
      console.log(`Markers Rendered: ${showMarkers ? projects.length : 0}`);
      console.log(`Filtered Projects: ${projects.length}`);
      console.log(`Heatmap Active: ${showHeatmap ? 'YES' : 'NO'}`);
    }
  }, [mounted, projects, highPriorityCount, heatPoints, showMarkers, showHeatmap, totalProjectsCount]);

  if (!mounted || !LeafletModules) {
    return (
      <div className="w-full h-[520px] bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-8 text-slate-500">
        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <span className="text-xs font-bold text-slate-700">Loading India Project Intelligence Map...</span>
      </div>
    );
  }

  const { L, MapContainer, TileLayer, Marker, Popup, useMap, MarkerClusterGroup, getMarkerIcon } = LeafletModules;

  // React Leaflet Map Controller Component
  function MapController({ centerPos, zoomLevel }: { centerPos: [number, number]; zoomLevel: number }) {
    const map = useMap();
    useEffect(() => {
      if (map) {
        map.setView(centerPos, zoomLevel);
      }
    }, [map, centerPos, zoomLevel]);
    return null;
  }

  // React Leaflet Heatmap Layer Wrapper Component
  function HeatmapOverlay({ points }: { points: [number, number, number][] }) {
    const map = useMap();

    useEffect(() => {
      if (!map || !L || !(L as any).heatLayer) return;

      const heatInstance = (L as any).heatLayer(points, {
        radius: 28,
        blur: 18,
        maxZoom: 16,
        max: 1.0,
        minOpacity: 0.35,
        gradient: THERMAL_GRADIENT
      });

      heatInstance.addTo(map);

      return () => {
        try {
          map.removeLayer(heatInstance);
        } catch (e) {}
      };
    }, [map, points]);

    return null;
  }

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* MAP LAYER CONTROLS TOGGLE OVERLAY */}
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-3 text-xs font-bold text-slate-800">
        <div 
          className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors" 
          onClick={() => setShowMarkers(!showMarkers)}
        >
          <input 
            type="checkbox" 
            checked={showMarkers} 
            onChange={() => {}} 
            className="rounded text-blue-600 cursor-pointer" 
          />
          <span>Project Markers</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div 
          className="flex items-center gap-1.5 cursor-pointer hover:text-red-600 transition-colors" 
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          <input 
            type="checkbox" 
            checked={showHeatmap} 
            onChange={() => {}} 
            className="rounded text-red-600 cursor-pointer" 
          />
          <Flame className="w-3.5 h-3.5 text-red-500" />
          <span>High Risk Heatmap</span>
        </div>
      </div>

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

        {/* THERMAL HEATMAP OVERLAY LAYER (UNDERNEATH MARKERS) */}
        {showHeatmap && heatPoints.length > 0 && (
          <HeatmapOverlay points={heatPoints} />
        )}

        {/* CLUSTERED PROJECT MARKERS LAYER (ABOVE HEATMAP) */}
        {showMarkers && (
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
                  box-shadow: 0 4px 10px rgba(0,0,0,0.35);
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
                  {/* PROJECT POPUP */}
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
        )}
      </MapContainer>

      {/* LEGEND OVERLAY (MARKER + THERMAL RISK HEATMAP GRADIENT) */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-2 max-w-[320px]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
          Geospatial Risk Legend & Thermal Layer
        </span>
        
        {/* Priority Markers Legend */}
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
        </div>

        {/* Heat Intensity Scale Legend */}
        {showHeatmap && (
          <div className="pt-2 border-t border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-500" />
                <span>Heat Intensity</span>
              </span>
              <span className="text-red-600">High Risk Cluster</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden flex shadow-inner border border-slate-200">
              <div className="w-1/5 h-full bg-[#4ade80]" title="Low Risk" />
              <div className="w-1/5 h-full bg-[#84cc16]" title="Moderate" />
              <div className="w-1/5 h-full bg-[#facc15]" title="Medium Risk" />
              <div className="w-1/5 h-full bg-[#fb923c]" title="Elevated Risk" />
              <div className="w-1/5 h-full bg-[#ef4444]" title="High Risk Hotspot" />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400">
              <span>Green (Low)</span>
              <span>Yellow (Medium)</span>
              <span>Red (Hotspot)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
