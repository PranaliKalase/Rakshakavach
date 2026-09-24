"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { 
  Settings, 
  CheckCircle2, 
  Save, 
  Sliders, 
  ShieldCheck, 
  Map, 
  Bell, 
  SlidersHorizontal,
  Lock
} from 'lucide-react';

export default function SettingsPage() {
  const [financialYear, setFinancialYear] = useState('FY 2025 – 2026');
  const [contaminationRate, setContaminationRate] = useState('0.10');
  const [trustThreshold, setTrustThreshold] = useState('70');
  const [enableMapClusters, setEnableMapClusters] = useState(true);
  const [enableAuditLedger, setEnableAuditLedger] = useState(true);
  const [enableAutoEscalation, setEnableAutoEscalation] = useState(true);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg("System platform configuration settings updated and deployed across active services.");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="System Settings" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs">
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
            System Platform Settings & Feature Configurations
          </h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Configure platform parameters, financial year windows, AI anomaly engine contamination thresholds, Mapbox vector layers, and feature flags.
          </p>
        </div>

        {savedMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{savedMsg}</span>
            </div>
            <button onClick={() => setSavedMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Financial & Workflow Settings */}
          <div className="gov-card p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2 border-b border-govBorder pb-3">
              <Settings className="w-4 h-4 text-primaryBlue" />
              FINANCIAL YEAR & WORKFLOW CONFIGURATION
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-textPrimary mb-1">Active Financial Year Window *</label>
                <select 
                  value={financialYear}
                  onChange={e => setFinancialYear(e.target.value)}
                  className="w-full p-2 bg-white border border-govBorder rounded text-xs font-bold text-govNavy"
                >
                  <option value="FY 2025 – 2026">FY 2025 – 2026 (Current Active Period)</option>
                  <option value="FY 2024 – 2025">FY 2024 – 2025 (Archived Period)</option>
                  <option value="FY 2026 – 2027">FY 2026 – 2027 (Upcoming Planning)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">High Verification Priority Trust Threshold *</label>
                <input 
                  type="number" 
                  value={trustThreshold}
                  onChange={e => setTrustThreshold(e.target.value)}
                  className="w-full p-2 bg-white border border-govBorder rounded text-xs font-bold font-mono text-govNavy"
                />
              </div>
            </div>
          </div>

          {/* Section 2: AI Engine & Feature Toggles */}
          <div className="gov-card p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2 border-b border-govBorder pb-3">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              AI ANOMALY ENGINE & FEATURE TOGGLES
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-govBg border border-govBorder rounded">
                <div>
                  <strong className="text-govNavy block">IsolationForest Anomaly Contamination Hyperparameter</strong>
                  <span className="text-textSecondary text-[11px]">Controls the proportion of statistical outliers expected in the dataset (Default: 0.10).</span>
                </div>
                <input 
                  type="text" 
                  value={contaminationRate}
                  onChange={e => setContaminationRate(e.target.value)}
                  className="w-24 p-1.5 bg-white border border-govBorder rounded text-xs font-mono font-bold text-center"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-govBg border border-govBorder rounded">
                <div>
                  <strong className="text-govNavy block">Enable Real-Time Cryptographic Audit Ledger</strong>
                  <span className="text-textSecondary text-[11px]">Computes SHA-256 hash digests for all project progress and inspection events.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={enableAuditLedger} onChange={e => setEnableAuditLedger(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-govBg border border-govBorder rounded">
                <div>
                  <strong className="text-govNavy block">Enable GIS Mapbox Layer Clustering</strong>
                  <span className="text-textSecondary text-[11px]">Renders interactive vector markers and spatial priority clusters on project maps.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={enableMapClusters} onChange={e => setEnableMapClusters(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="text-right">
            <button 
              type="submit" 
              className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-6 py-2.5 rounded flex items-center gap-2 ml-auto shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
