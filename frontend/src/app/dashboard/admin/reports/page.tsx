"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { 
  BarChart3, 
  Download, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  FileCheck2,
  Table
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  title: string;
  category: string;
  frequency: string;
  lastGenerated: string;
  size: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'RPT-01', title: 'Comprehensive MPLADS Financial Expenditure Summary Report', category: 'Financial Audit', frequency: 'Monthly', lastGenerated: '2026-09-24', size: '2.4 MB' },
  { id: 'RPT-02', title: 'Field Verification & Monitoring Officer Performance Report', category: 'Verification', frequency: 'Fortnightly', lastGenerated: '2026-09-20', size: '1.8 MB' },
  { id: 'RPT-03', title: 'AI Anomaly Detection & Trust Score Evaluation Summary', category: 'AI Governance', frequency: 'Weekly', lastGenerated: '2026-09-22', size: '3.1 MB' },
  { id: 'RPT-04', title: 'Constituency Project Lifecycle & Completion Performance', category: 'Oversight', frequency: 'Quarterly', lastGenerated: '2026-09-01', size: '4.5 MB' },
];

export default function ReportsPage() {
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const handleDownload = (rptTitle: string, format: string) => {
    setDownloadMsg(`Report "${rptTitle}" prepared and exported in ${format.toUpperCase()} format.`);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="Reports Engine" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
              Reports Engine & Multi-Format Data Exports
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Generate, schedule, and export comprehensive official reports across financial expenditures, field verifications, AI anomaly scores, and audit ledgers.
            </p>
          </div>
        </div>

        {downloadMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadMsg}</span>
            </div>
            <button onClick={() => setDownloadMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Report Templates" value={REPORT_TEMPLATES.length.toString()} subtitle="Standard Formats" icon={<BarChart3 className="w-5 h-5 text-cyan-600" />} />
          <KPICard title="Supported Formats" value="PDF / XLS / CSV" subtitle="Official Formats" icon={<FileText className="w-5 h-5 text-primaryBlue" />} />
          <KPICard title="Generated Reports" value="128" subtitle="FY 2025-26" icon={<FileCheck2 className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Export Engine" value="Ready" subtitle="Real-time Stream" icon={<Download className="w-5 h-5 text-indigo-600" />} />
        </div>

        {/* Saved Report Templates Repository */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-600" />
              OFFICIAL REPORT REPOSITORY & EXPORT GENERATOR
            </h3>
          </div>

          <div className="space-y-3">
            {REPORT_TEMPLATES.map(rpt => (
              <div key={rpt.id} className="p-4 bg-white border border-govBorder rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-primaryBlue/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-primaryBlue">{rpt.id}</span>
                    <strong className="text-sm font-bold text-govNavy">{rpt.title}</strong>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-textSecondary">
                    <span>Category: <strong className="text-govNavy">{rpt.category}</strong></span>
                    <span>Frequency: <strong className="text-govNavy">{rpt.frequency}</strong></span>
                    <span>Last Generated: <strong className="text-govNavy">{rpt.lastGenerated}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleDownload(rpt.title, 'pdf')}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button 
                    onClick={() => handleDownload(rpt.title, 'excel')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 shadow-xs"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                  <button 
                    onClick={() => handleDownload(rpt.title, 'csv')}
                    className="bg-govNavy hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
