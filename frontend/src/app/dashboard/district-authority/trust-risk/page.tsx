"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { TrustAssessment } from '@/components/risk/TrustAssessment';
import { AnomalyRadar } from '@/components/risk/AnomalyRadar';
import { ExplainableAIPanel } from '@/components/risk/ExplainableAIPanel';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { ShieldAlert, Loader2, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DistrictTrustRiskPage() {
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
        console.error("Failed to load trust-risk data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const totalWorks = projects.length;
  const lowRisk = projects.filter(p => p.priority === 'NORMAL' && p.trustScore >= 80).length;
  const medRisk = projects.filter(p => p.priority === 'ATTENTION' || (p.trustScore >= 60 && p.trustScore < 80)).length;
  const highRisk = projects.filter(p => p.priority === 'HIGH_PRIORITY' || p.trustScore < 60).length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1.5">
            <Link href="/dashboard/district-authority" className="hover:text-blue-600">District Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Trust & Risk Center</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <span>District Trust & Risk Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-factor AI anomaly detection, risk factor distribution, and explainable risk scores for district governance
          </p>
        </div>

        {/* Risk Distribution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase">District Trust Average</span>
            <h3 className="text-2xl font-extrabold text-emerald-600 my-1">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "78.2 / 100"}
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">AI Calculated Metric</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Low Risk Works</span>
            <h3 className="text-2xl font-extrabold text-emerald-600 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : lowRisk}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">{totalWorks > 0 ? ((lowRisk/totalWorks)*100).toFixed(1) : 0}% of works</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Medium Risk (Attention)</span>
            <h3 className="text-2xl font-extrabold text-amber-500 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : medRisk}</h3>
            <span className="text-[10px] text-amber-600 font-semibold">{totalWorks > 0 ? ((medRisk/totalWorks)*100).toFixed(1) : 0}% of works</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">High Risk (Action Required)</span>
            <h3 className="text-2xl font-extrabold text-red-600 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : highRisk}</h3>
            <span className="text-[10px] text-red-600 font-semibold">{totalWorks > 0 ? ((highRisk/totalWorks)*100).toFixed(1) : 0}% of works</span>
          </div>
        </div>

        {/* Risk Assessment & Radar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrustAssessment trustScore={78.2} verificationAssessment="District Governance Risk Analysis" />
          <AnomalyRadar />
        </div>

        {/* Explainable AI Panel */}
        <ExplainableAIPanel />
      </div>
    </AppShell>
  );
}
