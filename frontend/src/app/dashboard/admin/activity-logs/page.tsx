"use client";

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { 
  Clock, 
  Activity, 
  Search, 
  Download, 
  CheckCircle2, 
  User, 
  Layers
} from 'lucide-react';

interface ActivityLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  category: 'AUTHENTICATION' | 'WORKFLOW' | 'DATA_IMPORT' | 'SECURITY';
  description: string;
  ipAddress: string;
}

const INITIAL_ACTIVITIES: ActivityLogItem[] = [
  { id: 'ACT-101', timestamp: '2026-09-24 14:05:12', actor: 'usr-admin-01', role: 'ADMIN', category: 'WORKFLOW', description: 'Updated system CORS origins and allowed dev ports.', ipAddress: '127.0.0.1' },
  { id: 'ACT-102', timestamp: '2026-09-24 13:30:45', actor: 'usr-da-official', role: 'DISTRICT_AUTHORITY', category: 'WORKFLOW', description: 'Approved sanction order for project MPLADS-DEMO-0004.', ipAddress: '10.0.4.12' },
  { id: 'ACT-103', timestamp: '2026-09-24 12:15:00', actor: 'usr-mo-official', role: 'MONITORING_OFFICER', category: 'WORKFLOW', description: 'Submitted field inspection report INSP-0006-01 for MPLADS-DEMO-0006.', ipAddress: '172.16.0.45' },
  { id: 'ACT-104', timestamp: '2026-09-24 11:20:10', actor: 'usr-ia-pwd', role: 'IMPLEMENTING_AGENCY', category: 'DATA_IMPORT', description: 'Uploaded physical progress update & geotagged site photo for MPLADS-DEMO-0007.', ipAddress: '192.168.1.104' },
  { id: 'ACT-105', timestamp: '2026-09-24 10:00:00', actor: 'usr-mp-013', role: 'MP', category: 'AUTHENTICATION', description: 'Hon\'ble MP logged into Rakshkavach dashboard.', ipAddress: '10.0.1.5' },
  { id: 'ACT-106', timestamp: '2026-09-23 16:45:22', actor: 'usr-system-daemon', role: 'SYSTEM', category: 'DATA_IMPORT', description: 'Pre-warmed canonical database dataset across 500 records.', ipAddress: 'localhost' },
];

export default function ActivityLogsPage() {
  const [activities, setActivities] = useState<ActivityLogItem[]>(INITIAL_ACTIVITIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const searchMatch = searchTerm === '' || 
        a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase());

      const categoryMatch = categoryFilter === 'ALL' || a.category === categoryFilter;

      return searchMatch && categoryMatch;
    });
  }, [activities, searchTerm, categoryFilter]);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Log_ID,Timestamp,Actor,Role,Category,Description,IP_Address\n" +
      filteredActivities.map(a => `${a.id},${a.timestamp},${a.actor},${a.role},${a.category},"${a.description}",${a.ipAddress}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `system_activity_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMsg("Activity log CSV exported successfully.");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="Activity Logs" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
              System & User Activity Timeline Logs
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Comprehensive real-time activity stream recording stakeholder authentications, workflow approvals, data uploads, and system events.
            </p>
          </div>

          <button 
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Activity Log (CSV)</span>
          </button>
        </div>

        {exportMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportMsg}</span>
            </div>
            <button onClick={() => setExportMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Total Logged Activities" value={activities.length.toString()} subtitle="Activity Stream" icon={<Clock className="w-5 h-5 text-blue-500" />} />
          <KPICard title="Workflow Actions" value={activities.filter(a => a.category === 'WORKFLOW').length.toString()} subtitle="Governance Triggers" icon={<Activity className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Data Events" value={activities.filter(a => a.category === 'DATA_IMPORT').length.toString()} subtitle="Uploads & Pre-warms" icon={<Layers className="w-5 h-5 text-indigo-600" />} />
          <KPICard title="Log Integrity" value="100% Verified" subtitle="Audited Timeline" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
        </div>

        {/* Activity Timeline List */}
        <div className="gov-card p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-govBorder pb-3">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              SYSTEM ACTIVITY TIMELINE STREAM ({filteredActivities.length})
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-textSecondary absolute left-2.5 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search description or actor..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-govBg border border-govBorder rounded text-xs font-medium text-govNavy w-56 focus:outline-none focus:border-primaryBlue"
                />
              </div>

              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-govBg border border-govBorder rounded text-xs font-semibold text-govNavy focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="WORKFLOW">Workflow Actions</option>
                <option value="AUTHENTICATION">Authentication</option>
                <option value="DATA_IMPORT">Data Imports</option>
                <option value="SECURITY">Security</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredActivities.map((act) => (
              <div key={act.id} className="p-4 bg-white border border-govBorder rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-primaryBlue/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-primaryBlue">{act.id}</span>
                    <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-2 py-0.5 rounded">
                      {act.category}
                    </span>
                    <strong className="text-xs font-bold text-govNavy">{act.actor} ({act.role})</strong>
                  </div>
                  <p className="text-xs text-textPrimary">{act.description}</p>
                </div>

                <div className="text-right text-xs shrink-0 space-y-0.5">
                  <span className="text-textSecondary font-mono block text-[11px]">{act.timestamp}</span>
                  <span className="text-[10px] text-gray-500 font-mono">IP: {act.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
