"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { fetchProjects, fetchAuditLogs } from '@/lib/api';
import { 
  Users, 
  ShieldCheck, 
  HeartPulse, 
  FileCheck2, 
  Bot, 
  ShieldAlert, 
  CheckSquare, 
  Bell, 
  BarChart3, 
  Settings, 
  Lock, 
  Clock, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Database,
  Activity
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [projectCount, setProjectCount] = useState<number>(0);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [projs, logs] = await Promise.all([
          fetchProjects(100),
          fetchAuditLogs(20)
        ]);
        setProjectCount(projs.length);
        setAuditLogs(logs);
      } catch (err) {
        console.error("Error loading Admin Overview:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const adminModules = [
    { name: 'User Management', path: '/dashboard/admin/users', desc: 'Manage system personas, credentials, and access statuses.', icon: Users, color: 'text-blue-600', count: '14 Active' },
    { name: 'Role Management', path: '/dashboard/admin/roles', desc: 'RBAC permissions matrix and role escalation history.', icon: ShieldCheck, color: 'text-indigo-600', count: '5 Roles' },
    { name: 'System Health', path: '/dashboard/admin/system-health', desc: 'Real-time API, DB, storage, and background cron status.', icon: HeartPulse, color: 'text-emerald-600', count: 'Operational' },
    { name: 'Audit Center', path: '/dashboard/admin/audit-center', desc: 'Cryptographic SHA-256 audit ledger & state history.', icon: FileCheck2, color: 'text-purple-600', count: 'Verified' },
    { name: 'AI Governance', path: '/dashboard/admin/ai-governance', desc: 'IsolationForest model health, contamination & explainability.', icon: Bot, color: 'text-emerald-500', count: 'Engine v1.0' },
    { name: 'Trust Monitoring', path: '/dashboard/admin/trust-monitoring', desc: 'Trust Score distribution and district risk benchmarks.', icon: ShieldAlert, color: 'text-red-600', count: 'Score 92.5' },
    { name: 'Data Quality', path: '/dashboard/admin/data-quality', desc: 'Missing GPS coordinates, invalid refs, and cleanup reports.', icon: CheckSquare, color: 'text-amber-600', count: '98.4% Clean' },
    { name: 'Security Center', path: '/dashboard/admin/security', desc: 'Failed logins, locked accounts, and security incidents.', icon: Lock, color: 'text-rose-600', count: '0 Incidents' },
    { name: 'Notifications', path: '/dashboard/admin/notifications', desc: 'System alert broadcast & automated alert history.', icon: Bell, color: 'text-amber-500', count: '5 Unread' },
    { name: 'Reports Engine', path: '/dashboard/admin/reports', desc: 'Generate & export PDF, Excel, and CSV audit reports.', icon: BarChart3, color: 'text-cyan-600', count: 'Exports Ready' },
    { name: 'System Settings', path: '/dashboard/admin/settings', desc: 'Financial year, feature toggles, and trust score thresholds.', icon: Settings, color: 'text-slate-600', count: 'FY 2025-26' },
    { name: 'Activity Logs', path: '/dashboard/admin/activity-logs', desc: 'Comprehensive system user activity timeline.', icon: Clock, color: 'text-blue-500', count: 'Live Stream' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="Overview" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-darkNavy text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                PLATFORM & SECURITY ADMINISTRATION
              </span>
              <span className="text-xs text-textSecondary font-mono font-bold">Admin Workspace</span>
            </div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight mt-1">
              System Administration Workspace
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Full platform oversight, role-based access control, system health monitoring, and AI trust governance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link 
              href="/dashboard/admin/users" 
              className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </Link>
            <Link 
              href="/dashboard/admin/system-health" 
              className="bg-govBg hover:bg-slate-200 text-govNavy border border-govBorder font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition-colors"
            >
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              <span>System Health</span>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPICard title="Total Database Works" value={loading ? "..." : projectCount.toString()} subtitle="Active Population" icon={<Database className="w-5 h-5 text-primaryBlue" />} />
          <KPICard title="System Users" value="14" subtitle="Active Personas" icon={<Users className="w-5 h-5 text-indigo-600" />} />
          <KPICard title="System Health" value="100%" subtitle="Services Operational" icon={<HeartPulse className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="AI Engine Status" value="Online" subtitle="IsolationForest v1.0" icon={<Bot className="w-5 h-5 text-emerald-500" />} />
          <KPICard title="Audit Log Entries" value={loading ? "..." : auditLogs.length.toString()} subtitle="SHA-256 Ledger" icon={<FileCheck2 className="w-5 h-5 text-purple-600" />} />
        </div>

        {/* Quick Module Navigation Grid */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-primaryBlue" />
              ADMINISTRATION MODULES ({adminModules.length})
            </h3>
            <span className="text-xs text-textSecondary font-semibold">Click module to launch dedicated control space</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {adminModules.map((m) => {
              const Icon = m.icon;
              return (
                <Link 
                  key={m.path} 
                  href={m.path}
                  className="p-4 bg-white border border-govBorder rounded-lg hover:border-primaryBlue hover:shadow-md transition-all group space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-govBg rounded-lg group-hover:bg-blue-50 transition-colors">
                        <Icon className={`w-5 h-5 ${m.color}`} />
                      </div>
                      <span className="text-[10px] font-bold bg-govBg px-2 py-0.5 rounded text-govNavy border border-govBorder">
                        {m.count}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-govNavy group-hover:text-primaryBlue transition-colors flex items-center justify-between">
                      <span>{m.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primaryBlue transition-colors" />
                    </h4>
                    <p className="text-[11px] text-textSecondary leading-snug">{m.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Live Audit Log Stream */}
        <div className="gov-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-govBorder">
            <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-purple-600" />
              RECENT SYSTEM AUDIT LEDGER ACTIVITY
            </h3>
            <Link href="/dashboard/admin/audit-center" className="text-xs text-primaryBlue font-bold hover:underline flex items-center gap-1">
              <span>View Full Audit Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-6 flex justify-center text-xs text-textSecondary gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primaryBlue" />
              <span>Loading cryptographic audit stream...</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-textSecondary">
              No recent audit activity recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px]">
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Actor ID / Role</th>
                    <th className="p-2.5">Action Code</th>
                    <th className="p-2.5">Project / Entity</th>
                    <th className="p-2.5">Cryptographic Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govBorder">
                  {auditLogs.slice(0, 5).map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-govBg/50">
                      <td className="p-2.5 font-mono text-[11px] text-textSecondary">{log.timestamp || new Date().toISOString()}</td>
                      <td className="p-2.5 font-semibold text-govNavy">{log.actor_id || "usr-admin"}</td>
                      <td className="p-2.5"><span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.5 rounded">{log.action || "SYSTEM_AUDIT"}</span></td>
                      <td className="p-2.5 font-mono text-primaryBlue font-bold">{log.project_id || "SYSTEM"}</td>
                      <td className="p-2.5 font-mono text-[10px] text-gray-500">{log.hash || "a8f9c1b3d...e4f2"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
