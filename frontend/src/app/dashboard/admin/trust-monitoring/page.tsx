"use client";

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { fetchProjects } from '@/lib/api';
import { 
  ShieldAlert, 
  BarChart3, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  PieChart,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

export default function TrustMonitoringPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchProjects(200);
        setProjects(data);
      } catch (err) {
        console.error("Error loading Trust Monitoring projects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalProjs = projects.length;
  const highRiskCount = projects.filter(p => (p.trustScore || 100) < 70 || p.priority === 'HIGH_PRIORITY').length;
  const mediumRiskCount = projects.filter(p => (p.trustScore || 100) >= 70 && (p.trustScore || 100) < 85).length;
  const lowRiskCount = projects.filter(p => (p.trustScore || 100) >= 85).length;
  const avgTrustScore = totalProjs > 0 
    ? Math.round(projects.reduce((sum, p) => sum + (p.trustScore || 90), 0) / totalProjs * 10) / 10 
    : 92.5;

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="Trust Score Monitoring" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs">
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
            Trust Score Monitoring & District Risk Benchmarks
          </h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Macro analysis of Trust Score distributions, priority categorization, and comparative district verification trends across active works.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Average Trust Score" value={`${avgTrustScore} / 100`} subtitle="Platform Index" icon={<ShieldAlert className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Low Risk (>85)" value={loading ? "..." : lowRiskCount.toString()} subtitle="High Assurance" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Medium Risk (70-85)" value={loading ? "..." : mediumRiskCount.toString()} subtitle="Attention Required" icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} accentColor="border-l-amber-500" />
          <KPICard title="High Risk (<70)" value={loading ? "..." : highRiskCount.toString()} subtitle="Field Inspection Priority" icon={<ShieldAlert className="w-5 h-5 text-red-600" />} accentColor="border-l-red-600" />
        </div>

        {/* Trust Score Distribution Breakdown */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primaryBlue" />
              TRUST SCORE CATEGORY DISTRIBUTION
            </h3>
            <span className="text-xs text-textSecondary font-bold">Total Evaluated: {totalProjs} Works</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-900 text-sm">HIGH ASSURANCE (85 – 100)</span>
                <span className="font-mono font-bold text-emerald-700">{lowRiskCount} Projects</span>
              </div>
              <p className="text-[11px] text-emerald-800">Verified progress milestones, consistent financial expenditure, and complete site photo evidence ledger.</p>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-900 text-sm">ATTENTION (70 – 84)</span>
                <span className="font-mono font-bold text-amber-700">{mediumRiskCount} Projects</span>
              </div>
              <p className="text-[11px] text-amber-800">Minor milestone pace variance or missing non-critical technical estimate attachments.</p>
            </div>

            <div className="p-4 bg-red-50/60 border border-red-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-red-900 text-sm">HIGH PRIORITY VERIFICATION (&lt; 70)</span>
                <span className="font-mono font-bold text-red-700">{highRiskCount} Projects</span>
              </div>
              <p className="text-[11px] text-red-800">Financial expenditure leads physical progress or mandatory geo-tagged progress photo missing.</p>
            </div>
          </div>
        </div>

        {/* Project Ranking Table */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primaryBlue" />
              LOWEST TRUST SCORE PROJECT RANKING QUEUE
            </h3>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center text-xs text-textSecondary gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primaryBlue" />
              <span>Loading project trust rankings...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px]">
                    <th className="p-3">Rank</th>
                    <th className="p-3">Project Code</th>
                    <th className="p-3">Work Name</th>
                    <th className="p-3">Trust Score</th>
                    <th className="p-3">Physical Progress</th>
                    <th className="p-3">Financial Exp</th>
                    <th className="p-3">Priority Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govBorder">
                  {projects.sort((a, b) => (a.trustScore || 100) - (b.trustScore || 100)).slice(0, 8).map((p, idx) => (
                    <tr key={p.id} className="hover:bg-govBg/50">
                      <td className="p-3 font-mono font-bold text-textSecondary">#{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-primaryBlue">{p.projectCode}</td>
                      <td className="p-3 font-bold text-govNavy">{p.workName}</td>
                      <td className="p-3 font-mono font-extrabold text-red-600">{p.trustScore || 75}/100</td>
                      <td className="p-3 font-bold text-emerald-700">{p.physicalProgress || 0}%</td>
                      <td className="p-3 font-mono">₹{((p.actualExpenditure || 0)/100000).toFixed(2)} Lakh</td>
                      <td className="p-3"><span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">{p.priority || 'HIGH_PRIORITY'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
