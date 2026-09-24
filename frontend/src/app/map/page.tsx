"use client";

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ProjectMap } from '@/components/map/ProjectMap';

export default function MapPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Project Intelligence Map</h1>
          <p className="text-xs text-slate-500 mt-1">
            Live geospatial risk intelligence & decision support platform powered by Rakshkavach dataset.
          </p>
        </div>
        <ProjectMap />
      </div>
    </AppShell>
  );
}
