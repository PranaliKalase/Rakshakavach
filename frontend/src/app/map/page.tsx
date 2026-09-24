"use client";

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ProjectMap } from '@/components/map/ProjectMap';

export default function MapPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="border-b border-govBorder pb-4">
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">MPLADS Project GIS Map</h1>
          <p className="text-xs text-textSecondary mt-0.5">Geospatial location display of active works across North Delhi constituency.</p>
        </div>
        <ProjectMap />
      </div>
    </AppShell>
  );
}
