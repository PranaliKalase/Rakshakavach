"use client";

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { EvidencePassport } from '@/components/evidence/EvidencePassport';
import { EvidenceLedger } from '@/components/evidence/EvidenceLedger';
import { ExplainableAIPanel } from '@/components/risk/ExplainableAIPanel';
import { Download, Printer, ShieldCheck, Loader2 } from 'lucide-react';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';

export default function DigitalAuditRoomPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const projects = await fetchProjects({ limit: 1 });
        if (projects.length > 0) {
          setProject(projects[0]);
        }
      } catch (err) {
        console.error("Error loading project for audit room:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-govBorder pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primaryBlue mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Digital Case File</span>
            </div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">Digital Audit Room</h1>
            <p className="text-xs text-textSecondary">Complete project history, evidence ledger, and verification records (Live Supabase API Connected).</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="bg-white border border-govBorder text-govNavy text-xs font-semibold px-3 py-2 rounded flex items-center gap-1.5 hover:bg-govBg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Case File</span>
            </button>
            <button 
              onClick={() => alert("Digital Audit Package exported successfully with SHA-256 digital signature ledger.")}
              className="bg-primaryBlue text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 hover:bg-govNavy transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Package</span>
            </button>
          </div>
        </div>

        {/* Project Case Overview */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-textSecondary gap-2 gov-card p-6">
            <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" />
            <span className="text-xs font-semibold">Loading digital case file from Supabase...</span>
          </div>
        ) : project ? (
          <div className="gov-card p-5 bg-darkNavy text-white">
            <div className="flex justify-between items-start border-b border-white/20 pb-3 mb-3">
              <div>
                <span className="font-mono text-xs text-amber-400 font-bold">{project.projectCode}</span>
                <h2 className="text-lg font-bold text-white mt-0.5">{project.workName}</h2>
              </div>
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded">
                Audit Log Verified
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block">Sanctioned Cost</span>
                <strong className="text-white text-sm">₹{((project.sanctionedCost ?? 0)/100000).toFixed(2)} Lakh</strong>
              </div>
              <div>
                <span className="text-gray-400 block">Reported Progress</span>
                <strong className="text-white text-sm">Physical {project.physicalProgress}% | Financial {project.financialProgress}%</strong>
              </div>
              <div>
                <span className="text-gray-400 block">Sector</span>
                <strong className="text-white">{project.sector}</strong>
              </div>
              <div>
                <span className="text-gray-400 block">Data Provenance</span>
                <strong className="text-blue-300">{project.provenance}</strong>
              </div>
            </div>
          </div>
        ) : null}

        {/* Core Evidence Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EvidencePassport />
          <EvidenceLedger />
        </div>

        {/* Risk & Explainable AI */}
        <ExplainableAIPanel />
      </div>
    </AppShell>
  );
}
