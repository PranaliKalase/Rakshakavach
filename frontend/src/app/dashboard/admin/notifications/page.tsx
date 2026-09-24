"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { 
  Bell, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Info,
  Filter,
  Search,
  Plus
} from 'lucide-react';

interface SystemNotification {
  id: string;
  title: string;
  category: 'SYSTEM' | 'AI_ALERT' | 'SECURITY' | 'VERIFICATION';
  targetRole: string;
  message: string;
  timestamp: string;
  status: 'SENT' | 'PENDING';
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  { id: 'NOTIF-01', title: 'Fortnightly Verification Window Open', category: 'VERIFICATION', targetRole: 'IMPLEMENTING_AGENCY', message: 'All implementing agencies are requested to upload updated physical progress photographs for active works.', timestamp: '2026-09-24 12:00', status: 'SENT' },
  { id: 'NOTIF-02', title: 'High-Priority Anomaly Alert', category: 'AI_ALERT', targetRole: 'MONITORING_OFFICER', message: 'Project MPLADS-DEMO-0006 flagged for physical vs financial progress discrepancy.', timestamp: '2026-09-24 10:15', status: 'SENT' },
  { id: 'NOTIF-03', title: 'Scheduled Database Maintenance', category: 'SYSTEM', targetRole: 'ALL_ROLES', message: 'Platform routine maintenance scheduled for Sunday at 02:00 AM IST.', timestamp: '2026-09-23 18:30', status: 'SENT' },
  { id: 'NOTIF-04', title: 'Role Escalation Security Audit', category: 'SECURITY', targetRole: 'ADMIN', message: 'Audit center logged successful credential verification for District Collector persona.', timestamp: '2026-09-23 14:10', status: 'SENT' },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SystemNotification['category']>('SYSTEM');
  const [targetRole, setTargetRole] = useState('ALL_ROLES');
  const [message, setMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const created: SystemNotification = {
      id: `NOTIF-${Math.floor(10 + Math.random() * 90)}`,
      title,
      category,
      targetRole,
      message,
      timestamp: new Date().toLocaleString(),
      status: 'SENT'
    };
    setNotifs([created, ...notifs]);
    setSuccessMsg(`Broadcast notification "${title}" dispatched successfully to ${targetRole}.`);
    setIsBroadcastOpen(false);
    setTitle('');
    setMessage('');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="Notifications" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
              System Notifications & Alert Dispatch Center
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Dispatch broadcast alerts across stakeholder personas (MPs, District Collectors, Monitoring Officers, Implementing Agencies) and manage alert histories.
            </p>
          </div>

          <button 
            onClick={() => setIsBroadcastOpen(true)}
            className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Broadcast Alert</span>
          </button>
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
          <KPICard title="Total Notifications" value={notifs.length.toString()} subtitle="Dispatched Alerts" icon={<Bell className="w-5 h-5 text-primaryBlue" />} />
          <KPICard title="AI Alerts" value={notifs.filter(n => n.category === 'AI_ALERT').length.toString()} subtitle="Anomaly Triggers" icon={<ShieldAlert className="w-5 h-5 text-amber-500" />} />
          <KPICard title="Security Alerts" value={notifs.filter(n => n.category === 'SECURITY').length.toString()} subtitle="Access Audit" icon={<AlertTriangle className="w-5 h-5 text-red-600" />} />
          <KPICard title="Verification Alerts" value={notifs.filter(n => n.category === 'VERIFICATION').length.toString()} subtitle="Workflow Reminders" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
        </div>

        {/* Notifications History List */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <Bell className="w-4 h-4 text-primaryBlue" />
              NOTIFICATION DISPATCH HISTORY ({notifs.length})
            </h3>
          </div>

          <div className="space-y-3">
            {notifs.map(n => (
              <div key={n.id} className="p-4 bg-white border border-govBorder rounded-lg space-y-2 hover:border-primaryBlue/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                      n.category === 'AI_ALERT' ? 'bg-amber-100 text-amber-800' :
                      n.category === 'SECURITY' ? 'bg-red-100 text-red-800' :
                      n.category === 'VERIFICATION' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {n.category.replace('_', ' ')}
                    </span>
                    <strong className="text-sm font-bold text-govNavy">{n.title}</strong>
                  </div>
                  <span className="text-[11px] text-textSecondary font-mono">{n.timestamp}</span>
                </div>
                <p className="text-xs text-textPrimary">{n.message}</p>
                <div className="text-[10px] text-textSecondary font-bold pt-1 border-t border-govBorder/60 flex items-center justify-between">
                  <span>Target Persona: <strong className="text-govNavy">{n.targetRole}</strong></span>
                  <span className="text-emerald-700 font-mono">STATUS: {n.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Broadcast Modal */}
        {isBroadcastOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-lg border border-govBorder max-w-md w-full p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-govBorder pb-3">
                <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
                  <Send className="w-4 h-4 text-primaryBlue" />
                  DISPATCH SYSTEM BROADCAST ALERT
                </h3>
                <button onClick={() => setIsBroadcastOpen(false)} className="text-textSecondary hover:text-govNavy font-bold">✕</button>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Notification Title *</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter alert title..."
                    className="w-full p-2 bg-white border border-govBorder rounded text-xs font-bold text-govNavy"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Category *</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2 bg-white border border-govBorder rounded text-xs font-semibold text-govNavy"
                  >
                    <option value="SYSTEM">SYSTEM (Maintenance / Platform Notice)</option>
                    <option value="VERIFICATION">VERIFICATION (Queue Schedule Reminder)</option>
                    <option value="AI_ALERT">AI_ALERT (Anomaly Escalation Notice)</option>
                    <option value="SECURITY">SECURITY (Security Compliance Audit)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Target Stakeholder Role *</label>
                  <select 
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    className="w-full p-2 bg-white border border-govBorder rounded text-xs font-semibold text-govNavy"
                  >
                    <option value="ALL_ROLES">All Stakeholder Personas</option>
                    <option value="MP">Hon'ble MPs</option>
                    <option value="DISTRICT_AUTHORITY">District Collectors / Authorities</option>
                    <option value="MONITORING_OFFICER">Monitoring Officers</option>
                    <option value="IMPLEMENTING_AGENCY">Implementing Agencies</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Broadcast Message Content *</label>
                  <textarea 
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Enter broadcast message details..."
                    className="w-full p-2.5 bg-white border border-govBorder rounded text-xs text-govNavy"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-govBorder">
                  <button type="button" onClick={() => setIsBroadcastOpen(false)} className="px-3 py-1.5 bg-govBg text-govNavy font-bold rounded">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-primaryBlue text-white font-bold rounded">Dispatch Broadcast</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
