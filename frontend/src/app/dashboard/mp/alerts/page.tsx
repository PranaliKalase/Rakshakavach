"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MPSelector } from '@/components/ui/MPSelector';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEMO_USERS } from '@/lib/constants';
import { Bell, AlertTriangle, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

export default function MPAlertsPage() {
  const [activeMpName, setActiveMpName] = useState<string>("Demo MP 013");
  const [activeConstituency, setActiveConstituency] = useState<string>("Maharashtra Demo Parliamentary Constituency 13");
  const [alerts, setAlerts] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rakshakavach_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.mpName) {
          setActiveMpName(u.mpName);
          if (u.constituencyName) setActiveConstituency(u.constituencyName);
        }
      }
    } catch (e) {}
  }, []);

  const loadAlerts = async (mpName: string) => {
    try {
      setLoading(true);
      const data = await fetchProjects({ role: 'MP', mpName: mpName });
      // Filter ONLY MP-owned projects with HIGH_PRIORITY or ATTENTION
      const flagProjs = data.filter(p => p.priority === 'HIGH_PRIORITY' || p.priority === 'ATTENTION' || p.trustScore < 85.0);
      setAlerts(flagProjs);
    } catch (err) {
      console.error("Failed to load MP risk alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts(activeMpName);
  }, [activeMpName]);

  const handleMPChange = (newMpName: string, newConstName: string) => {
    setActiveMpName(newMpName);
    setActiveConstituency(newConstName);
    try {
      const updatedUser = {
        ...DEMO_USERS.MP,
        fullName: newMpName,
        mpName: newMpName,
        constituencyName: newConstName
      };
      localStorage.setItem('rakshakavach_user', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const highPriorityCount = alerts.filter(q => q.priority === 'HIGH_PRIORITY').length;
  const attentionCount = alerts.filter(q => q.priority === 'ATTENTION').length;
  const totalAlerts = alerts.length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              <span>Verification Risk Alerts — {activeMpName}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live multi-factor AI risk signals flagged in {activeConstituency}
            </p>
          </div>

          <MPSelector currentMpName={activeMpName} onMPChange={handleMPChange} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">High Priority Alerts</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-red-500" /> : highPriorityCount}
              </h3>
            </div>
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Attention Required</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> : attentionCount}
              </h3>
            </div>
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Portfolio Alerts</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : totalAlerts}
              </h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Portfolio Anomaly Alerts ({totalAlerts})</h3>
            <span className="text-xs text-slate-500 font-semibold">Live Dataset Scoped to {activeMpName}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-xs font-semibold text-slate-600">Loading risk findings for {activeMpName}...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No active high priority or attention risk alerts found for {activeMpName}. All projects operating within normal trust thresholds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Project Code & Name</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Trust Score</th>
                    <th className="p-3.5">AI Explanation</th>
                    <th className="p-3.5">Last Updated</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {alerts.map((item) => {
                    const isHigh = item.priority === 'HIGH_PRIORITY';
                    const headline = item.explanation || "Multi-factor statistical progress gap or anomaly signal detected.";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-blue-600 block">{item.projectCode}</span>
                          <span className="font-semibold text-slate-900 truncate max-w-xs block">{item.workName}</span>
                        </td>
                        <td className="p-3.5">
                          <StatusBadge priority={item.priority} />
                        </td>
                        <td className="p-3.5 font-bold">
                          <span className={`px-2 py-0.5 rounded ${
                            item.trustScore < 70 ? 'bg-red-50 text-red-700 font-extrabold' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {item.trustScore}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 max-w-sm">
                          {headline}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <Link href={`/projects/${item.id}`} className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800">
                            <span>Request Audit</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
