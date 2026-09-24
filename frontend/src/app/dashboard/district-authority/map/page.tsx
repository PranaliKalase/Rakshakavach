"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { ProjectMap } from '@/components/map/ProjectMap';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { Map, Filter, Loader2, MapPin, Eye } from 'lucide-react';

export default function DistrictMapPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchProjects(500);
        if (isMounted) setProjects(data);
      } catch (err) {
        console.error("Failed to load map data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const filtered = projects.filter(p => {
    if (selectedRisk === 'HIGH') return p.priority === 'HIGH_PRIORITY' || (p.trustScore && p.trustScore < 75);
    if (selectedRisk === 'ATTENTION') return p.priority === 'ATTENTION';
    if (selectedRisk === 'NORMAL') return p.priority === 'NORMAL';
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1.5">
            <Link href="/dashboard/district-authority" className="hover:text-blue-600">District Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">GIS Risk Map</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-600" />
            <span>District Project Risk GIS Map</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial intelligence map of all district works with live risk markers and physical progress layers
          </p>
        </div>

        {/* Map Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Filter Risk Category:</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedRisk('ALL')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                  selectedRisk === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                All Works ({projects.length})
              </button>
              <button 
                onClick={() => setSelectedRisk('HIGH')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                  selectedRisk === 'HIGH' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                High Risk
              </button>
              <button 
                onClick={() => setSelectedRisk('ATTENTION')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                  selectedRisk === 'ATTENTION' ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                Attention Required
              </button>
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Showing {filtered.length} mapped markers
          </span>
        </div>

        {/* Full Map Container */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <ProjectMap />
        </div>
      </div>
    </AppShell>
  );
}
