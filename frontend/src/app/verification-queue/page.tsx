"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { fetchVerificationQueue, recordAuthorityDecision } from '@/lib/api';
import { Project } from '@/types/project';
import { 
  CheckSquare, 
  Eye, 
  FileCheck2, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  ClipboardCheck,
  X,
  Loader2
} from 'lucide-react';

export default function VerificationQueuePage() {
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'sanction' | 'reject' | 'assign_agency' | 'assign_inspection' | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [sanctionAmount, setSanctionAmount] = useState<number>(2500000);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string>('agency-pwd-01');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('usr-mo-01');
  const [toastMsg, setToastMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  async function loadQueue() {
    try {
      setLoading(true);
      const queue = await fetchVerificationQueue(100);
      setProjectsList(queue);
    } catch (err) {
      console.error("Error loading verification queue:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

  const openActionModal = (project: any, action: 'sanction' | 'reject' | 'assign_agency' | 'assign_inspection') => {
    setSelectedProject(project);
    setSanctionAmount(project.sanctioned_cost || project.estimated_cost || 2500000);
    setActiveModal(action);
  };

  const handleSanctionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setSubmitting(true);
      await recordAuthorityDecision(selectedProject.id, {
        authority_id: "usr-da-official",
        decision: "SANCTIONED",
        remarks: `District Collector sanctioned budget ₹${(sanctionAmount/100000).toFixed(2)} Lakh.`
      });

      setToastMsg(`Project ${selectedProject.project_code || selectedProject.projectCode} sanctioned successfully!`);
      setActiveModal(null);
      await loadQueue();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err: any) {
      alert(`Sanction recording failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !rejectionReason) return;

    try {
      setSubmitting(true);
      await recordAuthorityDecision(selectedProject.id, {
        authority_id: "usr-da-official",
        decision: "REJECTED",
        remarks: rejectionReason
      });

      setToastMsg(`Project ${selectedProject.project_code || selectedProject.projectCode} rejected. Decision recorded in audit log.`);
      setActiveModal(null);
      setRejectionReason('');
      await loadQueue();
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err: any) {
      alert(`Rejection recording failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setToastMsg(`Assigned Implementing Agency to Project ${selectedProject.project_code || selectedProject.projectCode}.`);
    setActiveModal(null);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAssignInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setToastMsg(`Field inspection assigned to Monitoring Officer for ${selectedProject.project_code || selectedProject.projectCode}.`);
    setActiveModal(null);
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="border-b border-govBorder pb-4">
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">Centralized Verification Queue</h1>
          <p className="text-xs text-textSecondary mt-0.5">Priority-sorted review queue for district authorities and field monitoring officers (Live Database Connected).</p>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="gov-card p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-textSecondary gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" />
              <span className="text-xs font-semibold">Loading live verification queue from Supabase...</span>
            </div>
          ) : projectsList.length === 0 ? (
            <div className="p-8 text-center text-textSecondary text-xs">
              No verification queue items requiring attention.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-govBg text-textSecondary uppercase font-semibold text-[10px] border-b border-govBorder">
                  <tr>
                    <th className="p-3">Project Code</th>
                    <th className="p-3">Work Name</th>
                    <th className="p-3">Trust Score</th>
                    <th className="p-3">Signals / Risk Reason</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Interactive Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govBorder">
                  {projectsList.map((p) => {
                    const code = p.project_code || p.projectCode || p.id;
                    const name = p.work_name || p.workName || 'Untitled Project';
                    const score = p.trust_score !== undefined ? p.trust_score : (p.trustScore !== undefined ? p.trustScore : 100);
                    const reason = p.explanation || p.risk_reason || (p.priority === 'HIGH_PRIORITY' ? 'Progress Mismatch Flagged' : 'Routine Verification');

                    return (
                      <tr key={p.id} className="hover:bg-govBg/50">
                        <td className="p-3 font-mono font-semibold text-govNavy">{code}</td>
                        <td className="p-3 font-medium text-textPrimary">{name}</td>
                        <td className="p-3 font-bold text-amber-600">{score}/100</td>
                        <td className="p-3 text-statusRed font-semibold">{reason}</td>
                        <td className="p-3"><StatusBadge priority={p.priority} /></td>
                        <td className="p-3"><StatusBadge status={p.status} /></td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => openActionModal(p, 'sanction')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sanction</span>
                          </button>

                          <button
                            onClick={() => openActionModal(p, 'assign_agency')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primaryBlue hover:bg-govNavy text-white rounded font-semibold text-[11px]"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Assign Agency</span>
                          </button>

                          <button
                            onClick={() => openActionModal(p, 'assign_inspection')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-[11px]"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Inspection</span>
                          </button>

                          <Link href={`/projects/${p.id}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-govBg border border-govBorder hover:border-primaryBlue text-govNavy rounded font-semibold text-[11px]">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
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

        {/* Modal Popups */}
        {activeModal && selectedProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full border border-govBorder shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-govBorder">
                <span className="font-bold text-govNavy text-sm font-mono">{selectedProject.project_code || selectedProject.projectCode} — {selectedProject.work_name || selectedProject.workName}</span>
                <button onClick={() => setActiveModal(null)} className="p-1 text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sanction Form */}
              {activeModal === 'sanction' && (
                <form onSubmit={handleSanctionSubmit} className="space-y-3 text-xs">
                  <h3 className="font-bold text-govNavy">District Collector Sanction Approval</h3>
                  <div>
                    <label className="block font-semibold mb-1">Sanctioned Budget Allocation (INR) *</label>
                    <input required type="number" value={sanctionAmount} onChange={(e) => setSanctionAmount(Number(e.target.value))} className="w-full p-2 bg-govBg border border-govBorder rounded" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Sanction Order Remarks</label>
                    <textarea rows={2} defaultValue="Sanctioned based on technical feasibility review and available district budget." className="w-full p-2 bg-govBg border border-govBorder rounded" />
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-govBorder">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-govBg border border-govBorder rounded font-semibold">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 flex items-center gap-1.5">
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Confirm Sanction Order</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Assign Agency Form */}
              {activeModal === 'assign_agency' && (
                <form onSubmit={handleAssignAgencySubmit} className="space-y-3 text-xs">
                  <h3 className="font-bold text-govNavy">Assign Implementing Agency</h3>
                  <div>
                    <label className="block font-semibold mb-1">Select Empanelled Agency *</label>
                    <select value={selectedAgency} onChange={(e) => setSelectedAgency(e.target.value)} className="w-full p-2 bg-govBg border border-govBorder rounded">
                      <option value="agency-pwd-01">Public Works Department (PWD-MH-CIVIL)</option>
                      <option value="agency-cpwd-02">Central Public Works Dept (CPWD-MH-BUILD)</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-govBorder">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-govBg border border-govBorder rounded font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-primaryBlue text-white font-bold rounded hover:bg-govNavy">Confirm Agency Assignment</button>
                  </div>
                </form>
              )}

              {/* Assign Inspection Form */}
              {activeModal === 'assign_inspection' && (
                <form onSubmit={handleAssignInspectionSubmit} className="space-y-3 text-xs">
                  <h3 className="font-bold text-govNavy">Assign Field Inspection Task</h3>
                  <div>
                    <label className="block font-semibold mb-1">Assigned Field Monitoring Officer *</label>
                    <select value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)} className="w-full p-2 bg-govBg border border-govBorder rounded">
                      <option value="usr-mo-01">Vikram Singh (Field Monitoring Officer)</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-govBorder">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-govBg border border-govBorder rounded font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold rounded hover:bg-amber-700">Dispatch Inspection Order</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
