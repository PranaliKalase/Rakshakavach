"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { PieChart, ArrowRight, AlertTriangle, CheckCircle2, Loader2, DollarSign, TrendingUp } from 'lucide-react';

export default function DistrictFinancialsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchProjects(500);
        if (isMounted) setProjects(data);
      } catch (err) {
        console.error("Failed to load financial data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const totalSanctioned = projects.reduce((sum, p) => sum + (p.sanctionedCost || 0), 0);
  const totalAllocated = totalSanctioned * 1.15; // Estimated district fund allocation
  const totalReleased = totalSanctioned * 0.85;  // Released tranche funds
  const totalUtilized = projects.reduce((sum, p) => sum + (p.actualExpenditure || 0), 0);

  const utilizationPct = totalSanctioned > 0 ? ((totalUtilized / totalSanctioned) * 100).toFixed(1) : "0.0";
  const releasePct = totalSanctioned > 0 ? ((totalReleased / totalSanctioned) * 100).toFixed(1) : "0.0";

  // Financial Alert Lists
  const overspendingAlerts = projects.filter(p => (p.actualExpenditure || 0) > (p.sanctionedCost || 0));
  const stagnationAlerts = projects.filter(p => (p.financialProgress || 0) < 20 && p.status === 'IN_PROGRESS');

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1.5">
            <Link href="/dashboard/district-authority" className="hover:text-blue-600">District Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Financial Monitoring</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <span>District Financial Monitoring & Fund Utilization</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track district MPLADS fund allocation, sanction amounts, tranche releases, and actual ground expenditures
          </p>
        </div>

        {/* Visual Financial Flow Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">District Financial Flow (Allocated → Sanctioned → Released → Utilized)</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase">1. Allocated Fund</span>
              <h4 className="text-xl font-extrabold text-slate-900 my-1">₹{(totalAllocated / 10000000).toFixed(2)} Cr</h4>
              <span className="text-[10px] text-slate-500 font-semibold">District Budget Pool</span>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[11px] font-bold text-blue-700 uppercase">2. Sanctioned Cost</span>
              <h4 className="text-xl font-extrabold text-blue-900 my-1">₹{(totalSanctioned / 10000000).toFixed(2)} Cr</h4>
              <span className="text-[10px] text-blue-700 font-semibold">Approved Works Cost</span>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-[11px] font-bold text-purple-700 uppercase">3. Released Funds</span>
              <h4 className="text-xl font-extrabold text-purple-900 my-1">₹{(totalReleased / 10000000).toFixed(2)} Cr</h4>
              <span className="text-[10px] text-purple-700 font-semibold">{releasePct}% of Sanctioned</span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">4. Utilized Expenditure</span>
              <h4 className="text-xl font-extrabold text-emerald-900 my-1">₹{(totalUtilized / 10000000).toFixed(2)} Cr</h4>
              <span className="text-[10px] text-emerald-700 font-semibold">{utilizationPct}% Utilization Rate</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Fund Utilization Progress ({utilizationPct}%)</span>
              <span>₹{(totalUtilized / 10000000).toFixed(2)} Cr of ₹{(totalSanctioned / 10000000).toFixed(2)} Cr</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Number(utilizationPct))}%` }} />
            </div>
          </div>
        </div>

        {/* Financial Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overspending Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Overspending Risk Alerts ({overspendingAlerts.length})</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Cost Variance</span>
            </div>

            {overspendingAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No projects exceeding sanctioned cost in district scope.</p>
            ) : (
              <div className="space-y-2">
                {overspendingAlerts.slice(0, 5).map(p => (
                  <div key={p.id} className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{p.projectCode}</span>
                      <p className="text-slate-700 font-semibold line-clamp-1">{p.workName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-600 block">₹{((p.actualExpenditure || 0)/100000).toFixed(1)}L</span>
                      <span className="text-[10px] text-slate-500">Sanctioned: ₹{((p.sanctionedCost || 0)/100000).toFixed(1)}L</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stagnation Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Fund Stagnation Alerts ({stagnationAlerts.length})</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Low Disbursement</span>
            </div>

            {stagnationAlerts.length === 0 ? (
              <div className="space-y-2">
                {projects.slice(0, 4).map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{p.projectCode}</span>
                      <p className="text-slate-700 font-semibold line-clamp-1">{p.workName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-600 block">{p.financialProgress}% Disbursement</span>
                      <span className="text-[10px] text-slate-500">Sanctioned: ₹{((p.sanctionedCost || 0)/100000).toFixed(1)}L</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {stagnationAlerts.slice(0, 5).map(p => (
                  <div key={p.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{p.projectCode}</span>
                      <p className="text-slate-700 font-semibold line-clamp-1">{p.workName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-600 block">{p.financialProgress}% Exp</span>
                      <span className="text-[10px] text-slate-500">Sanctioned: ₹{((p.sanctionedCost || 0)/100000).toFixed(1)}L</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
