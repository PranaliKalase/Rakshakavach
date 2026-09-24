"use client";

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { fetchProjects } from '@/lib/api';
import { Project, VerificationPriority } from '@/types/project';
import { getProjectCoordinates } from '@/lib/map-utils';
import { 
  FolderKanban, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2, 
  Filter, 
  MapPin, 
  BarChart3, 
  BrainCircuit, 
  ArrowRight,
  RefreshCw,
  Search
} from 'lucide-react';

// Dynamic import of Leaflet inner component to ensure SSR safety in Next.js App Router
const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-8 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
      <span className="text-sm font-bold text-slate-700">Loading Project Intelligence Map...</span>
      <span className="text-xs text-slate-400 mt-1">Initializing OpenStreetMap & Leaflet Geospatial Engine</span>
    </div>
  )
});

interface ProjectMapProps {
  initialProjects?: Project[];
  projects?: Project[];
}

export const ProjectMap: React.FC<ProjectMapProps> = ({ initialProjects, projects: propProjects }) => {
  const initialData = propProjects || initialProjects;
  const [allProjects, setAllProjects] = useState<Project[]>(initialData || []);
  const [loading, setLoading] = useState<boolean>(!initialData || initialData.length === 0);
  const [error, setError] = useState<boolean>(false);

  // Filters State
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  // Load live data from API
  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await fetchProjects(1000);
      setAllProjects(data || []);
    } catch (err) {
      console.error("Failed to load live map data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propProjects && propProjects.length > 0) {
      setAllProjects(propProjects);
      setLoading(false);
    } else if (!initialProjects || initialProjects.length === 0) {
      loadData();
    }
  }, [propProjects, initialProjects]);

  // Dynamic filter options derived from dataset
  const statesList = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach(p => {
      if (p.state) set.add(p.state);
      else set.add('Maharashtra');
    });
    return Array.from(set).sort();
  }, [allProjects]);

  const districtsList = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach(p => {
      const pState = p.state || 'Maharashtra';
      if (selectedState === 'ALL' || pState === selectedState) {
        const dName = p.districtName || p.districtId || p.district;
        if (dName) set.add(dName);
      }
    });
    return Array.from(set).sort();
  }, [allProjects, selectedState]);

  const sectorsList = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach(p => {
      if (p.sector) set.add(p.sector);
    });
    return Array.from(set).sort();
  }, [allProjects]);

  // Filtered projects list based on dropdown selections
  const filteredProjects = useMemo(() => {
    return allProjects.filter(p => {
      const pState = p.state || 'Maharashtra';
      const pDistrict = p.districtName || p.districtId || p.district || '';
      const pPriority = p.priority || 'NORMAL';

      if (selectedState !== 'ALL' && pState !== selectedState) return false;
      if (selectedDistrict !== 'ALL' && pDistrict !== selectedDistrict) return false;
      if (selectedPriority !== 'ALL' && pPriority !== selectedPriority) return false;
      if (selectedSector !== 'ALL' && p.sector !== selectedSector) return false;

      return true;
    });
  }, [allProjects, selectedState, selectedDistrict, selectedPriority, selectedSector]);

  // Calculate live map center based on filtered projects
  const mapCenter = useMemo<[number, number]>(() => {
    if (filteredProjects.length === 0) return [19.7515, 75.7139]; // Default MH center
    let totalLat = 0;
    let totalLng = 0;
    filteredProjects.forEach((p, idx) => {
      const [lat, lng] = getProjectCoordinates(p, idx);
      totalLat += lat;
      totalLng += lng;
    });
    return [totalLat / filteredProjects.length, totalLng / filteredProjects.length];
  }, [filteredProjects]);

  // KPI calculations derived from live data
  const totalCount = filteredProjects.length;
  const attentionCount = filteredProjects.filter(p => p.priority === 'ATTENTION').length;
  const highPriorityCount = filteredProjects.filter(p => p.priority === 'HIGH_PRIORITY' || (p.trustScore && p.trustScore < 75)).length;
  const avgTrustScore = totalCount > 0 
    ? (filteredProjects.reduce((sum, p) => sum + (p.trustScore ?? 85), 0) / totalCount).toFixed(1)
    : '0.0';

  // District Risk Analytics Table calculation (Sorted highest risk first)
  const districtAnalytics = useMemo(() => {
    const distMap: Record<string, { district: string; total: number; attention: number; highPriority: number; trustSum: number }> = {};
    filteredProjects.forEach(p => {
      const dName = p.districtName || p.districtId || p.district || 'Unassigned District';
      if (!distMap[dName]) {
        distMap[dName] = { district: dName, total: 0, attention: 0, highPriority: 0, trustSum: 0 };
      }
      distMap[dName].total += 1;
      if (p.priority === 'ATTENTION') distMap[dName].attention += 1;
      if (p.priority === 'HIGH_PRIORITY' || (p.trustScore && p.trustScore < 75)) distMap[dName].highPriority += 1;
      distMap[dName].trustSum += (p.trustScore ?? 85);
    });

    return Object.values(distMap).map(d => ({
      ...d,
      avgTrust: (d.trustSum / d.total).toFixed(1)
    })).sort((a, b) => {
      if (b.highPriority !== a.highPriority) return b.highPriority - a.highPriority;
      if (b.attention !== a.attention) return b.attention - a.attention;
      return Number(a.avgTrust) - Number(b.avgTrust);
    });
  }, [filteredProjects]);

  // AI Insights derived from live statistics
  const highestRiskDistrict = districtAnalytics.length > 0 ? districtAnalytics[0].district : 'None';
  const verificationNeededCount = attentionCount + highPriorityCount;
  const normalCount = totalCount - attentionCount - highPriorityCount;
  const normalPct = totalCount > 0 ? ((normalCount / totalCount) * 100).toFixed(0) : '0';
  const attentionPct = totalCount > 0 ? ((attentionCount / totalCount) * 100).toFixed(0) : '0';
  const highPriorityPct = totalCount > 0 ? ((highPriorityCount / totalCount) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      {/* KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Projects
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600 inline" /> : totalCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Live dataset count</span>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
              Attention Projects
            </span>
            <span className="text-2xl font-extrabold text-amber-900 mt-1 block">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-amber-600 inline" /> : attentionCount}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">Requires routine review</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 block">
              High Priority Projects
            </span>
            <span className="text-2xl font-extrabold text-red-900 mt-1 block">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-red-600 inline" /> : highPriorityCount}
            </span>
            <span className="text-[10px] text-red-600 font-medium">Flagged for field verification</span>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Average Trust Score
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600 inline" /> : `${avgTrustScore}%`}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">Live AI trust rating</span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Geospatial Intelligence Filters</span>
          </span>
          <button 
            onClick={loadData}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Data</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* State Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('ALL');
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
            >
              <option value="ALL">All States</option>
              {statesList.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
            >
              <option value="ALL">All Districts</option>
              {districtsList.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Verification Priority Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Verification Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
            >
              <option value="ALL">All Priorities</option>
              <option value="NORMAL">NORMAL (Green)</option>
              <option value="ATTENTION">ATTENTION (Amber)</option>
              <option value="HIGH_PRIORITY">HIGH_PRIORITY (Red)</option>
            </select>
          </div>

          {/* Sector Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
            >
              <option value="ALL">All Sectors</option>
              {sectorsList.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MAP CONTAINER & STATES (LOADING, EMPTY, ERROR) */}
      {loading ? (
        <div className="w-full h-[520px] bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-8 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <span className="text-sm font-bold text-slate-700">Loading Project Intelligence Map...</span>
          <span className="text-xs text-slate-400 mt-1">Fetching live geospatial records from Rakshkavach database</span>
        </div>
      ) : error ? (
        <div className="w-full h-[320px] bg-red-50/70 rounded-2xl border border-red-200 flex flex-col items-center justify-center p-8 text-red-700 space-y-2 text-center">
          <AlertTriangle className="w-10 h-10 text-red-600" />
          <h3 className="text-base font-bold">Unable to load map data.</h3>
          <p className="text-xs text-red-600">Please try again or check your network connection.</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
          >
            Retry Loading Map
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="w-full h-[320px] bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-8 text-slate-500 space-y-2 text-center">
          <MapPin className="w-10 h-10 text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No projects found for selected filters.</h3>
          <p className="text-xs text-slate-500">Try adjusting your state, district, priority, or sector filters.</p>
          <button 
            onClick={() => {
              setSelectedState('ALL');
              setSelectedDistrict('ALL');
              setSelectedPriority('ALL');
              setSelectedSector('ALL');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <LeafletMapInner projects={filteredProjects} center={mapCenter} />
      )}

      {/* ANALYTICS & AI INSIGHTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DISTRICT RISK ANALYTICS TABLE (SORTED HIGHEST RISK FIRST) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>District Risk Analytics</span>
              </h3>
              <p className="text-xs text-slate-500">
                Live risk distribution aggregated by district (Sorted Highest Risk First)
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              {districtAnalytics.length} Districts Analyzed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                  <th className="p-3">District</th>
                  <th className="p-3 text-center">Projects</th>
                  <th className="p-3 text-center">Attention</th>
                  <th className="p-3 text-center">High Priority</th>
                  <th className="p-3 text-right">Avg Trust Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {districtAnalytics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">No district analytics data available.</td>
                  </tr>
                ) : (
                  districtAnalytics.map((row, idx) => (
                    <tr key={row.district} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{row.district}</span>
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-700">{row.total}</td>
                      <td className="p-3 text-center">
                        {row.attention > 0 ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[11px]">
                            {row.attention}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {row.highPriority > 0 ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded text-[11px]">
                            {row.highPriority}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          Number(row.avgTrust) < 75 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : Number(row.avgTrust) < 85 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {row.avgTrust}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI INSIGHTS PANEL */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-4.5 h-4.5 text-blue-600" />
              <span>AI Geospatial Insights</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
              Live AI Model
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                Verification Workload
              </span>
              <p className="text-xs text-blue-950 font-bold">
                {verificationNeededCount} project(s) require physical field verification.
              </p>
              <p className="text-[11px] text-blue-700">
                Includes {highPriorityCount} high-priority risk projects & {attentionCount} routine attention projects.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                Highest Risk Concentration
              </span>
              <p className="text-xs text-amber-950 font-bold">
                District: {highestRiskDistrict}
              </p>
              <p className="text-[11px] text-amber-800">
                Exhibits the highest density of high-priority risk markers and lower trust metrics across dataset.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Priority Distribution Breakdown
              </span>
              <div className="space-y-1 text-xs font-semibold">
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Normal (Low Risk):</span>
                  <span>{normalPct}% ({normalCount})</span>
                </div>
                <div className="flex justify-between items-center text-amber-700">
                  <span>Attention:</span>
                  <span>{attentionPct}% ({attentionCount})</span>
                </div>
                <div className="flex justify-between items-center text-red-700">
                  <span>High Priority (High Risk):</span>
                  <span>{highPriorityPct}% ({highPriorityCount})</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Overall Platform Health</span>
                <span className="font-bold">{Number(avgTrustScore) >= 80 ? 'Optimal Governance' : 'Monitoring Required'}</span>
              </div>
              <span className="text-lg font-extrabold text-emerald-700">{avgTrustScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
