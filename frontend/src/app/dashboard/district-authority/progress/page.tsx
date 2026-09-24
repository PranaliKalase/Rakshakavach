"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { BarChart3, TrendingUp, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function DistrictProgressPage() {
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
        console.error("Failed to load progress data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const total = projects.length;
  const completed = projects.filter(p => p.physicalProgress >= 100 || p.status === 'COMPLETED').length;
  const nearCompletion = projects.filter(p => p.physicalProgress >= 80 && p.physicalProgress < 100).length;
  const onTrack = projects.filter(p => p.physicalProgress >= 40 && p.physicalProgress < 80 && p.priority === 'NORMAL').length;
  const delayed = projects.filter(p => (p.physicalProgress < p.financialProgress - 15) || p.priority === 'ATTENTION').length;
  const criticalDelay = projects.filter(p => p.priority === 'HIGH_PRIORITY' || (p.physicalProgress < 25 && p.financialProgress > 50)).length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1.5">
            <Link href="/dashboard/district-authority" className="hover:text-blue-600">District Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Progress Monitoring</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>District Physical vs Financial Progress Monitoring</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time physical completion tracking, timeline variance analysis, and milestone forecasting for all district works
          </p>
        </div>

        {/* 5 PROGRESS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">On Track</span>
            <h3 className="text-2xl font-extrabold text-emerald-600 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : onTrack}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">Normal Schedule</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Near Completion</span>
            <h3 className="text-2xl font-extrabold text-blue-600 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : nearCompletion}</h3>
            <span className="text-[10px] text-blue-600 font-semibold">80%–99% Physical</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-700">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Completed</span>
            <h3 className="text-2xl font-extrabold text-slate-900 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : completed}</h3>
            <span className="text-[10px] text-emerald-700 font-semibold">100% Finished</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Delayed</span>
            <h3 className="text-2xl font-extrabold text-amber-500 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : delayed}</h3>
            <span className="text-[10px] text-amber-600 font-semibold">Progress Lag</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Critical Delay</span>
            <h3 className="text-2xl font-extrabold text-red-600 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : criticalDelay}</h3>
            <span className="text-[10px] text-red-600 font-semibold">Action Required</span>
          </div>
        </div>

        {/* Physical vs Financial Comparison Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Physical vs Financial Gap Analysis</h3>
            <span className="text-xs font-semibold text-slate-500">Top 10 Active Works</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Work Name</th>
                  <th className="p-3">Physical %</th>
                  <th className="p-3">Financial %</th>
                  <th className="p-3">Progress Gap</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {projects.slice(0, 10).map(p => {
                  const gap = (p.physicalProgress || 0) - (p.financialProgress || 0);
                  const isLagging = gap < -15;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-blue-600">{p.projectCode}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{p.workName}</td>
                      <td className="p-3 font-bold text-emerald-600">{p.physicalProgress}%</td>
                      <td className="p-3 font-bold text-blue-600">{p.financialProgress}%</td>
                      <td className="p-3">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          isLagging ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {gap > 0 ? `+${gap.toFixed(1)}%` : `${gap.toFixed(1)}%`}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{p.status}</td>
                      <td className="p-3 text-right">
                        <Link href={`/projects/${p.id}`} className="text-blue-600 font-bold hover:underline">
                          Inspect →
                        </Link>
                      </td>
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
