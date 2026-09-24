"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { BarChart3, Download, FileSpreadsheet, FileText, CheckCircle2, Loader2, Printer } from 'lucide-react';

export default function DistrictReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchProjects(500);
        if (isMounted) setProjects(data);
      } catch (err) {
        console.error("Failed to load reports data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleExport = (reportName: string, format: 'PDF' | 'Excel') => {
    setDownloading(`${reportName}-${format}`);
    setTimeout(() => {
      setDownloading(null);
      alert(`Exporting ${reportName} (${format} format) for District Authority Collectorate Scope.`);
    }, 800);
  };

  const reportsList = [
    {
      title: "District Governance Summary Report",
      description: "Comprehensive district-wide overview of recommended, sanctioned, active, completed, and verified works.",
      badge: "Monthly / Quarterly"
    },
    {
      title: "Financial Monitoring & Utilization Report",
      description: "Detailed expenditure audit, sanctioned budget, tranche releases, utilization percentage & cost variance analysis.",
      badge: "Financial Audit"
    },
    {
      title: "Physical Progress & Timeline Report",
      description: "Ground physical completion progress, delay variance metrics, milestone tracking & completion forecasts.",
      badge: "Progress Tracking"
    },
    {
      title: "District Risk & Anomaly Assessment Report",
      description: "AI multi-factor anomaly engine outputs, flagged Z-scores, peer benchmark cost deviations & risk categories.",
      badge: "Risk & AI"
    },
    {
      title: "Trust Score & Integrity Audit Report",
      description: "District trust index ratings, evidence completeness ledger, inspection outcomes & SHA-256 audit records.",
      badge: "Integrity"
    }
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1.5">
            <Link href="/dashboard/district-authority" className="hover:text-blue-600">District Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Reports & Analytics</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>District Reports & Governance Analytics Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate, view, and export official district MPLADS summary reports in PDF and Excel formats
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportsList.map((report) => (
            <div key={report.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                    {report.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{report.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Live Data: {projects.length} Works Bound</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport(report.title, 'PDF')}
                    disabled={downloading === `${report.title}-PDF`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-400" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => handleExport(report.title, 'Excel')}
                    disabled={downloading === `${report.title}-Excel`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
