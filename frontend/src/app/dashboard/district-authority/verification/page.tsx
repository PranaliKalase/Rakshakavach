"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { fetchVerificationQueue, recordAuthorityDecision } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckSquare, Filter, Loader2, Eye, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DistrictVerificationPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [decisionModal, setDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'SANCTIONED' | 'VERIFIED' | 'CLARIFICATION_REQUIRED' | 'REJECTED'>('VERIFIED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchVerificationQueue(50);
        if (isMounted) setQueue(data);
      } catch (err) {
        console.error("Failed to load verification queue:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleOpenDecision = (item: any, defaultType: 'SANCTIONED' | 'VERIFIED' | 'CLARIFICATION_REQUIRED' | 'REJECTED') => {
    setSelectedItem(item);
    setDecisionType(defaultType);
    setRemarks('');
    setDecisionModal(true);
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      setSubmitting(true);
      await recordAuthorityDecision(selectedItem.id || selectedItem.project_code, {
        authority_id: "usr-da-official",
        decision: decisionType,
        remarks: remarks || `District Authority decision: ${decisionType}`
      });

      setActionSuccess(`Recorded decision "${decisionType}" for project ${selectedItem.project_code || selectedItem.id}`);
      setDecisionModal(false);

      // Refresh queue
      const updatedQueue = await fetchVerificationQueue(50);
      setQueue(updatedQueue);
    } catch (err: any) {
      console.error("Error submitting governance decision:", err);
      alert(`Decision failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1.5">
            <Link href="/dashboard/district-authority" className="hover:text-blue-600">District Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Verification Queue</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span>District Verification & Governance Review Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Projects flagged by AI risk engine, field inspections, or pending district authority approvals ({queue.length} items)
          </p>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')} className="text-emerald-600 text-xs">Dismiss</button>
          </div>
        )}

        {/* Verification Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Loading verification queue from database...</span>
            </div>
          ) : queue.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs font-medium">
              No pending projects in verification queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Project Code</th>
                    <th className="p-3.5">Work Name</th>
                    <th className="p-3.5">Risk Factor / Explanation</th>
                    <th className="p-3.5">Trust Score</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">District Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {queue.map((item, idx) => {
                    const isHigh = item.verification_priority === 'HIGH_PRIORITY' || item.priority === 'HIGH_PRIORITY';
                    const pCode = item.project_code || item.projectCode || `PROJ-${idx+1}`;
                    const reason = item.explanation_headline || (item.findings && item.findings[0]?.explanation) || "Flagged for verification";

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/70">
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.verification_priority || item.priority || 'ATTENTION'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-blue-600">{pCode}</td>
                        <td className="p-3.5 font-semibold text-slate-900 max-w-xs truncate">{item.work_name || item.workName || 'MPLADS Work'}</td>
                        <td className="p-3.5 text-slate-600 max-w-sm text-[11px]">{reason}</td>
                        <td className="p-3.5 font-bold text-emerald-600">{item.trust_score || item.trustScore || 78.5}</td>
                        <td className="p-3.5 font-semibold text-slate-700">{item.status || 'UNDER_REVIEW'}</td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <Link
                            href={`/projects/${item.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg hover:bg-slate-200 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </Link>

                          <button
                            onClick={() => handleOpenDecision(item, 'VERIFIED')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleOpenDecision(item, 'CLARIFICATION_REQUIRED')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 text-xs"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Escalate</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Governance Decision Modal */}
        {decisionModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">District Governance Decision</h3>
                <button onClick={() => setDecisionModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
              </div>

              <div className="text-xs space-y-1">
                <p><span className="text-slate-500">Project Code:</span> <strong className="font-mono font-bold text-blue-600">{selectedItem.project_code || selectedItem.id}</strong></p>
                <p><span className="text-slate-500">Work Name:</span> <strong className="text-slate-900">{selectedItem.work_name || selectedItem.workName}</strong></p>
              </div>

              <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Decision Action:</label>
                  <select 
                    value={decisionType}
                    onChange={(e: any) => setDecisionType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="VERIFIED">Approve & Verify Project</option>
                    <option value="SANCTIONED">Sanction Project Budget</option>
                    <option value="CLARIFICATION_REQUIRED">Escalate / Require Clarification</option>
                    <option value="REJECTED">Reject Work Recommendation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">District Authority Remarks:</label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter official remarks, verification details, or instructions..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDecisionModal(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Recording...' : 'Submit Official Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
