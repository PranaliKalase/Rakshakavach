"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MPSelector } from '@/components/ui/MPSelector';
import { fetchProjects, fetchMPSummary } from '@/lib/api';
import { Project } from '@/types/project';
import { DEMO_USERS } from '@/lib/constants';
import { PieChart, Loader2, ArrowRight, TrendingUp } from 'lucide-react';

export default function MPUtilizationPage() {
  const [activeMpName, setActiveMpName] = useState<string>("Demo MP 013");
  const [activeConstituency, setActiveConstituency] = useState<string>("Maharashtra Demo Parliamentary Constituency 13");
  const [summary, setSummary] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rakshakavach_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.mpName) {
          setActiveMpName(u.mpName);
          if (u.constituencyName) setActiveConstituency(u.constituencyName);
        }
      }
    } catch (e) {}
  }, []);

  const loadData = async (mpName: string) => {
    try {
      setLoading(true);
      const [sumRes, projRes] = await Promise.allSettled([
        fetchMPSummary(mpName),
        fetchProjects({ role: 'MP', mpName: mpName })
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value) {
        setSummary(sumRes.value);
        if (sumRes.value.constituency_name) setActiveConstituency(sumRes.value.constituency_name);
      }
      if (projRes.status === 'fulfilled') {
        setProjects(projRes.value);
      }
    } catch (err) {
      console.error("Failed to load MP utilization data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeMpName);
  }, [activeMpName]);

  const handleMPChange = (newMpName: string, newConstName: string) => {
    setActiveMpName(newMpName);
    setActiveConstituency(newConstName);
    try {
      const updatedUser = {
        ...DEMO_USERS.MP,
        fullName: newMpName,
        mpName: newMpName,
        constituencyName: newConstName
      };
      localStorage.setItem('rakshakavach_user', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const totalAllocation = summary?.my_total_allocation || projects.reduce((s, p) => s + (p.estimatedCost || 0), 0);
  const totalSanctioned = summary?.my_total_sanctioned_amount || projects.reduce((s, p) => s + (p.sanctionedCost || 0), 0);
  const totalExpenditure = summary?.my_expenditure || projects.reduce((s, p) => s + (p.actualExpenditure || 0), 0);
  const remainingFunds = summary?.remaining_funds ?? Math.max(0, totalAllocation - totalExpenditure);
  const utilizationPct = summary?.my_utilization_pct ?? (totalSanctioned > 0 ? Math.round((totalExpenditure / totalSanctioned) * 100) : 0);

  // Sector-wise aggregation strictly from live project records
  const sectorMap: { [key: string]: { sanctioned: number; expenditure: number; count: number } } = {};
  projects.forEach(p => {
    const sec = p.sector || 'Other';
    if (!sectorMap[sec]) {
      sectorMap[sec] = { sanctioned: 0, expenditure: 0, count: 0 };
    }
    sectorMap[sec].sanctioned += (p.sanctionedCost || 0);
    sectorMap[sec].expenditure += (p.actualExpenditure || 0);
    sectorMap[sec].count += 1;
  });

  const sectorSummary = Object.entries(sectorMap).map(([sector, data]) => ({
    sector,
    count: data.count,
    sanctioned: data.sanctioned,
    expenditure: data.expenditure,
    utilizationPct: data.sanctioned > 0 ? Math.round((data.expenditure / data.sanctioned) * 100) : 0
  })).sort((a, b) => b.sanctioned - a.sanctioned);

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <span>Fund Utilization & Expenditure Analysis — {activeMpName}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live financial portfolio metrics for {activeConstituency}
            </p>
          </div>

          <MPSelector currentMpName={activeMpName} onMPChange={handleMPChange} />
        </div>

        {/* Financial KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Allocation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Allocation</p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : `₹ ${(totalAllocation / 10000000).toFixed(2)} Cr`}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">MPLADS Allocated Fund</p>
          </div>

          {/* Total Sanctioned */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Sanctioned</p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : `₹ ${(totalSanctioned / 10000000).toFixed(2)} Cr`}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Sanctioned Works Cost</p>
          </div>

          {/* Total Expenditure */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Expenditure</p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : `₹ ${(totalExpenditure / 10000000).toFixed(2)} Cr`}
            </h3>
            <p className="text-[11px] text-emerald-600 mt-2 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Actual Disbursed Payments</span>
            </p>
          </div>

          {/* Remaining Funds */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">Remaining Funds</p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : `₹ ${(remainingFunds / 10000000).toFixed(2)} Cr`}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Unspent Balance</p>
          </div>

          {/* Utilization % */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-1">Utilization %</p>
            <h3 className="text-2xl font-extrabold text-emerald-600">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : `${utilizationPct}%`}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Expenditure / Sanction Ratio</p>
          </div>
        </div>

        {/* Sector-Wise Utilization Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Sector-Wise Expenditure Breakdown ({sectorSummary.length} Sectors)</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Projects Count</th>
                    <th className="p-3">Sanctioned Amount</th>
                    <th className="p-3">Expenditure</th>
                    <th className="p-3">Utilization %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sectorSummary.map((sec) => (
                    <tr key={sec.sector} className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-900">{sec.sector}</td>
                      <td className="p-3 text-slate-700">{sec.count}</td>
                      <td className="p-3 font-semibold text-slate-900">₹{(sec.sanctioned / 100000).toFixed(2)} Lakh</td>
                      <td className="p-3 font-semibold text-slate-900">₹{(sec.expenditure / 100000).toFixed(2)} Lakh</td>
                      <td className="p-3 font-bold text-emerald-600">{sec.utilizationPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Project-Wise Financial Breakdown Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Project Expenditure Table ({projects.length} Works)</h3>
            <Link href="/dashboard/mp/projects" className="text-xs font-bold text-blue-600 hover:text-blue-800">
              Manage Portfolio →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Project Code & Name</th>
                    <th className="p-3">Sanctioned</th>
                    <th className="p-3">Expenditure</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3">Utilization %</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {projects.map((p) => {
                    const sanc = p.sanctionedCost || 0;
                    const exp = p.actualExpenditure || 0;
                    const bal = Math.max(0, sanc - exp);
                    const pct = sanc > 0 ? Math.round((exp / sanc) * 100) : 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="p-3">
                          <span className="font-mono font-bold text-blue-600 block">{p.projectCode}</span>
                          <span className="font-semibold text-slate-900 truncate max-w-xs block">{p.workName}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">₹{(sanc / 100000).toFixed(2)} Lakh</td>
                        <td className="p-3 font-semibold text-slate-900">₹{(exp / 100000).toFixed(2)} Lakh</td>
                        <td className="p-3 font-semibold text-slate-600">₹{(bal / 100000).toFixed(2)} Lakh</td>
                        <td className="p-3 font-bold text-emerald-600">{pct}%</td>
                        <td className="p-3 text-right">
                          <Link href={`/projects/${p.id}`} className="text-blue-600 hover:underline font-bold">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
