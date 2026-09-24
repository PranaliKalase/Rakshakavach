"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { fetchProjects, NormalizedProject } from '@/lib/api';
import { 
  Building2, 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  Globe, 
  PieChart,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function MinistryDashboard() {
  const [projects, setProjects] = useState<NormalizedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching ministry projects:', err);
        setError('Failed to load project records from backend API.');
        setLoading(false);
      });
  }, []);

  const totalAllocated = projects.reduce((acc, p) => acc + (p.sanctionedAmount || p.allocatedAmount || 0), 0);
  const totalExpenditure = projects.reduce((acc, p) => acc + (p.expenditure || 0), 0);
  const totalAllocatedCr = (totalAllocated / 10000000).toFixed(2);
  const totalExpenditureCr = (totalExpenditure / 10000000).toFixed(2);
  const utilRate = totalAllocated > 0 ? ((totalExpenditure / totalAllocated) * 100).toFixed(1) : '0.0';

  const anomalyCount = projects.filter((p) => (p.risk?.isAnomaly) || (p.risk?.trustScore && p.risk.trustScore < 60)).length;
  const anomalyRate = projects.length > 0 ? ((anomalyCount / projects.length) * 100).toFixed(1) : '0.0';

  // Group by state / district
  const districtMap: Record<string, { count: number; allocated: number; exp: number }> = {};
  projects.forEach((p) => {
    const dist = p.district || 'Unassigned';
    if (!districtMap[dist]) {
      districtMap[dist] = { count: 0, allocated: 0, exp: 0 };
    }
    districtMap[dist].count += 1;
    districtMap[dist].allocated += (p.sanctionedAmount || p.allocatedAmount || 0);
    districtMap[dist].exp += (p.expenditure || 0);
  });

  const districtList = Object.entries(districtMap)
    .map(([district, stats]) => ({ district, ...stats }))
    .sort((a, b) => b.allocated - a.allocated)
    .slice(0, 5);

  const normalCount = projects.filter(p => !p.risk?.isAnomaly && (p.risk?.trustScore ?? 80) >= 75).length;
  const reviewCount = projects.filter(p => (p.risk?.trustScore ?? 80) >= 50 && (p.risk?.trustScore ?? 80) < 75).length;
  const highPriorityCount = projects.filter(p => p.risk?.isAnomaly || (p.risk?.trustScore ?? 80) < 50).length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-govBorder pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primaryBlue mb-1">
              <Globe className="w-4 h-4" />
              <span>MOSPI Ministry Oversight (Live API Data)</span>
            </div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">National MPLADS Oversight Dashboard</h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Live aggregate metrics dynamically computed from Supabase backend records ({projects.length} Total Projects).
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/projects"
              className="bg-primaryBlue hover:bg-govNavy text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View All Projects</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        {/* Ministry KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard 
            title="Total Active Projects" 
            value={loading ? '...' : projects.length.toString()} 
            subtitle="Live Database Count"
            icon={<Building2 className="w-5 h-5 text-primaryBlue" />}
            accentColor="border-l-primaryBlue"
          />
          <KPICard 
            title="Total Sanctioned" 
            value={loading ? '...' : `₹${totalAllocatedCr} Cr`} 
            subtitle="Aggregated Sanctioned Budget"
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            accentColor="border-l-emerald-600"
          />
          <KPICard 
            title="Aggregate Expenditure" 
            value={loading ? '...' : `₹${totalExpenditureCr} Cr`} 
            subtitle={`${utilRate}% Fund Utilization`}
            icon={<PieChart className="w-5 h-5 text-statusBlue" />}
            accentColor="border-l-statusBlue"
          />
          <KPICard 
            title="System Anomaly Rate" 
            value={loading ? '...' : `${anomalyRate}%`} 
            subtitle={`${anomalyCount} Anomalous Projects`}
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            accentColor="border-l-emerald-600"
          />
        </div>

        {/* District Distribution from Live Database */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="gov-card p-5">
            <h3 className="text-sm font-bold text-govNavy mb-3">District Sanction Summary (Top 5)</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-xs text-textSecondary">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Computing live aggregations...</span>
              </div>
            ) : districtList.length === 0 ? (
              <p className="text-xs text-textSecondary italic">No district breakdown available.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {districtList.map((st) => {
                  const allocCr = (st.allocated / 10000000).toFixed(2);
                  const expCr = (st.exp / 10000000).toFixed(2);
                  const pct = st.allocated > 0 ? ((st.exp / st.allocated) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={st.district}>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>{st.district} ({st.count} Projects)</span>
                        <span className="font-bold text-govNavy">₹{expCr} Cr / ₹{allocCr} Cr ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-govBg rounded-full overflow-hidden">
                        <div className="h-full bg-primaryBlue" style={{ width: `${Math.min(100, parseFloat(pct))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="gov-card p-5">
            <h3 className="text-sm font-bold text-govNavy mb-3">Verification Signal Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-govBg rounded border border-govBorder flex justify-between items-center">
                <div>
                  <span className="font-bold text-govNavy">Normal Execution Status</span>
                  <p className="text-[11px] text-textSecondary">Physical & financial progress consistent</p>
                </div>
                <span className="font-extrabold text-emerald-700 text-sm">{loading ? '...' : `${normalCount} Projects`}</span>
              </div>

              <div className="p-3 bg-govBg rounded border border-govBorder flex justify-between items-center">
                <div>
                  <span className="font-bold text-govNavy">Attention Required</span>
                  <p className="text-[11px] text-textSecondary">Progress update or photo evidence pending</p>
                </div>
                <span className="font-extrabold text-amber-700 text-sm">{loading ? '...' : `${reviewCount} Projects`}</span>
              </div>

              <div className="p-3 bg-govBg rounded border border-govBorder flex justify-between items-center">
                <div>
                  <span className="font-bold text-govNavy">High Priority Verification Queue</span>
                  <p className="text-[11px] text-textSecondary">Financial expenditure leading physical completion</p>
                </div>
                <span className="font-extrabold text-statusRed text-sm">{loading ? '...' : `${highPriorityCount} Projects`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Projects Snapshot */}
        <div className="gov-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-govBorder mb-4">
            <div>
              <h3 className="text-sm font-bold text-govNavy">Live Backend Projects Snapshot</h3>
              <p className="text-[11px] text-textSecondary">Real-time database records from Supabase.</p>
            </div>
            <Link href="/projects" className="text-xs font-semibold text-primaryBlue hover:underline flex items-center gap-1">
              <span>View All {projects.length} Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-govBg text-textSecondary uppercase font-semibold text-[10px] border-b border-govBorder">
                <tr>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Work Name</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Sanctioned</th>
                  <th className="p-3">Progress</th>
                  <th className="p-3 text-right">Trust Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govBorder">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-textSecondary">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-primaryBlue" />
                      Loading live project rows...
                    </td>
                  </tr>
                ) : projects.slice(0, 8).map((p) => {
                  const trust = p.risk ? p.risk.trustScore : p.trustScore;
                  return (
                    <tr key={p.id} className="hover:bg-govBg/50">
                      <td className="p-3 font-mono font-bold text-govNavy">{p.projectCode || p.id}</td>
                      <td className="p-3 font-bold text-textPrimary">{p.title || p.workName}</td>
                      <td className="p-3 font-medium text-govNavy">{p.district}</td>
                      <td className="p-3 font-bold text-govNavy">₹{((p.sanctionedAmount || p.allocatedAmount || 0)/100000).toFixed(2)} Lakh</td>
                      <td className="p-3 font-bold text-emerald-700">{p.physicalProgress}% Phys | {p.financialProgress}% Fin</td>
                      <td className="p-3 text-right font-mono font-bold text-primaryBlue">{typeof trust === 'number' ? trust.toFixed(1) : trust}/100</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

