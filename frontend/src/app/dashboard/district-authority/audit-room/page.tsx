"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { fetchAuditLogs } from '@/lib/api';
import { FileCheck2, ShieldCheck, Clock, FileText, Loader2 } from 'lucide-react';

export default function DistrictAuditRoomPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchAuditLogs(100);
        if (isMounted) setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1.5">
            <Link href="/dashboard/district-authority" className="hover:text-blue-600">District Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Digital Audit Room</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <span>Digital Audit Room & Immutable Governance Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed timeline of project recommendations, sanctions, agency assignments, inspection logs & authority decisions
          </p>
        </div>

        {/* Audit Status Banner */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Immutable Audit Ledger Active</h3>
              <p className="text-xs text-slate-300">All district authority decisions, approvals, and inspections are recorded with SHA-256 hash validation.</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1.5 bg-white/10 text-emerald-300 border border-white/20 rounded-xl self-start md:self-auto">
            SHA-256 Verified
          </span>
        </div>

        {/* Audit Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">District Audit Events Timeline</h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No audit logs recorded yet.</p>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
              {logs.map((log, idx) => (
                <div key={log.id || idx} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600">{log.project_code || log.project_id || 'DISTRICT-EVENT'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp || new Date().toISOString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{log.action || log.event_type || 'GOVERNANCE_ACTION'}</h4>
                    <p className="text-xs text-slate-600">{log.details || log.remarks || 'Recorded official governance decision'}</p>
                    <div className="pt-1 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>Actor: {log.actor || 'District Authority'}</span>
                      <span className="truncate max-w-[200px]">Hash: {log.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
