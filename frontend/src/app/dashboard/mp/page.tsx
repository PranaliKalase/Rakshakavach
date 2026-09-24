"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MPSelector } from '@/components/ui/MPSelector';
import { fetchProjects, fetchMPSummary, fetchVerificationQueue, fetchRecommendations } from '@/lib/api';
import { Project } from '@/types/project';
import { DEMO_USERS } from '@/lib/constants';
import { 
  TrendingUp, 
  MapPin, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  ShieldCheck,
  Building2,
  PieChart,
  FolderKanban,
  DollarSign,
  PlusCircle,
  FileText,
  FileCheck
} from 'lucide-react';

export default function MPDashboard() {
  const [activeMpName, setActiveMpName] = useState<string>("Demo MP 013");
  const [activeConstituency, setActiveConstituency] = useState<string>("Maharashtra Demo Parliamentary Constituency 13");
  const [summary, setSummary] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user persona from localStorage if available
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

  const loadMPData = async (mpName: string) => {
    try {
      setLoading(true);
      const [sumRes, projRes, recRes, queueRes] = await Promise.allSettled([
        fetchMPSummary(mpName),
        fetchProjects({ role: 'MP', mpName: mpName }),
        fetchRecommendations({ mpName: mpName }),
        fetchVerificationQueue(50)
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value) {
        setSummary(sumRes.value);
        if (sumRes.value.constituency_name) {
          setActiveConstituency(sumRes.value.constituency_name);
        }
      }
      if (projRes.status === 'fulfilled') {
        setProjects(projRes.value);
      }
      if (recRes.status === 'fulfilled') {
        setRecommendations(recRes.value);
      }
      if (queueRes.status === 'fulfilled') {
        const mpProjIds = new Set((projRes.status === 'fulfilled' ? projRes.value : []).map(p => p.id));
        const filteredAlerts = queueRes.value.filter(a => mpProjIds.has(a.project_id || a.id));
        setAlerts(filteredAlerts.length > 0 ? filteredAlerts.slice(0, 5) : (projRes.status === 'fulfilled' ? projRes.value.filter(p => p.priority !== 'NORMAL').slice(0, 5) : []));
      }
    } catch (err) {
      console.error("Failed to load MP overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMPData(activeMpName);
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

  const formattedSanctioned = summary?.my_total_sanctioned_amount >= 10000000
    ? `₹ ${(summary.my_total_sanctioned_amount / 10000000).toFixed(2)} Cr`
    : `₹ ${((summary?.my_total_sanctioned_amount || 0) / 100000).toFixed(2)} Lakh`;

  const formattedExpenditure = summary?.my_expenditure >= 10000000
    ? `₹ ${(summary.my_expenditure / 10000000).toFixed(2)} Cr`
    : `₹ ${((summary?.my_expenditure || 0) / 100000).toFixed(2)} Lakh`;

  const formattedAllocation = summary?.my_total_allocation >= 10000000
    ? `₹ ${(summary.my_total_allocation / 10000000).toFixed(2)} Cr`
    : `₹ ${((summary?.my_total_allocation || 0) / 100000).toFixed(2)} Lakh`;

  // Sector distribution breakdown for this MP
  const sectorCounts: { [key: string]: number } = {};
  projects.forEach(p => {
    const sec = p.sector || 'Unassigned';
    sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
  });
  const sectorList = Object.entries(sectorCounts)
    .map(([sector, count]) => ({
      sector,
      count,
      pct: projects.length > 0 ? ((count / projects.length) * 100).toFixed(1) : "0.0"
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header with MP Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Hon'ble Member of Parliament Governance Dashboard</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeMpName} — Portfolio Overview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live constituency-bound project metrics for {activeConstituency}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <MPSelector currentMpName={activeMpName} onMPChange={handleMPChange} />
            <Link
              href="/dashboard/mp/recommend"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Recommend New Work</span>
            </Link>
          </div>
        </div>

        {/* 10 DYNAMIC MP KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase">My Total Works</p>
            <h3 className="text-xl font-extrabold text-slate-900 my-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : summary?.total_projects || projects.length}
            </h3>
            <span className="text-[10px] font-semibold text-blue-600">Assigned Portfolio</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase">My Recommendations</p>
            <h3 className="text-xl font-extrabold text-blue-600 my-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : recommendations.length}
            </h3>
            <span className="text-[10px] font-semibold text-slate-500">Persisted in DB</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase">My Total Allocation</p>
            <h3 className="text-xl font-extrabold text-slate-900 my-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : formattedAllocation}
            </h3>
            <span className="text-[10px] font-semibold text-slate-500">MPLADS Fund</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase">My Sanctioned Cost</p>
            <h3 className="text-xl font-extrabold text-slate-900 my-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : formattedSanctioned}
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600">Sanctioned Works</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase">My Expenditure</p>
            <h3 className="text-xl font-extrabold text-slate-900 my-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : formattedExpenditure}
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600">Disbursed Funds</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase">My Utilization %</p>
            <h3 className="text-xl font-extrabold text-emerald-600 my-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : `${summary?.my_utilization_pct || 0}%`}
            </h3>
            <span className="text-[10px] font-semibold text-slate-500">Exp / Sanction</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase">My Completed Works</p>
            <h3 className="text-xl font-extrabold text-emerald-600 my-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : summary?.my_completed_projects || 0}
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600">100% Ground Complete</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase">My Ongoing Works</p>
            <h3 className="text-xl font-extrabold text-purple-600 my-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : summary?.my_ongoing_projects || 0}
            </h3>
            <span className="text-[10px] font-semibold text-purple-600">Active Execution</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Priority / Attention</p>
            <h3 className="text-xl font-extrabold text-amber-600 my-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : `${summary?.my_high_priority_projects || 0} / ${summary?.my_attention_projects || 0}`}
            </h3>
            <span className="text-[10px] font-semibold text-amber-600">High / Attention</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Avg Trust Score</p>
            <h3 className="text-xl font-extrabold text-emerald-600 my-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : `${summary?.average_trust_score || 100}`}
            </h3>
            <span className="text-[10px] font-semibold text-slate-500">AI Integrity Rating</span>
          </div>
        </div>

        {/* SECTION: MY RECOMMENDED WORKS (CORE REQUIREMENT) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span>My Recommended Works</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official recommendations submitted by {activeMpName} persisted in database
              </p>
            </div>
            <Link
              href="/dashboard/mp/recommend"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Recommend New Work</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              No work recommendations submitted by {activeMpName} yet. Click "Recommend New Work" to submit.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Recommendation ID</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Estimated Cost</th>
                    <th className="p-3">Submitted Date</th>
                    <th className="p-3">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recommendations.map((rec) => (
                    <tr key={rec.recommendation_id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-blue-600">{rec.recommendation_id}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{rec.project_title}</td>
                      <td className="p-3 text-slate-600">{rec.sector}</td>
                      <td className="p-3 font-bold text-slate-900">₹{(Number(rec.estimated_cost)/100000).toFixed(2)} Lakh</td>
                      <td className="p-3 text-slate-500">{new Date(rec.recommended_at || rec.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          rec.status === 'SANCTIONED' || rec.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          rec.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          rec.status === 'UNDER_REVIEW' || rec.status === 'TECHNICAL_EVALUATION' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MIDDLE SECTION: Sector Breakdown, Alerts & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Portfolio Sector Breakdown</h3>
            <div className="space-y-2.5 my-auto">
              {sectorList.map((sec) => (
                <div key={sec.sector} className="text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span className="truncate max-w-[180px]">{sec.sector}</span>
                    <span>{sec.count} ({sec.pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${sec.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Portfolio Alerts</h3>
              <Link href="/dashboard/mp/alerts" className="text-xs font-bold text-red-600 hover:underline">
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-8">No high priority alerts for this MP.</div>
            ) : (
              <div className="space-y-3 my-auto">
                {alerts.slice(0, 3).map((al, idx) => {
                  const isHigh = al.priority === 'HIGH_PRIORITY' || al.verification_priority === 'HIGH_PRIORITY';
                  const pCode = al.projectCode || al.project_code || `PROJ-${idx+1}`;
                  return (
                    <div key={al.id || idx} className="flex items-start justify-between text-xs border-b border-slate-100 pb-2 last:border-none">
                      <div className="min-w-0 mr-2">
                        <Link href={`/projects/${al.id}`} className="font-mono font-bold text-slate-900 hover:text-blue-600 block text-[11px]">
                          {pCode} ({al.workName || al.work_name || 'Work'})
                        </Link>
                        <span className="text-slate-600 text-[11px] line-clamp-1">{al.explanation || "Flagged for verification"}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        Score: {al.trustScore || al.trust_score || 78.5}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Constituency GIS Map</h3>
              <Link href="/dashboard/mp/map" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                <span>Full Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="relative w-full h-44 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

              <div className="absolute inset-0 p-4">
                {projects.slice(0, 4).map((p, idx) => {
                  const isHigh = p.priority === 'HIGH_PRIORITY';
                  const isAttn = p.priority === 'ATTENTION';
                  const colorClass = isHigh ? 'bg-red-500 ring-red-500/30' : isAttn ? 'bg-amber-500 ring-amber-500/30' : 'bg-emerald-500 ring-emerald-500/30';
                  const positions = ['top-1/3 left-1/4', 'top-1/2 left-2/3', 'top-2/3 left-1/3', 'top-1/4 left-3/4'];
                  return (
                    <Link key={p.id} href={`/projects/${p.id}`} className={`absolute ${positions[idx % positions.length]} transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin`}>
                      <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg ring-4 ${colorClass}`}>
                        <MapPin className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
