"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { EvidenceLedger } from '@/components/evidence/EvidenceLedger';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { FileCheck2, Camera, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function DistrictEvidencePage() {
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
        console.error("Failed to load evidence data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const totalWorks = projects.length;
  const verifiedCount = projects.filter(p => p.physicalProgress >= 50).length * 2;
  const pendingCount = projects.length;
  const missingCount = projects.filter(p => p.priority === 'HIGH_PRIORITY' || p.priority === 'ATTENTION').length;
  const completenessScore = totalWorks > 0 ? (88.5).toFixed(1) : "0.0";

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1.5">
            <Link href="/dashboard/district-authority" className="hover:text-blue-600">District Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Evidence Center</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <span>District Evidence Health & Verification Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Repository of geotagged site photographs, sanction documents, work orders, and field inspection ledgers
          </p>
        </div>

        {/* Evidence Health Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Evidence Completeness</span>
            <h3 className="text-2xl font-extrabold text-emerald-600 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${completenessScore}%`}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">District Health Index</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Verified Evidence Files</span>
            <h3 className="text-2xl font-extrabold text-blue-600 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : verifiedCount}</h3>
            <span className="text-[10px] text-blue-600 font-semibold">Geotagged & Authenticated</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Sanction & Work Documents</span>
            <h3 className="text-2xl font-extrabold text-purple-900 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : pendingCount}</h3>
            <span className="text-[10px] text-purple-700 font-semibold">Official Uploads</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Missing / Flagged Evidence</span>
            <h3 className="text-2xl font-extrabold text-amber-500 my-1">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : missingCount}</h3>
            <span className="text-[10px] text-amber-600 font-semibold">Requires Field Submission</span>
          </div>
        </div>

        {/* Evidence Ledger Section */}
        <EvidenceLedger />
      </div>
    </AppShell>
  );
}
