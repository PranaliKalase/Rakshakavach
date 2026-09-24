"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { 
  Lock, 
  ShieldAlert, 
  UserX, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  Eye,
  Key,
  ShieldCheck
} from 'lucide-react';

interface SecurityIncident {
  id: string;
  type: string;
  targetUser: string;
  sourceIp: string;
  timestamp: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'RESOLVED' | 'INVESTIGATING';
}

const INCIDENTS: SecurityIncident[] = [
  { id: 'SEC-01', type: 'Multiple Failed Login Attempts', targetUser: 'usr-ia-pwd@pune.gov.in', sourceIp: '192.168.1.104', timestamp: '2026-09-24 11:45', severity: 'HIGH', status: 'INVESTIGATING' },
  { id: 'SEC-02', type: 'Role Escalation Audit Verification', targetUser: 'usr-da-official', sourceIp: '10.0.4.12', timestamp: '2026-09-23 16:20', severity: 'MEDIUM', status: 'RESOLVED' },
  { id: 'SEC-03', type: 'Unrecognized IP Session Access', targetUser: 'usr-mo-official', sourceIp: '172.16.0.45', timestamp: '2026-09-22 09:15', severity: 'LOW', status: 'RESOLVED' },
];

export default function SecurityCenterPage() {
  const [incidentList, setIncidentList] = useState<SecurityIncident[]>(INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const handleResolveIncident = (id: string) => {
    setIncidentList(prev => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, status: 'RESOLVED' };
      }
      return inc;
    }));
    setActionMsg(`Security incident ${id} marked as RESOLVED.`);
    setSelectedIncident(null);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="Security Center" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs">
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
            Security Center & Incident Investigation Panel
          </h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Monitor failed authentication attempts, locked accounts, role escalation audits, suspicious IP sessions, and security incident resolutions.
          </p>
        </div>

        {actionMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionMsg}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Security Incidents" value={incidentList.length.toString()} subtitle="Recorded Events" icon={<Lock className="w-5 h-5 text-rose-600" />} />
          <KPICard title="Active Investigations" value={incidentList.filter(i => i.status === 'INVESTIGATING').length.toString()} subtitle="Open Incidents" icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} accentColor="border-l-amber-500" />
          <KPICard title="Failed Logins (24h)" value="4" subtitle="IP Throttled" icon={<UserX className="w-5 h-5 text-red-600" />} />
          <KPICard title="Protection Status" value="ACTIVE" subtitle="Firewall & RLS Active" icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />} />
        </div>

        {/* Incident Investigation Table */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              SECURITY INCIDENTS & AUDIT EVENT LOG
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px]">
                  <th className="p-3">Incident ID</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Target Persona Email</th>
                  <th className="p-3">Source IP</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govBorder">
                {incidentList.map((inc) => (
                  <tr key={inc.id} className="hover:bg-govBg/50">
                    <td className="p-3 font-mono font-bold text-rose-700">{inc.id}</td>
                    <td className="p-3 font-bold text-govNavy">{inc.type}</td>
                    <td className="p-3 font-mono text-[11px] text-textSecondary">{inc.targetUser}</td>
                    <td className="p-3 font-mono text-[11px] text-govNavy">{inc.sourceIp}</td>
                    <td className="p-3">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                        inc.severity === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => setSelectedIncident(inc)}
                        className="bg-govBg hover:bg-slate-200 text-govNavy font-bold text-[10px] px-2.5 py-1 rounded border border-govBorder"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investigation Drawer Modal */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-lg border border-govBorder max-w-lg w-full p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-govBorder pb-3">
                <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  INCIDENT INVESTIGATION PANEL — {selectedIncident.id}
                </h3>
                <button onClick={() => setSelectedIncident(null)} className="text-textSecondary hover:text-govNavy font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-red-50 border border-red-200 rounded space-y-1 text-red-900">
                  <span className="font-bold text-xs">{selectedIncident.type}</span>
                  <p className="text-[11px]">Source IP {selectedIncident.sourceIp} attempted unauthenticated access to target persona account {selectedIncident.targetUser}.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-govBg border border-govBorder rounded">
                  <div>
                    <span className="text-[10px] text-textSecondary font-semibold block">Timestamp</span>
                    <strong className="text-govNavy font-mono">{selectedIncident.timestamp}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-textSecondary font-semibold block">Current Status</span>
                    <strong className="text-amber-800 font-bold">{selectedIncident.status}</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-govBorder pt-3">
                <button onClick={() => setSelectedIncident(null)} className="px-3 py-1.5 bg-govBg text-govNavy font-bold text-xs rounded">Close</button>
                {selectedIncident.status !== 'RESOLVED' && (
                  <button onClick={() => handleResolveIncident(selectedIncident.id)} className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded">Mark as Resolved</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
