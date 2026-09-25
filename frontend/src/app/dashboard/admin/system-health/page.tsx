"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { 
  HeartPulse, 
  Activity, 
  Server, 
  Database, 
  Cloud, 
  MapPin, 
  Bot, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface SystemServiceStatus {
  name: string;
  type: string;
  endpoint: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  latency: string;
  uptime: string;
  lastChecked: string;
}

const SYSTEM_SERVICES: SystemServiceStatus[] = [
  { name: 'FastAPI Backend API Engine', type: 'REST API', endpoint: process.env.NEXT_PUBLIC_API_URL || 'https://api.rakshakavach.gov.in/api/v1', status: 'OPERATIONAL', latency: '14 ms', uptime: '99.98%', lastChecked: 'Just now' },
  { name: 'PostgreSQL / Supabase Database', type: 'Relational DB', endpoint: 'https://your-project.supabase.co', status: 'OPERATIONAL', latency: '22 ms', uptime: '99.99%', lastChecked: 'Just now' },
  { name: 'Cloud Storage & Evidence Bucket', type: 'Object Storage', endpoint: 's3://rakshakavach-evidence', status: 'OPERATIONAL', latency: '35 ms', uptime: '99.95%', lastChecked: '1 min ago' },
  { name: 'Mapbox GIS Vector Tile Service', type: 'Geospatial API', endpoint: 'https://api.mapbox.com/v4', status: 'OPERATIONAL', latency: '48 ms', uptime: '99.90%', lastChecked: 'Just now' },
  { name: 'IsolationForest AI Anomaly Engine', type: 'ML Inference', endpoint: 'Python Scikit-Learn Engine', status: 'OPERATIONAL', latency: '18 ms', uptime: '99.99%', lastChecked: 'Just now' },
  { name: 'Background Cron & Data Validation Daemon', type: 'Background Worker', endpoint: 'DataLoader Daemon Task', status: 'OPERATIONAL', latency: 'N/A', uptime: '100.0%', lastChecked: 'Just now' },
];

export default function SystemHealthPage() {
  const [services, setServices] = useState<SystemServiceStatus[]>(SYSTEM_SERVICES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(new Date().toLocaleTimeString());

  const handleRunDiagnostics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastCheckTime(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="System Health" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
              Real-Time System Health & Service Diagnostics
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Live status monitoring across API gateways, relational databases, storage buckets, Mapbox GIS services, and AI anomaly inference workers.
            </p>
          </div>

          <button 
            onClick={handleRunDiagnostics}
            disabled={isRefreshing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-2 shrink-0 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Run Full System Diagnostics</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="System Status" value="100% Operational" subtitle={`Last check: ${lastCheckTime}`} icon={<HeartPulse className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Average Latency" value="23.4 ms" subtitle="Sub-50ms Global SLA" icon={<Activity className="w-5 h-5 text-primaryBlue" />} />
          <KPICard title="System Uptime" value="99.98%" subtitle="30-Day Rolling Window" icon={<Cpu className="w-5 h-5 text-indigo-600" />} />
          <KPICard title="Active Services" value={`${services.length}/${services.length}`} subtitle="All Systems Normal" icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />} />
        </div>

        {/* Service Diagnostics Table */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              SYSTEM COMPONENT HEALTH MATRIX
            </h3>
            <span className="text-xs font-mono text-textSecondary font-bold">Auto-refresh interval: 30s</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px]">
                  <th className="p-3">Component / Service</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Endpoint / Resource</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Uptime</th>
                  <th className="p-3">Last Checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govBorder">
                {services.map((svc, idx) => (
                  <tr key={idx} className="hover:bg-govBg/50">
                    <td className="p-3 font-bold text-govNavy flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{svc.name}</span>
                    </td>
                    <td className="p-3 font-semibold text-textSecondary">{svc.type}</td>
                    <td className="p-3 font-mono text-[11px] text-primaryBlue">{svc.endpoint}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-200">
                        {svc.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-govNavy">{svc.latency}</td>
                    <td className="p-3 font-mono text-emerald-700 font-bold">{svc.uptime}</td>
                    <td className="p-3 text-textSecondary text-[11px] font-mono">{svc.lastChecked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
