"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AnomalyRadar } from '@/components/risk/AnomalyRadar';
import { TrustAssessment } from '@/components/risk/TrustAssessment';
import { ExplainableAIPanel } from '@/components/risk/ExplainableAIPanel';
import { ProjectMap } from '@/components/map/ProjectMap';
import { fetchProjects, fetchVerificationQueue, fetchRecommendations, updateRecommendationStatus } from '@/lib/api';
import { Project } from '@/types/project';
import { 
  FolderKanban, 
  CheckSquare, 
  AlertTriangle, 
  IndianRupee, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  FileCheck2,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  ShieldAlert,
  FileSpreadsheet,
  Check,
  X,
  HelpCircle,
  Search
} from 'lucide-react';

export default function DistrictAuthorityDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedRec, setSelectedRec] = useState<any | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, queueRes, recRes] = await Promise.allSettled([
        fetchProjects(500),
        fetchVerificationQueue(50),
        fetchRecommendations({ district: 'D007' })
      ]);

      if (projRes.status === 'fulfilled') setProjects(projRes.value);
      if (queueRes.status === 'fulfilled') setQueue(queueRes.value);
      if (recRes.status === 'fulfilled') setRecommendations(recRes.value);
    } catch (err) {
      console.error("Error loading District Authority data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecommendationAction = async (recId: string, newStatus: string, actionLabel: string) => {
    try {
      await updateRecommendationStatus(
        recId,
        {
          status: newStatus,
          performed_by: "District Collector / Nodal Officer",
          performed_role: "DISTRICT_AUTHORITY",
          remarks: `District Authority executed action: ${actionLabel}`
        },
        "DISTRICT_AUTHORITY"
      );
      setActionMessage(`Recommendation ${recId} successfully set to ${newStatus}`);
      setTimeout(() => setActionMessage(null), 5000);
      await loadData();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  // Compute live District Command Center statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'SANCTIONED' || p.status === 'ASSIGNED').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED' || p.status === 'VERIFIED').length;
  const highRiskProjects = projects.filter(p => p.priority === 'HIGH_PRIORITY' || (p.trustScore && p.trustScore < 75)).length;
  const delayedProjects = projects.filter(p => (p.physicalProgress < p.financialProgress - 15) || p.priority === 'ATTENTION').length;
  const pendingApprovals = recommendations.filter(r => r.status === 'RECOMMENDED_BY_MP' || r.status === 'UNDER_REVIEW' || r.status === 'TECHNICAL_EVALUATION').length;

  const totalSanctioned = projects.reduce((s, p) => s + (p.sanctionedCost || 0), 0);
  const totalExp = projects.reduce((s, p) => s + (p.actualExpenditure || 0), 0);
  const fundUtilizationPct = totalSanctioned > 0 ? ((totalExp / totalSanctioned) * 100).toFixed(1) : "0.0";

  const avgTrustScore = totalProjects > 0
    ? (projects.reduce((s, p) => s + (p.trustScore || 100), 0) / totalProjects).toFixed(1)
    : "100.0";

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
              <span>District Authority Command Center</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              District-level governance oversight, MP recommendation approval, verification queue & risk monitoring (District Scope)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Scope: District Collectorate (D007)
            </span>
            <Link
              href="/dashboard/district-authority/verification"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Verification Queue ({queue.length})</span>
            </Link>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* 8 TOP KPI CARDS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">1. Total Works</span>
            <h3 className="text-lg font-extrabold text-slate-900 my-1">{loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : totalProjects}</h3>
            <span className="text-[10px] font-semibold text-slate-500">District Scope</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">2. Active Works</span>
            <h3 className="text-lg font-extrabold text-blue-600 my-1">{loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : activeProjects}</h3>
            <span className="text-[10px] font-semibold text-blue-600">In Execution</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">3. Completed</span>
            <h3 className="text-lg font-extrabold text-emerald-600 my-1">{loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : completedProjects}</h3>
            <span className="text-[10px] font-semibold text-emerald-600">Ground Completion</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">4. High Risk</span>
            <h3 className="text-lg font-extrabold text-red-600 my-1">{loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : highRiskProjects}</h3>
            <span className="text-[10px] font-semibold text-red-600">Flagged Anomaly</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">5. Delayed</span>
            <h3 className="text-lg font-extrabold text-amber-600 my-1">{loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : delayedProjects}</h3>
            <span className="text-[10px] font-semibold text-amber-600">Behind Schedule</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">6. MP Rec. Pending</span>
            <h3 className="text-lg font-extrabold text-purple-600 my-1">{loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : pendingApprovals}</h3>
            <span className="text-[10px] font-semibold text-purple-600">Awaiting Action</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">7. Utilization %</span>
            <h3 className="text-lg font-extrabold text-emerald-600 my-1">{loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : `${fundUtilizationPct}%`}</h3>
            <span className="text-[10px] font-semibold text-slate-500">Exp / Sanction</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">8. Trust Score</span>
            <h3 className="text-lg font-extrabold text-emerald-600 my-1">{loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : avgTrustScore}</h3>
            <span className="text-[10px] font-semibold text-slate-500">District Avg</span>
          </div>
        </div>

        {/* CORE REQUIREMENT: DISTRICT MP RECOMMENDATIONS GOVERNANCE PANEL */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span>MP Work Recommendations Governance Register ({recommendations.length} Items)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Review, approve, reject, or request clarification on submitted MP work recommendations. Approved works convert automatically into Project records.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              No MP work recommendations registered in this district.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Rec ID</th>
                    <th className="p-3">Work Title</th>
                    <th className="p-3">Recommended By MP</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Estimated Cost</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3 text-right">District Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recommendations.map((rec) => (
                    <tr key={rec.recommendation_id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-blue-600">{rec.recommendation_id}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{rec.project_title}</td>
                      <td className="p-3 font-bold text-slate-800">{rec.mp_name}</td>
                      <td className="p-3 text-slate-600">{rec.sector}</td>
                      <td className="p-3 font-bold text-slate-900">₹{(Number(rec.estimated_cost)/100000).toFixed(2)} Lakh</td>
                      <td className="p-3 text-slate-500">{rec.village ? `${rec.village}, ` : ''}{rec.district}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.status === 'SANCTIONED' || rec.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          rec.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          rec.status === 'UNDER_REVIEW' || rec.status === 'TECHNICAL_EVALUATION' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleRecommendationAction(rec.recommendation_id, 'UNDER_REVIEW', 'Under Review')}
                          className="px-2 py-1 bg-slate-100 text-slate-700 font-bold rounded text-[10px] hover:bg-slate-200"
                          title="Review"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleRecommendationAction(rec.recommendation_id, 'TECHNICAL_EVALUATION', 'Technical Evaluation Clarification')}
                          className="px-2 py-1 bg-purple-50 text-purple-700 font-bold rounded text-[10px] hover:bg-purple-100"
                          title="Request Clarification"
                        >
                          Clarify
                        </button>
                        <button
                          onClick={() => handleRecommendationAction(rec.recommendation_id, 'SANCTIONED', 'Approved & Sanctioned')}
                          className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[10px] hover:bg-emerald-700"
                          title="Approve Recommendation"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRecommendationAction(rec.recommendation_id, 'REJECTED', 'Rejected')}
                          className="px-2 py-1 bg-red-600 text-white font-bold rounded text-[10px] hover:bg-red-700"
                          title="Reject Recommendation"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MIDDLE SECTION: GIS Map & Action Required Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>District GIS Project Map Preview</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Geospatial positioning of active & high-risk works</p>
                </div>
                <Link href="/dashboard/district-authority/map" className="text-xs font-bold text-blue-600 hover:underline">
                  Full Interactive Map →
                </Link>
              </div>
              <ProjectMap />
            </div>

            <ExplainableAIPanel />
          </div>

          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Action Required Panel</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                  {highRiskProjects + delayedProjects} Items
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.filter(p => p.priority === 'HIGH_PRIORITY' || p.priority === 'ATTENTION').slice(0, 4).map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-slate-900">{p.projectCode}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.priority === 'HIGH_PRIORITY' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {p.priority}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{p.workName}</p>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{p.sector} • ₹{((p.sanctionedCost || 0)/100000).toFixed(1)}L</span>
                        <Link href={`/projects/${p.id}`} className="text-blue-600 font-bold hover:underline">
                          Review →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <TrustAssessment trustScore={Number(avgTrustScore)} verificationAssessment="District Command Center Oversight" />
            <AnomalyRadar />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
