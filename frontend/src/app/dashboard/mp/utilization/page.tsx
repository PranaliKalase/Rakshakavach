"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MPSelector } from '@/components/ui/MPSelector';
import { fetchProjects, fetchMPSummary } from '@/lib/api';
import { Project } from '@/types/project';
import { DEMO_USERS } from '@/lib/constants';
import {
  PieChart,
  Loader2,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Activity,
  BarChart3,
  Target,
  DollarSign,
  Layers,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';

export default function MPUtilizationPage() {
  const [mounted, setMounted] = useState(false);
  const [activeMpName, setActiveMpName] = useState<string>("Demo MP 013");
  const [activeConstituency, setActiveConstituency] = useState<string>("Maharashtra Demo Parliamentary Constituency 13");
  const [summary, setSummary] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Hover state for interactive scatter plot & charts
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [activeSectorIndex, setActiveSectorIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
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

  const loadData = async (mpName: string) => {
    try {
      setLoading(true);
      const [sumRes, projRes] = await Promise.allSettled([
        fetchMPSummary(mpName),
        fetchProjects({ role: 'MP', mpName: mpName })
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value) {
        setSummary(sumRes.value);
        if (sumRes.value.constituency_name) setActiveConstituency(sumRes.value.constituency_name);
      }
      if (projRes.status === 'fulfilled') {
        setProjects(projRes.value);
      }
    } catch (err) {
      console.error("Failed to load MP utilization data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeMpName);
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

  // 1. KPI Calculations (Live dataset derived)
  const totalAllocation = useMemo(() => {
    return summary?.my_total_allocation || projects.reduce((s, p) => s + (p.sanctionedCost || p.estimatedCost || 0), 0);
  }, [summary, projects]);

  const totalSanctioned = useMemo(() => {
    return summary?.my_total_sanctioned_amount || projects.reduce((s, p) => s + (p.sanctionedCost || p.estimatedCost || 0), 0);
  }, [summary, projects]);

  const totalExpenditure = useMemo(() => {
    return summary?.my_expenditure || projects.reduce((s, p) => s + (p.actualExpenditure || 0), 0);
  }, [summary, projects]);

  const remainingFunds = useMemo(() => {
    return summary?.remaining_funds ?? Math.max(0, totalAllocation - totalExpenditure);
  }, [summary, totalAllocation, totalExpenditure]);

  const utilizationPct = useMemo(() => {
    if (summary?.my_utilization_pct !== undefined) return summary.my_utilization_pct;
    return totalSanctioned > 0 ? Math.round((totalExpenditure / totalSanctioned) * 100) : 0;
  }, [summary, totalExpenditure, totalSanctioned]);

  // 2. Fund Utilization Trend (Multi-Line Timeline Buckets)
  const trendData = useMemo(() => {
    if (!projects.length) return [];
    // Group projects by created year/period
    const periodsMap: Record<string, { year: string; sanctioned: number; expenditure: number; count: number }> = {};
    
    projects.forEach(p => {
      let yearStr = '2024';
      if (p.createdAt) {
        const d = new Date(p.createdAt);
        if (!isNaN(d.getFullYear())) yearStr = d.getFullYear().toString();
      }
      if (!periodsMap[yearStr]) {
        periodsMap[yearStr] = { year: yearStr, sanctioned: 0, expenditure: 0, count: 0 };
      }
      periodsMap[yearStr].sanctioned += (p.sanctionedCost || p.estimatedCost || 0);
      periodsMap[yearStr].expenditure += (p.actualExpenditure || 0);
      periodsMap[yearStr].count += 1;
    });

    const sortedKeys = Object.keys(periodsMap).sort();
    if (sortedKeys.length < 3) {
      // Create representative chronological buckets if fewer than 3 years exist
      return [
        { label: 'Q1', sanctioned: totalSanctioned * 0.2, expenditure: totalExpenditure * 0.15, util: Math.round((totalExpenditure * 0.15 / (totalSanctioned * 0.2 || 1)) * 100) },
        { label: 'Q2', sanctioned: totalSanctioned * 0.45, expenditure: totalExpenditure * 0.38, util: Math.round((totalExpenditure * 0.38 / (totalSanctioned * 0.45 || 1)) * 100) },
        { label: 'Q3', sanctioned: totalSanctioned * 0.75, expenditure: totalExpenditure * 0.65, util: Math.round((totalExpenditure * 0.65 / (totalSanctioned * 0.75 || 1)) * 100) },
        { label: 'Q4', sanctioned: totalSanctioned, expenditure: totalExpenditure, util: utilizationPct }
      ];
    }

    let cumSanc = 0;
    let cumExp = 0;
    return sortedKeys.map(k => {
      cumSanc += periodsMap[k].sanctioned;
      cumExp += periodsMap[k].expenditure;
      const uPct = cumSanc > 0 ? Math.round((cumExp / cumSanc) * 100) : 0;
      return {
        label: `FY ${k}`,
        sanctioned: cumSanc,
        expenditure: cumExp,
        util: uPct
      };
    });
  }, [projects, totalSanctioned, totalExpenditure, utilizationPct]);

  // 3. Sector-Wise Allocation & Donut Data
  const sectorData = useMemo(() => {
    const sMap: Record<string, { sector: string; sanctioned: number; expenditure: number; count: number }> = {};
    projects.forEach(p => {
      const sec = p.sector || 'Infrastructure';
      if (!sMap[sec]) {
        sMap[sec] = { sector: sec, sanctioned: 0, expenditure: 0, count: 0 };
      }
      sMap[sec].sanctioned += (p.sanctionedCost || p.estimatedCost || 0);
      sMap[sec].expenditure += (p.actualExpenditure || 0);
      sMap[sec].count += 1;
    });

    const items = Object.values(sMap).sort((a, b) => b.sanctioned - a.sanctioned);
    const sumSanc = items.reduce((s, i) => s + i.sanctioned, 0) || 1;

    const colors = ['#1D5D91', '#0B253F', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6'];

    return items.map((it, idx) => ({
      ...it,
      sharePct: Math.round((it.sanctioned / sumSanc) * 100),
      utilPct: it.sanctioned > 0 ? Math.round((it.expenditure / it.sanctioned) * 100) : 0,
      color: colors[idx % colors.length]
    }));
  }, [projects]);

  // 4. Project Risk & Status Distribution
  const riskDistribution = useMemo(() => {
    const counts = { NORMAL: 0, ATTENTION: 0, HIGH_PRIORITY: 0 };
    const costs = { NORMAL: 0, ATTENTION: 0, HIGH_PRIORITY: 0 };

    projects.forEach(p => {
      const prio = (p.priority || 'NORMAL') as keyof typeof counts;
      if (counts[prio] !== undefined) {
        counts[prio] += 1;
        costs[prio] += (p.sanctionedCost || p.estimatedCost || 0);
      } else {
        counts.NORMAL += 1;
        costs.NORMAL += (p.sanctionedCost || p.estimatedCost || 0);
      }
    });

    const total = projects.length || 1;
    return [
      { key: 'NORMAL', label: 'Normal / On Track', count: counts.NORMAL, cost: costs.NORMAL, pct: Math.round((counts.NORMAL / total) * 100), color: 'bg-emerald-500', badgeClass: 'bg-emerald-100 text-emerald-800' },
      { key: 'ATTENTION', label: 'Attention Required', count: counts.ATTENTION, cost: costs.ATTENTION, pct: Math.round((counts.ATTENTION / total) * 100), color: 'bg-amber-500', badgeClass: 'bg-amber-100 text-amber-800' },
      { key: 'HIGH_PRIORITY', label: 'High Priority / Risk', count: counts.HIGH_PRIORITY, cost: costs.HIGH_PRIORITY, pct: Math.round((counts.HIGH_PRIORITY / total) * 100), color: 'bg-red-500', badgeClass: 'bg-red-100 text-red-800' }
    ];
  }, [projects]);

  // 5. Trust Score Analytics
  const trustStats = useMemo(() => {
    if (!projects.length) {
      return { avgTrust: 0, bestProject: null, lowestProject: null, highCount: 0, medCount: 0, lowCount: 0 };
    }

    let sum = 0;
    let best = projects[0];
    let lowest = projects[0];
    let high = 0, med = 0, low = 0;

    projects.forEach(p => {
      const score = p.trustScore ?? 85;
      sum += score;
      if (score > (best.trustScore ?? 0)) best = p;
      if (score < (lowest.trustScore ?? 100)) lowest = p;

      if (score >= 80) high++;
      else if (score >= 60) med++;
      else low++;
    });

    return {
      avgTrust: Math.round(sum / projects.length),
      bestProject: best,
      lowestProject: lowest,
      highCount: high,
      medCount: med,
      lowCount: low
    };
  }, [projects]);

  // 6. Financial vs Physical Progress Scatter & Anomaly Detection
  const scatterPoints = useMemo(() => {
    return projects.map(p => {
      const phys = Math.min(100, Math.max(0, p.physicalProgress || 0));
      const sanc = p.sanctionedCost || p.estimatedCost || 1;
      const exp = p.actualExpenditure || 0;
      const fin = Math.min(100, Math.max(0, p.financialProgress || Math.round((exp / sanc) * 100)));
      const isAnomaly = fin > phys + 15; // Financial progress leads physical progress significantly

      return {
        project: p,
        x: phys,
        y: fin,
        isAnomaly
      };
    });
  }, [projects]);

  const anomalyCount = useMemo(() => scatterPoints.filter(s => s.isAnomaly).length, [scatterPoints]);

  // 7. Verification Outcome Analytics
  const verificationOutcomes = useMemo(() => {
    let verified = 0;
    let clarification = 0;
    let escalated = 0;
    let resolved = 0;

    projects.forEach(p => {
      const st = p.status || 'IN_PROGRESS';
      if (st === 'VERIFIED' || st === 'COMPLETED') verified++;
      else if (st === 'CLARIFICATION_REQUIRED' || st === 'UNDER_REVIEW') clarification++;
      else if (p.priority === 'HIGH_PRIORITY' || st === 'VERIFICATION_PENDING') escalated++;
      else resolved++;
    });

    const total = projects.length || 1;
    return [
      { label: 'Verified & Compliant', count: verified, pct: Math.round((verified / total) * 100), color: 'bg-emerald-500' },
      { label: 'Clarification Received', count: clarification, pct: Math.round((clarification / total) * 100), color: 'bg-amber-500' },
      { label: 'Escalated / High Priority', count: escalated, pct: Math.round((escalated / total) * 100), color: 'bg-red-500' },
      { label: 'Resolved / Closed', count: resolved, pct: Math.round((resolved / total) * 100), color: 'bg-blue-600' }
    ];
  }, [projects]);

  // 8. Top 10 Costliest Projects
  const topCostlyProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => (b.sanctionedCost || b.estimatedCost || 0) - (a.sanctionedCost || a.estimatedCost || 0))
      .slice(0, 10);
  }, [projects]);

  // 9. District / Jurisdiction Comparison
  const jurisdictionComparison = useMemo(() => {
    const jMap: Record<string, { name: string; sanctioned: number; expenditure: number; count: number; trustSum: number }> = {};
    
    projects.forEach(p => {
      const jName = p.districtName || p.constituencyName || 'Constituency Scope';
      if (!jMap[jName]) {
        jMap[jName] = { name: jName, sanctioned: 0, expenditure: 0, count: 0, trustSum: 0 };
      }
      jMap[jName].sanctioned += (p.sanctionedCost || p.estimatedCost || 0);
      jMap[jName].expenditure += (p.actualExpenditure || 0);
      jMap[jName].count += 1;
      jMap[jName].trustSum += (p.trustScore ?? 85);
    });

    return Object.values(jMap).map(j => ({
      name: j.name,
      count: j.count,
      sanctioned: j.sanctioned,
      expenditure: j.expenditure,
      utilizationPct: j.sanctioned > 0 ? Math.round((j.expenditure / j.sanctioned) * 100) : 0,
      avgTrust: Math.round(j.trustSum / (j.count || 1))
    })).sort((a, b) => b.sanctioned - a.sanctioned);
  }, [projects]);

  if (!mounted) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primaryBlue" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto text-textPrimary">
        {/* Top Header Banner */}
        <div className="bg-white p-5 rounded-xl border border-govBorder shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primaryBlue/10 text-primaryBlue rounded-lg">
                <PieChart className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
                MP Fund Utilization & Governance Analytics
              </h1>
            </div>
            <p className="text-xs text-textSecondary mt-1">
              AI-Powered Financial Portfolio & Physical Verification Intelligence — <strong>{activeMpName}</strong> ({activeConstituency})
            </p>
          </div>

          <MPSelector currentMpName={activeMpName} onMPChange={handleMPChange} />
        </div>

        {/* 1. Executive KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Allocation */}
          <div className="bg-white p-5 rounded-xl border border-govBorder shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Allocation</span>
              <DollarSign className="w-4 h-4 text-primaryBlue" />
            </div>
            <h3 className="text-2xl font-extrabold text-govNavy">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" /> : `₹ ${(totalAllocation / 10000000).toFixed(2)} Cr`}
            </h3>
            <p className="text-[11px] text-textSecondary">MPLADS Sanctioned Cap</p>
          </div>

          {/* Card 2: Total Sanctioned */}
          <div className="bg-white p-5 rounded-xl border border-govBorder shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Sanctioned</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-govNavy">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" /> : `₹ ${(totalSanctioned / 10000000).toFixed(2)} Cr`}
            </h3>
            <p className="text-[11px] text-textSecondary">{projects.length} Works Sanctioned</p>
          </div>

          {/* Card 3: Total Expenditure */}
          <div className="bg-white p-5 rounded-xl border border-govBorder shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Expenditure</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-emerald-700">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" /> : `₹ ${(totalExpenditure / 10000000).toFixed(2)} Cr`}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Actual Disbursed Payments</p>
          </div>

          {/* Card 4: Remaining Funds */}
          <div className="bg-white p-5 rounded-xl border border-govBorder shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Remaining Balance</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-govNavy">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" /> : `₹ ${(remainingFunds / 10000000).toFixed(2)} Cr`}
            </h3>
            <p className="text-[11px] text-textSecondary">Available Unspent Fund</p>
          </div>

          {/* Card 5: Utilization % */}
          <div className="bg-white p-5 rounded-xl border border-govBorder shadow-xs space-y-2 border-l-4 border-l-primaryBlue">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Utilization Rate</span>
              <Target className="w-4 h-4 text-primaryBlue" />
            </div>
            <h3 className="text-2xl font-extrabold text-primaryBlue">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" /> : `${utilizationPct}%`}
            </h3>
            <p className="text-[11px] text-textSecondary">Disbursement Ratio</p>
          </div>
        </div>

        {/* Grid Container for Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 2. Fund Utilization Trend (Multi-Line SVG Chart) */}
          <div className="gov-card p-5 space-y-4 bg-white rounded-xl border border-govBorder shadow-xs">
            <div className="flex items-center justify-between border-b border-govBorder pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primaryBlue" />
                  Fund Utilization & Expenditure Trend
                </h3>
                <p className="text-[11px] text-textSecondary">Cumulative Sanctioned vs Actual Disbursed Funds Over Time</p>
              </div>
              <span className="text-xs font-bold text-primaryBlue bg-blue-50 px-2 py-1 rounded border border-blue-200">
                {utilizationPct}% Overall
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primaryBlue" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-48 relative w-full pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150">
                    <defs>
                      <linearGradient id="sanctionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1D5D91" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#1D5D91" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="30" y1="20" x2="390" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="30" y1="60" x2="390" y2="60" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="30" y1="100" x2="390" y2="100" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="30" y1="140" x2="390" y2="140" stroke="#E2E8F0" />

                    {/* Multi-Line Area Paths */}
                    {trendData.length > 0 && (() => {
                      const maxVal = Math.max(...trendData.map(d => d.sanctioned)) || 1;
                      const pointsSanctioned = trendData.map((d, i) => {
                        const x = 40 + (i * (340 / Math.max(1, trendData.length - 1)));
                        const y = 140 - ((d.sanctioned / maxVal) * 110);
                        return `${x},${y}`;
                      }).join(' ');

                      const pointsExp = trendData.map((d, i) => {
                        const x = 40 + (i * (340 / Math.max(1, trendData.length - 1)));
                        const y = 140 - ((d.expenditure / maxVal) * 110);
                        return `${x},${y}`;
                      }).join(' ');

                      const areaSanctioned = `40,140 ${pointsSanctioned} ${40 + ((trendData.length - 1) * (340 / Math.max(1, trendData.length - 1)))},140`;
                      const areaExp = `40,140 ${pointsExp} ${40 + ((trendData.length - 1) * (340 / Math.max(1, trendData.length - 1)))},140`;

                      return (
                        <>
                          <polygon points={areaSanctioned} fill="url(#sanctionGrad)" />
                          <polygon points={areaExp} fill="url(#expGrad)" />
                          <polyline points={pointsSanctioned} fill="none" stroke="#1D5D91" strokeWidth="2.5" strokeLinecap="round" />
                          <polyline points={pointsExp} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

                          {/* Data Nodes */}
                          {trendData.map((d, i) => {
                            const x = 40 + (i * (340 / Math.max(1, trendData.length - 1)));
                            const ySan = 140 - ((d.sanctioned / maxVal) * 110);
                            const yExp = 140 - ((d.expenditure / maxVal) * 110);
                            return (
                              <g key={i} className="group cursor-pointer">
                                <circle cx={x} cy={ySan} r="4" fill="#1D5D91" stroke="#FFF" strokeWidth="2" />
                                <circle cx={x} cy={yExp} r="4" fill="#10B981" stroke="#FFF" strokeWidth="2" />
                                <text x={x} y="152" fontSize="9" textAnchor="middle" fill="#64748B" fontWeight="600">{d.label}</text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                <div className="flex items-center justify-center gap-6 text-xs pt-2 border-t border-govBorder">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primaryBlue inline-block"></span>
                    <span className="font-semibold text-govNavy">Cumulative Sanctioned (₹ Cr)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="font-semibold text-govNavy">Actual Expenditure (₹ Cr)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Sector-Wise Allocation (Interactive Donut & Legend) */}
          <div className="gov-card p-5 space-y-4 bg-white rounded-xl border border-govBorder shadow-xs">
            <div className="flex items-center justify-between border-b border-govBorder pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primaryBlue" />
                  Sector-Wise Allocation & Expenditure
                </h3>
                <p className="text-[11px] text-textSecondary">Live sector distribution across {sectorData.length} key developmental sectors</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primaryBlue" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Donut Graphic */}
                <div className="flex flex-col items-center justify-center relative py-2">
                  <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      let strokeAccumulator = 0;
                      return sectorData.map((sec, idx) => {
                        const strokeDash = `${sec.sharePct} ${100 - sec.sharePct}`;
                        const strokeOffset = -strokeAccumulator;
                        strokeAccumulator += sec.sharePct;
                        return (
                          <circle
                            key={sec.sector}
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke={sec.color}
                            strokeWidth="16"
                            strokeDasharray={strokeDash}
                            strokeDashoffset={strokeOffset}
                            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                            onMouseEnter={() => setActiveSectorIndex(idx)}
                            onMouseLeave={() => setActiveSectorIndex(null)}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-extrabold text-govNavy">
                      {activeSectorIndex !== null ? `${sectorData[activeSectorIndex].sharePct}%` : `${sectorData.length}`}
                    </span>
                    <span className="text-[10px] text-textSecondary uppercase font-bold">
                      {activeSectorIndex !== null ? sectorData[activeSectorIndex].sector : 'Sectors'}
                    </span>
                  </div>
                </div>

                {/* Sector Legend Breakdown */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {sectorData.map((sec, idx) => (
                    <div
                      key={sec.sector}
                      onMouseEnter={() => setActiveSectorIndex(idx)}
                      onMouseLeave={() => setActiveSectorIndex(null)}
                      className={`p-2 rounded border transition-colors flex items-center justify-between text-xs cursor-pointer ${
                        activeSectorIndex === idx ? 'bg-blue-50 border-blue-300' : 'bg-govBg/50 border-govBorder'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sec.color }}></span>
                        <span className="font-bold text-govNavy truncate">{sec.sector}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-govNavy block">₹{(sec.sanctioned / 100000).toFixed(1)} L</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">{sec.utilPct}% Util.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Project Status & Priority Risk Distribution */}
          <div className="gov-card p-5 space-y-4 bg-white rounded-xl border border-govBorder shadow-xs">
            <div className="flex items-center justify-between border-b border-govBorder pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primaryBlue" />
                  Project Status & Risk Priority Distribution
                </h3>
                <p className="text-[11px] text-textSecondary">Verification Risk Classification across active portfolio</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primaryBlue" />
              </div>
            ) : (
              <div className="space-y-4">
                {riskDistribution.map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-govNavy flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${item.badgeClass}`}>
                          {item.label}
                        </span>
                        <span className="text-textSecondary font-normal">({item.count} Works)</span>
                      </span>
                      <span className="font-mono font-bold text-govNavy">
                        ₹{(item.cost / 100000).toFixed(1)} L ({item.pct}%)
                      </span>
                    </div>

                    <div className="w-full bg-govBg rounded-full h-3 overflow-hidden border border-govBorder">
                      <div
                        className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.max(4, item.pct)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Trust Score Analytics Panel */}
          <div className="gov-card p-5 space-y-4 bg-white rounded-xl border border-govBorder shadow-xs">
            <div className="flex items-center justify-between border-b border-govBorder pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primaryBlue" />
                  AI Trust Score & Risk Analytics
                </h3>
                <p className="text-[11px] text-textSecondary">Automated integrity & audit signals computed per work</p>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded border border-emerald-200">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Avg Trust: {trustStats.avgTrust}/100</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primaryBlue" />
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* High Trust / Low Trust Highlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Top Trusted Work */}
                  {trustStats.bestProject && (
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Highest Trust Score Work
                        </span>
                        <span className="font-mono font-extrabold text-emerald-700 text-sm">
                          {trustStats.bestProject.trustScore ?? 95}/100
                        </span>
                      </div>
                      <p className="font-bold text-govNavy truncate">{trustStats.bestProject.workName}</p>
                      <span className="text-[10px] text-textSecondary font-mono block">
                        Code: {trustStats.bestProject.projectCode} • Sector: {trustStats.bestProject.sector}
                      </span>
                    </div>
                  )}

                  {/* Lowest Trust Work */}
                  {trustStats.lowestProject && (
                    <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase text-red-800 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          Lowest Trust / High Risk Work
                        </span>
                        <span className="font-mono font-extrabold text-red-700 text-sm">
                          {trustStats.lowestProject.trustScore ?? 40}/100
                        </span>
                      </div>
                      <p className="font-bold text-govNavy truncate">{trustStats.lowestProject.workName}</p>
                      <span className="text-[10px] text-textSecondary font-mono block">
                        Code: {trustStats.lowestProject.projectCode} • Action Needed
                      </span>
                    </div>
                  )}
                </div>

                {/* Trust Bracket Distribution */}
                <div className="space-y-2 pt-1 border-t border-govBorder">
                  <span className="text-[11px] font-bold text-govNavy block uppercase tracking-wide">
                    Trust Spectrum Breakdown ({projects.length} Works)
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
                      <span className="text-lg font-extrabold text-emerald-700 block">{trustStats.highCount}</span>
                      <span className="text-[10px] font-semibold text-emerald-900 block">High Trust (&gt;80)</span>
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                      <span className="text-lg font-extrabold text-amber-700 block">{trustStats.medCount}</span>
                      <span className="text-[10px] font-semibold text-amber-900 block">Moderate (60-80)</span>
                    </div>
                    <div className="p-2 bg-red-50 border border-red-200 rounded">
                      <span className="text-lg font-extrabold text-red-700 block">{trustStats.lowCount}</span>
                      <span className="text-[10px] font-semibold text-red-900 block">Low Trust (&lt;60)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Full Width Grid for Advanced Analytics (Sections 6, 7, 8, 9) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 6. Financial Progress vs Physical Progress (Scatter Plot & Anomaly Detector) */}
          <div className="gov-card p-5 space-y-4 bg-white rounded-xl border border-govBorder shadow-xs">
            <div className="flex items-center justify-between border-b border-govBorder pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primaryBlue" />
                  Financial vs Physical Progress (Anomaly Scatter Plot)
                </h3>
                <p className="text-[11px] text-textSecondary">
                  Detects financial disbursement exceeding physical work completion ($Y &gt; X + 15\%$)
                </p>
              </div>
              {anomalyCount > 0 && (
                <span className="text-xs font-extrabold bg-red-100 text-red-800 px-2.5 py-1 rounded border border-red-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  {anomalyCount} Anomalies
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primaryBlue" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-56 relative w-full bg-govBg/50 border border-govBorder rounded-lg p-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 200">
                    {/* Grid background */}
                    <line x1="30" y1="20" x2="290" y2="20" stroke="#CBD5E1" strokeDasharray="2 2" />
                    <line x1="30" y1="70" x2="290" y2="70" stroke="#CBD5E1" strokeDasharray="2 2" />
                    <line x1="30" y1="120" x2="290" y2="120" stroke="#CBD5E1" strokeDasharray="2 2" />
                    <line x1="30" y1="170" x2="290" y2="170" stroke="#CBD5E1" />

                    {/* 1:1 Parity Diagonal Line */}
                    <line x1="30" y1="170" x2="290" y2="20" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />

                    {/* Axis Labels */}
                    <text x="160" y="195" fontSize="9" textAnchor="middle" fill="#475569" fontWeight="bold">Physical Progress (%) →</text>
                    <text x="12" y="95" fontSize="9" textAnchor="middle" fill="#475569" fontWeight="bold" transform="rotate(-90 12 95)">Financial Progress (%) →</text>

                    {/* Scatter Dots */}
                    {scatterPoints.map((pt, i) => {
                      const cx = 30 + (pt.x / 100) * 260;
                      const cy = 170 - (pt.y / 100) * 150;
                      return (
                        <g
                          key={i}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredProject(pt.project)}
                          onMouseLeave={() => setHoveredProject(null)}
                        >
                          <circle
                            cx={cx}
                            cy={cy}
                            r={pt.isAnomaly ? "6" : "4.5"}
                            fill={pt.isAnomaly ? "#EF4444" : "#1D5D91"}
                            stroke={pt.isAnomaly ? "#B91C1C" : "#FFF"}
                            strokeWidth="1.5"
                            className={pt.isAnomaly ? "animate-pulse" : ""}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Hover Details Banner */}
                {hoveredProject ? (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-xs flex items-center justify-between text-govNavy">
                    <div className="truncate">
                      <strong className="block truncate">{hoveredProject.workName}</strong>
                      <span className="text-[10px] text-textSecondary font-mono">{hoveredProject.projectCode}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-primaryBlue block">Phys: {hoveredProject.physicalProgress}% • Fin: {hoveredProject.financialProgress}%</span>
                      <span className="text-[10px] font-bold text-emerald-700">₹{((hoveredProject.sanctionedCost || 0) / 100000).toFixed(1)} L</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-textSecondary text-center italic">
                    Hover over dots on the scatter plot to inspect project physical vs financial completion parity.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. Verification Outcome Analytics */}
          <div className="gov-card p-5 space-y-4 bg-white rounded-xl border border-govBorder shadow-xs">
            <div className="flex items-center justify-between border-b border-govBorder pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primaryBlue" />
                  Verification & Inspection Outcomes
                </h3>
                <p className="text-[11px] text-textSecondary">Status of field monitoring checks & authority review decisions</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primaryBlue" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stacked Progress Bar */}
                <div className="w-full bg-govBg rounded-full h-4 overflow-hidden border border-govBorder flex">
                  {verificationOutcomes.map((vo) => (
                    <div
                      key={vo.label}
                      className={`h-full ${vo.color} transition-all duration-500`}
                      style={{ width: `${vo.pct}%` }}
                      title={`${vo.label}: ${vo.count} (${vo.pct}%)`}
                    />
                  ))}
                </div>

                {/* Outcome Category Cards Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {verificationOutcomes.map((vo) => (
                    <div key={vo.label} className="p-3 bg-govBg/60 border border-govBorder rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${vo.color}`}></span>
                        <span className="font-semibold text-govNavy">{vo.label}</span>
                      </div>
                      <span className="font-bold text-govNavy font-mono">{vo.count} ({vo.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 8. Top 10 Costliest Projects (Horizontal Ranking Chart) */}
          <div className="gov-card p-5 space-y-4 bg-white rounded-xl border border-govBorder shadow-xs">
            <div className="flex items-center justify-between border-b border-govBorder pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primaryBlue" />
                  Top 10 High-Value Sanctioned Works
                </h3>
                <p className="text-[11px] text-textSecondary">Ranked by sanctioned allocation amount</p>
              </div>
              <Link href="/dashboard/mp/projects" className="text-xs font-bold text-primaryBlue hover:underline flex items-center gap-1">
                <span>All Works</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primaryBlue" />
              </div>
            ) : (
              <div className="space-y-2.5 text-xs max-h-[340px] overflow-y-auto pr-1">
                {topCostlyProjects.map((p, idx) => {
                  const maxCost = (topCostlyProjects[0]?.sanctionedCost || topCostlyProjects[0]?.estimatedCost || 1);
                  const cost = p.sanctionedCost || p.estimatedCost || 0;
                  const barWidth = Math.max(8, Math.round((cost / maxCost) * 100));

                  return (
                    <div key={p.id} className="p-2.5 bg-govBg/40 border border-govBorder rounded-lg space-y-1 hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate max-w-[70%]">
                          <span className="w-5 h-5 rounded-full bg-primaryBlue text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <strong className="text-govNavy truncate">{p.workName}</strong>
                        </div>
                        <span className="font-mono font-bold text-primaryBlue shrink-0">
                          ₹{(cost / 100000).toFixed(1)} Lakh
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-primaryBlue h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 9. District / Jurisdiction Comparative Analytics */}
          <div className="gov-card p-5 space-y-4 bg-white rounded-xl border border-govBorder shadow-xs">
            <div className="flex items-center justify-between border-b border-govBorder pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <Target className="w-4 h-4 text-primaryBlue" />
                  District & Jurisdiction Performance Comparison
                </h3>
                <p className="text-[11px] text-textSecondary">Comparative utilization & AI trust score across administrative units</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primaryBlue" />
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {jurisdictionComparison.map((j) => (
                  <div key={j.name} className="p-3 bg-govBg/50 border border-govBorder rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-govNavy text-xs">{j.name}</strong>
                        <span className="text-[10px] text-textSecondary block">{j.count} Active Works</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700 text-xs block">Util: {j.utilizationPct}%</span>
                        <span className="text-[10px] font-semibold text-primaryBlue">Trust: {j.avgTrust}/100</span>
                      </div>
                    </div>

                    {/* Utilization Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, j.utilizationPct)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </AppShell>
  );
}

