"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  History, 
  Edit3, 
  Check, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface PermissionDefinition {
  code: string;
  name: string;
  category: string;
}

const PERMISSIONS: PermissionDefinition[] = [
  { code: 'PERM_RECOMMEND_WORK', name: 'Recommend MPLADS Work', category: 'Project Lifecycle' },
  { code: 'PERM_SANCTION_WORK', name: 'Sanction & Approve Work', category: 'Governance & Finance' },
  { code: 'PERM_ASSIGN_AGENCY', name: 'Assign Implementing Agency', category: 'Governance & Finance' },
  { code: 'PERM_UPDATE_PROGRESS', name: 'Report Physical & Financial Progress', category: 'Execution & Evidence' },
  { code: 'PERM_SUBMIT_EVIDENCE', name: 'Upload Geo-Tagged Site Photo Evidence', category: 'Execution & Evidence' },
  { code: 'PERM_FIELD_INSPECT', name: 'Conduct Field Inspection & Observation', category: 'Verification' },
  { code: 'PERM_VIEW_AUDIT', name: 'Access Digital Audit Room & Ledger', category: 'Audit & Compliance' },
  { code: 'PERM_MANAGE_USERS', name: 'Manage System Users & Personas', category: 'Administration' },
  { code: 'PERM_CONFIGURE_AI', name: 'Configure AI Model & Thresholds', category: 'Administration' },
];

const INITIAL_RBAC_MATRIX: Record<string, Record<string, boolean>> = {
  MP: {
    PERM_RECOMMEND_WORK: true,
    PERM_SANCTION_WORK: false,
    PERM_ASSIGN_AGENCY: false,
    PERM_UPDATE_PROGRESS: false,
    PERM_SUBMIT_EVIDENCE: false,
    PERM_FIELD_INSPECT: false,
    PERM_VIEW_AUDIT: true,
    PERM_MANAGE_USERS: false,
    PERM_CONFIGURE_AI: false,
  },
  DISTRICT_AUTHORITY: {
    PERM_RECOMMEND_WORK: false,
    PERM_SANCTION_WORK: true,
    PERM_ASSIGN_AGENCY: true,
    PERM_UPDATE_PROGRESS: false,
    PERM_SUBMIT_EVIDENCE: false,
    PERM_FIELD_INSPECT: false,
    PERM_VIEW_AUDIT: true,
    PERM_MANAGE_USERS: false,
    PERM_CONFIGURE_AI: false,
  },
  IMPLEMENTING_AGENCY: {
    PERM_RECOMMEND_WORK: false,
    PERM_SANCTION_WORK: false,
    PERM_ASSIGN_AGENCY: false,
    PERM_UPDATE_PROGRESS: true,
    PERM_SUBMIT_EVIDENCE: true,
    PERM_FIELD_INSPECT: false,
    PERM_VIEW_AUDIT: true,
    PERM_MANAGE_USERS: false,
    PERM_CONFIGURE_AI: false,
  },
  MONITORING_OFFICER: {
    PERM_RECOMMEND_WORK: false,
    PERM_SANCTION_WORK: false,
    PERM_ASSIGN_AGENCY: false,
    PERM_UPDATE_PROGRESS: false,
    PERM_SUBMIT_EVIDENCE: true,
    PERM_FIELD_INSPECT: true,
    PERM_VIEW_AUDIT: true,
    PERM_MANAGE_USERS: false,
    PERM_CONFIGURE_AI: false,
  },
  ADMIN: {
    PERM_RECOMMEND_WORK: true,
    PERM_SANCTION_WORK: true,
    PERM_ASSIGN_AGENCY: true,
    PERM_UPDATE_PROGRESS: true,
    PERM_SUBMIT_EVIDENCE: true,
    PERM_FIELD_INSPECT: true,
    PERM_VIEW_AUDIT: true,
    PERM_MANAGE_USERS: true,
    PERM_CONFIGURE_AI: true,
  }
};

export default function RoleManagementPage() {
  const [matrix, setMatrix] = useState(INITIAL_RBAC_MATRIX);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const togglePermission = (role: string, permCode: string) => {
    if (role === 'ADMIN' && (permCode === 'PERM_MANAGE_USERS' || permCode === 'PERM_CONFIGURE_AI')) {
      return; // Protect critical admin permissions from lockout
    }
    setMatrix(prev => {
      const currentVal = prev[role][permCode];
      const updated = {
        ...prev,
        [role]: {
          ...prev[role],
          [permCode]: !currentVal
        }
      };
      setSuccessMsg(`Permission '${permCode}' for role ${role} updated to ${!currentVal ? 'ENABLED' : 'DISABLED'}.`);
      return updated;
    });
  };

  const roleAuditLogs = [
    { id: 'RL-01', timestamp: '2026-09-24 10:30', role: 'MONITORING_OFFICER', perm: 'PERM_SUBMIT_EVIDENCE', actor: 'usr-admin-01', action: 'GRANTED' },
    { id: 'RL-02', timestamp: '2026-09-20 14:15', role: 'IMPLEMENTING_AGENCY', perm: 'PERM_VIEW_AUDIT', actor: 'usr-admin-01', action: 'GRANTED' },
    { id: 'RL-03', timestamp: '2026-09-15 09:00', role: 'DISTRICT_AUTHORITY', perm: 'PERM_SANCTION_WORK', actor: 'usr-admin-01', action: 'VERIFIED' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="Role Management" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs">
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
            Role Management & RBAC Authorization Matrix
          </h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Define granular Role-Based Access Control (RBAC) permissions across system personas and maintain an immutable permission change audit log.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Configured Roles" value="5" subtitle="System Stakeholders" icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />} />
          <KPICard title="Granular Permissions" value={PERMISSIONS.length.toString()} subtitle="Action Policies" icon={<Lock className="w-5 h-5 text-primaryBlue" />} />
          <KPICard title="RBAC Policy Status" value="Enforced" subtitle="Strict Isolation" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Permission Changes" value={roleAuditLogs.length.toString()} subtitle="Audited Actions" icon={<History className="w-5 h-5 text-purple-600" />} />
        </div>

        {/* RBAC Matrix Table */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primaryBlue" />
              GRANULAR RBAC PERMISSIONS MATRIX
            </h3>
            <p className="text-[11px] text-textSecondary mt-0.5">Click any checkbox toggle to dynamically modify active role capabilities in real time.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-govBg border-b border-govBorder text-govNavy font-bold uppercase text-[10px]">
                  <th className="p-3 border-r border-govBorder">Permission Capability</th>
                  <th className="p-3 text-center border-r border-govBorder">MP</th>
                  <th className="p-3 text-center border-r border-govBorder">District Authority</th>
                  <th className="p-3 text-center border-r border-govBorder">Implementing Agency</th>
                  <th className="p-3 text-center border-r border-govBorder">Monitoring Officer</th>
                  <th className="p-3 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govBorder">
                {PERMISSIONS.map((perm) => (
                  <tr key={perm.code} className="hover:bg-govBg/50">
                    <td className="p-3 border-r border-govBorder">
                      <strong className="text-govNavy block">{perm.name}</strong>
                      <span className="text-[10px] text-textSecondary font-mono">{perm.code} ({perm.category})</span>
                    </td>

                    {['MP', 'DISTRICT_AUTHORITY', 'IMPLEMENTING_AGENCY', 'MONITORING_OFFICER', 'ADMIN'].map((roleKey) => {
                      const isAllowed = matrix[roleKey]?.[perm.code] || false;
                      return (
                        <td key={roleKey} className="p-3 text-center border-r border-govBorder">
                          <button
                            onClick={() => togglePermission(roleKey, perm.code)}
                            className={`p-1.5 rounded border text-xs font-bold transition-all ${
                              isAllowed 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                                : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {isAllowed ? <Check className="w-4 h-4 text-emerald-700 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Audit History */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              PERMISSION CHANGE AUDIT LOG
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px]">
                  <th className="p-2.5">Log ID</th>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Target Role</th>
                  <th className="p-2.5">Permission Code</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Actor ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govBorder">
                {roleAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-govBg/50">
                    <td className="p-2.5 font-mono text-primaryBlue font-bold">{log.id}</td>
                    <td className="p-2.5 text-textSecondary font-mono">{log.timestamp}</td>
                    <td className="p-2.5 font-bold text-govNavy">{log.role}</td>
                    <td className="p-2.5 font-mono text-xs">{log.perm}</td>
                    <td className="p-2.5"><span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">{log.action}</span></td>
                    <td className="p-2.5 text-textSecondary font-mono">{log.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
