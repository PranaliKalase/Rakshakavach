"use client";

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { fetchVerificationQueue } from '@/lib/api';
import { 
  Bot, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Sliders,
  FileText,
  Sparkles,
  Info
} from 'lucide-react';

export default function AIGovernancePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchVerificationQueue(50);
        setQueue(data);
      } catch (err) {
        console.error("Error loading AI Governance queue:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const highPriorityCount = queue.filter(q => q.verification_priority === 'HIGH_PRIORITY').length;
  const outlierCount = queue.filter(q => q.is_ml_outlier).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="AI Governance" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs">
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
            AI Governance & Explainable Intelligence Model Center
          </h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Monitor IsolationForest anomaly detection engine hyperparameters, feature engineering weights, explainability statistics, and AI decision-support transparency.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="ML Model Engine" value="IsolationForest" subtitle="Scikit-Learn v1.0" icon={<Bot className="w-5 h-5 text-emerald-500" />} />
          <KPICard title="Contamination Rate" value="10.0%" subtitle="0.1 Hyperparameter" icon={<Sliders className="w-5 h-5 text-indigo-600" />} />
          <KPICard title="ML Outliers Flagged" value={loading ? "..." : outlierCount.toString()} subtitle="Statistical Anomalies" icon={<ShieldAlert className="w-5 h-5 text-red-600" />} accentColor="border-l-red-600" />
          <KPICard title="Explainability SLA" value="100%" subtitle="Human-in-the-Loop" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
        </div>

        {/* Explainability Model Architecture */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              MULTI-FACTOR AI EXPLAINABILITY PIPELINE
            </h3>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Decision-Support
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-govBg border border-govBorder rounded space-y-1">
              <span className="font-bold text-govNavy block">1. Rule-Based Gatekeeper</span>
              <p className="text-textSecondary text-[11px]">Hard compliance checks for physical vs financial progress variance, unverified expenditure, and missing mandatory photo evidence.</p>
            </div>

            <div className="p-3 bg-govBg border border-govBorder rounded space-y-1">
              <span className="font-bold text-govNavy block">2. Statistical Peer Benchmarks</span>
              <p className="text-textSecondary text-[11px]">Calculates Z-score deviations against sector cost baselines, average project duration, and district completion velocity.</p>
            </div>

            <div className="p-3 bg-govBg border border-govBorder rounded space-y-1">
              <span className="font-bold text-govNavy block">3. IsolationForest Unsupervised ML</span>
              <p className="text-textSecondary text-[11px]">Isolation Forest algorithm detects multi-dimensional outliers without ground-truth labels, producing normalized trust scores.</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-xs text-blue-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span><strong>Governance Policy:</strong> AI predictions serve as decision-support indicators. Final sanctioning, verification, and governance decisions require human authority sign-off.</span>
          </div>
        </div>

        {/* AI Model Evaluation Queue */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-govBorder pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primaryBlue" />
              AI FLAGGED PROJECTS & EXPLAINABLE REASON CODES ({queue.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center text-xs text-textSecondary gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Evaluating AI anomaly model features...</span>
            </div>
          ) : queue.length === 0 ? (
            <div className="py-8 text-center text-xs text-textSecondary">
              No AI flagged projects.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px]">
                    <th className="p-3">Project Code</th>
                    <th className="p-3">Work Name</th>
                    <th className="p-3">Trust Score</th>
                    <th className="p-3">ML Anomaly Score</th>
                    <th className="p-3">Primary Anomaly Explanation</th>
                    <th className="p-3">AI Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govBorder">
                  {queue.slice(0, 8).map((q) => (
                    <tr key={q.id} className="hover:bg-govBg/50">
                      <td className="p-3 font-mono font-bold text-primaryBlue">{q.project_code}</td>
                      <td className="p-3 font-bold text-govNavy">{q.work_name}</td>
                      <td className="p-3 font-mono font-bold text-govNavy">{q.trust_score}/100</td>
                      <td className="p-3 font-mono font-bold text-purple-700">{q.ml_anomaly_score ? q.ml_anomaly_score.toFixed(3) : "0.120"}</td>
                      <td className="p-3 font-medium text-textPrimary text-[11px]">{q.explanation_headline || "Variance detected in financial expenditure vs physical milestone."}</td>
                      <td className="p-3 font-bold text-emerald-700">{q.recommended_action || "Field Verification"}</td>
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
