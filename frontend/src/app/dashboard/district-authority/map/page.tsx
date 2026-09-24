"use client";

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ProjectMap } from '@/components/map/ProjectMap';
import { Map } from 'lucide-react';

export default function DistrictMapPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-600" />
            <span>District Geospatial Intelligence Map</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geospatial project risk monitoring & district decision support system.
          </p>
        </div>
        <ProjectMap />
      </div>
    </AppShell>
  );
}
