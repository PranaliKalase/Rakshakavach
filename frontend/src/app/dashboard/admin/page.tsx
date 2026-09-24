"use client";

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { fetchProjects, fetchAuditLogs, fetchVerificationQueue, fetchRecommendationsSummary } from '@/lib/api';
import { Project } from '@/types/project';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Database, 
  Bot, 
  Activity, 
  Plus, 
  Lock,
  Loader2,
  FileCheck,
  PieChart,
  MapPin
} from 'lucide-react';
import { DEMO_USERS } from '@/lib/constants';

export default function AdminDashboardRedirectPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'recommendations' | 'users' | 'agencies' | 'logs'>('system');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [usersList, setUsersList] = useState(Object.values(DEMO_USERS));
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('MONITORING_OFFICER');

  const [projects, setProjects] = useState<Project[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [recSummary, setRecSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [projData, queueData, logData, recSumData] = await Promise.all([
          fetchProjects(500),
          fetchVerificationQueue(100),
          fetchAuditLogs(100),
          fetchRecommendationsSummary()
        ]);
        setProjects(projData);
        setQueue(queueData);
        setAuditLogs(logData);
        setRecSummary(recSumData);
      } catch (err) {
        console.error("Error loading Admin Dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;

    const createdUser = {
      id: `usr-new-${Date.now()}`,
      email: newUserEmail,
      fullName: newUserName,
      role: newUserRole as any,
      districtId: 'dist-delhi-01'
    };

    setUsersList([...usersList, createdUser]);
    setNewUserEmail('');
    setNewUserName('');
    setShowAddUserModal(false);
  };

  const totalSanctioned = projects.reduce((s, p) => s + (p.sanctionedCost || 0), 0);
  const formattedBudget = totalSanctioned >= 10000000 
    ? `₹${(totalSanctioned / 10000000).toFixed(2)} Cr`
    : `₹${(totalSanctioned / 100000).toFixed(2)} Lakh`;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-govBorder pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
              <Lock className="w-4 h-4" />
              <span>System Administrator Portal</span>
            </div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">System Administration & Infrastructure Governance</h1>
            <p className="text-xs text-textSecondary mt-0.5">User accounts, role assignments, MP recommendation analytics, audit trails, and infrastructure health.</p>
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="bg-primaryBlue hover:bg-govNavy text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Officer Profile</span>
          </button>
        </div>

        {/* System Health & Recommendation KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Total Database Projects" value={loading ? "..." : projects.length.toString()} subtitle="Supabase Population" icon={<Database className="w-5 h-5 text-primaryBlue" />} />
          <KPICard title="MP Recommendations" value={loading ? "..." : (recSummary?.total_recommendations || 0).toString()} subtitle="Database Persisted" icon={<FileCheck className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Verification Queue" value={loading ? "..." : queue.length.toString()} subtitle="Pending Review" icon={<ShieldCheck className="w-5 h-5 text-amber-500" />} />
          <KPICard title="Audit Event Logs" value={loading ? "..." : `${auditLogs.length} Records`} subtitle="Append-Only Log" icon={<Activity className="w-5 h-5 text-primaryBlue" />} />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-govBorder text-xs font-bold overflow-x-auto">
          {(['system', 'recommendations', 'users', 'agencies', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab ? 'border-primaryBlue text-primaryBlue bg-white' : 'border-transparent text-textSecondary hover:text-govNavy'
              }`}
            >
              {tab === 'system' ? 'Infrastructure Monitoring' : 
               tab === 'recommendations' ? 'MP Recommendations Analytics' :
               tab === 'users' ? 'User & Role Management' : 
               tab === 'agencies' ? 'Agencies & Geography' : 'Append-Only Audit Logs'}
            </button>
          ))}
        </div>

        {/* Tab 1: System Infrastructure Monitoring */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="gov-card p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-govBorder">
                <span className="font-bold text-xs text-govNavy flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Supabase Database
                </span>
                <span className="gov-badge bg-emerald-100 text-statusGreen border border-emerald-200">Connected</span>
              </div>
              <p className="text-[11px] text-textSecondary">Live Supabase PostgreSQL Database with mp_recommendations & public tables.</p>
              <div className="text-[10px] font-mono text-gray-500 pt-1">Active Projects: {projects.length} • Recommendations: {recSummary?.total_recommendations || 0}</div>
            </div>

            <div className="gov-card p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-govBorder">
                <span className="font-bold text-xs text-govNavy flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  FastAPI REST Engine
                </span>
                <span className="gov-badge bg-emerald-100 text-statusGreen border border-emerald-200">Healthy</span>
              </div>
              <p className="text-[11px] text-textSecondary">FastAPI backend running on http://localhost:8000 with CORS allowed.</p>
              <div className="text-[10px] font-mono text-gray-500 pt-1">Queue Size: {queue.length} • Audit Logs: {auditLogs.length}</div>
            </div>

            <div className="gov-card p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-govBorder">
                <span className="font-bold text-xs text-govNavy flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-600" />
                  Python AI / Risk Model
                </span>
                <span className="gov-badge bg-emerald-100 text-statusGreen border border-emerald-200">Online</span>
              </div>
              <p className="text-[11px] text-textSecondary">Scikit-Learn Isolation Forest model & 6-factor weighted Trust Score engine active.</p>
              <div className="text-[10px] font-mono text-gray-500 pt-1">Model Version: v1.0.0 • Persistent Joblib Model</div>
            </div>
          </div>
        )}

        {/* Tab 2: MP RECOMMENDATIONS DYNAMIC ANALYTICS (CORE REQUIREMENT) */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recommendations By MP */}
              <div className="gov-card p-5 space-y-3">
                <h3 className="text-xs font-bold text-govNavy uppercase border-b border-govBorder pb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primaryBlue" />
                  <span>Recommendations by MP</span>
                </h3>
                {recSummary?.by_mp ? (
                  <div className="space-y-2 text-xs">
                    {Object.entries(recSummary.by_mp).map(([mp, cnt]: [string, any]) => (
                      <div key={mp} className="flex justify-between items-center p-2 bg-govBg border border-govBorder rounded">
                        <span className="font-bold text-govNavy truncate max-w-[180px]">{mp}</span>
                        <span className="font-mono font-bold text-primaryBlue">{cnt} Works</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-textSecondary text-xs">No MP recommendation distribution data available.</p>
                )}
              </div>

              {/* Recommendations By District */}
              <div className="gov-card p-5 space-y-3">
                <h3 className="text-xs font-bold text-govNavy uppercase border-b border-govBorder pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Recommendations by District</span>
                </h3>
                {recSummary?.by_district ? (
                  <div className="space-y-2 text-xs">
                    {Object.entries(recSummary.by_district).map(([dist, cnt]: [string, any]) => (
                      <div key={dist} className="flex justify-between items-center p-2 bg-govBg border border-govBorder rounded">
                        <span className="font-bold text-govNavy font-mono">{dist}</span>
                        <span className="font-mono font-bold text-emerald-700">{cnt} Works</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-textSecondary text-xs">No district recommendation data available.</p>
                )}
              </div>

              {/* Status Distribution */}
              <div className="gov-card p-5 space-y-3">
                <h3 className="text-xs font-bold text-govNavy uppercase border-b border-govBorder pb-2 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-amber-500" />
                  <span>Status Distribution</span>
                </h3>
                {recSummary?.status_distribution ? (
                  <div className="space-y-2 text-xs">
                    {Object.entries(recSummary.status_distribution).map(([st, cnt]: [string, any]) => (
                      <div key={st} className="flex justify-between items-center p-2 bg-govBg border border-govBorder rounded">
                        <span className="font-bold text-govNavy">{st}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-primaryBlue">{cnt}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-textSecondary text-xs">No status breakdown available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: User & Role Management Table */}
        {activeTab === 'users' && (
          <div className="gov-card p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-govBorder">
              <div>
                <h3 className="text-sm font-bold text-govNavy">Provisioned Governance Users</h3>
                <p className="text-[11px] text-textSecondary">Assigned system roles and jurisdiction scoping.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-govBg text-textSecondary uppercase font-semibold text-[10px] border-b border-govBorder">
                  <tr>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Application Role</th>
                    <th className="p-3">Jurisdiction</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govBorder">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-govBg/50">
                      <td className="p-3 font-mono font-semibold text-govNavy">{usr.id}</td>
                      <td className="p-3 font-bold text-textPrimary">{usr.fullName}</td>
                      <td className="p-3 text-textSecondary">{usr.email}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-primaryBlue border border-blue-200">
                          {usr.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-textSecondary">Maharashtra Scope</td>
                      <td className="p-3 text-right">
                        <span className="gov-badge bg-emerald-100 text-statusGreen border border-emerald-200">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Agencies & Geography */}
        {activeTab === 'agencies' && (
          <div className="gov-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-govNavy">Empanelled Implementing Agencies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-govBg border border-govBorder rounded">
                <span className="font-bold text-govNavy text-sm block">Public Works Department (PWD)</span>
                <span className="text-textSecondary block mt-1">Agency Code: PWD-MH-CIVIL</span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-2">Active Population: 80 Empanelled Agencies</span>
              </div>
              <div className="p-4 bg-govBg border border-govBorder rounded">
                <span className="font-bold text-govNavy text-sm block">Central Public Works Dept (CPWD)</span>
                <span className="text-textSecondary block mt-1">Agency Code: CPWD-MH-BUILD</span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-2">Active Population: 36 District Authorities</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Append-Only Audit Logs */}
        {activeTab === 'logs' && (
          <div className="gov-card p-5 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-govNavy mb-2">Append-Only System Audit Logs ({auditLogs.length})</h3>
            {loading ? (
              <div className="flex items-center justify-center py-6 text-textSecondary gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primaryBlue" />
                <span>Loading audit log entries from backend...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-6 text-center text-textSecondary border border-govBorder rounded bg-govBg">
                No audit log events recorded yet. Governance decisions and field inspections will automatically append audit entries here.
              </div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log, idx) => (
                  <div key={log.id || idx} className="p-3 bg-govBg border border-govBorder rounded flex justify-between items-start">
                    <div>
                      <span className="font-mono text-govNavy font-bold">EVENT #{log.audit_id?.slice(0,8) || log.id?.slice(0,8) || idx+1} — {log.action || log.event_type || 'GOVERNANCE_ACTION'}</span>
                      <p className="text-textSecondary mt-0.5">{log.performed_by ? `By: ${log.performed_by} (${log.performed_role})` : ''} {log.remarks || log.message || ''}</p>
                    </div>
                    <span className="text-[10px] text-textSecondary font-mono">{log.created_at || log.timestamp || 'Just now'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full border border-govBorder shadow-xl space-y-4">
              <h3 className="text-base font-bold text-govNavy">Provision New Officer Profile</h3>
              <form onSubmit={handleAddUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Full Name *</label>
                  <input required type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. Inspector Ramesh Verma" className="w-full p-2 bg-govBg border border-govBorder rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Official Email *</label>
                  <input required type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="e.g. ramesh.verma@gov.in" className="w-full p-2 bg-govBg border border-govBorder rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Application Role *</label>
                  <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full p-2 bg-govBg border border-govBorder rounded">
                    <option value="MONITORING_OFFICER">Monitoring Officer (Field)</option>
                    <option value="IMPLEMENTING_AGENCY">Implementing Agency</option>
                    <option value="DISTRICT_AUTHORITY">District Authority</option>
                    <option value="MP">MP</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-govBorder">
                  <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 bg-govBg border border-govBorder rounded text-textPrimary font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primaryBlue text-white font-bold rounded hover:bg-govNavy">Provision Profile</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
