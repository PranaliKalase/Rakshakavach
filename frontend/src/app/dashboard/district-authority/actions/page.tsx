"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { fetchProjects, recordAuthorityDecision } from '@/lib/api';
import { Project } from '@/types/project';
import { PlusCircle, CheckCircle2, AlertTriangle, Eye, Loader2, ArrowRight } from 'lucide-react';

export default function DistrictActionsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'RECOMMENDED' | 'SANCTION_PENDING' | 'AGENCY_PENDING' | 'VERIFICATION_PENDING'>('RECOMMENDED');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchProjects(500);
        if (isMounted) setProjects(data);
      } catch (err) {
        console.error("Failed to load actions data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const recommendations = projects.filter(p => p.status === 'RECOMMENDED' || p.status === 'UNDER_REVIEW');
  const sanctionPending = projects.filter(p => p.status === 'SANCTIONED' || p.sanctionedCost === 0);
  const agencyPending = projects.filter(p => !p.agencyId || p.status === 'SANCTIONED');
  const verificationPending = projects.filter(p => p.priority === 'HIGH_PRIORITY' || p.priority === 'ATTENTION');

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1.5">
            <Link href="/dashboard/district-authority" className="hover:text-blue-600">District Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Governance Actions</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <span>District Governance Actions & Approvals Control Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pending MP recommendations, sanction approvals, agency allocations, and field verification decisions
          </p>
        </div>

        {/* Action Category Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
          {[
            { id: 'RECOMMENDED', label: `MP Recommendations (${recommendations.length})` },
            { id: 'SANCTION_PENDING', label: `Sanctions Pending (${sanctionPending.length})` },
            { id: 'AGENCY_PENDING', label: `Agency Assignments (${agencyPending.length})` },
            { id: 'VERIFICATION_PENDING', label: `Verification Reviews (${verificationPending.length})` },
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 bg-white font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Items List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            {activeTab === 'RECOMMENDED' && 'MP Recommended Works Awaiting Review & Sanction'}
            {activeTab === 'SANCTION_PENDING' && 'Works Pending Budget Sanction & Fund Allocation'}
            {activeTab === 'AGENCY_PENDING' && 'Sanctioned Works Awaiting Implementing Agency Assignment'}
            {activeTab === 'VERIFICATION_PENDING' && 'Projects Requiring District Verification Decision'}
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Project Code</th>
                    <th className="p-3">Work Name</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Estimated Cost</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(activeTab === 'RECOMMENDED' ? recommendations :
                    activeTab === 'SANCTION_PENDING' ? sanctionPending :
                    activeTab === 'AGENCY_PENDING' ? agencyPending : verificationPending
                  ).slice(0, 10).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-blue-600">{p.projectCode}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{p.workName}</td>
                      <td className="p-3 text-slate-600">{p.sector}</td>
                      <td className="p-3 font-bold text-slate-900">₹{((p.sanctionedCost || p.estimatedCost || 0)/100000).toFixed(2)}L</td>
                      <td className="p-3 font-bold">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                          {p.priority || 'NORMAL'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <Link 
                          href={`/projects/${p.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Process Action</span>
                        </Link>
                      </td>
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
