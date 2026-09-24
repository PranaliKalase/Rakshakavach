"use client";

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { fetchProjects, fetchVerificationQueue, submitInspection } from '@/lib/api';
import { Project } from '@/types/project';
import { ClipboardCheck, MapPin, AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';

export default function MonitoringOfficerDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [physicalProgress, setPhysicalProgress] = useState<number>(40);
  const [outcome, setOutcome] = useState<string>('VERIFIED');
  const [remarks, setRemarks] = useState<string>('Field inspection completed. Physical progress verified against reported milestones.');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [projData, queueData] = await Promise.all([
          fetchProjects(100),
          fetchVerificationQueue(50)
        ]);
        setProjects(projData);
        setQueue(queueData);
        if (projData.length > 0) {
          setSelectedProjectId(projData[0].id);
        }
      } catch (err) {
        console.error("Error loading Monitoring Officer data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setSubmittedMessage(null);

      await submitInspection(selectedProject.id, {
        officer_id: "usr-mo-official",
        actual_physical_progress: Number(physicalProgress),
        observed_condition: remarks,
        is_location_verified: true,
        verification_outcome: outcome,
        officer_remarks: remarks
      });

      setSubmittedMessage(`Field inspection for project ${selectedProject.projectCode} submitted successfully to District Authority queue with outcome: ${outcome.replace(/_/g, ' ')}`);
      
      // Refresh verification queue
      const updatedQueue = await fetchVerificationQueue(50);
      setQueue(updatedQueue);
    } catch (err: any) {
      console.error("Inspection submission error:", err);
      setErrorMessage(err.message || "Failed to submit field inspection.");
    } finally {
      setSubmitting(false);
    }
  };

  const highPriorityCount = projects.filter(p => p.priority === 'HIGH_PRIORITY').length;
  const attentionCount = projects.filter(p => p.priority === 'ATTENTION').length;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="border-b border-govBorder pb-4">
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">Field Verification — Monitoring Officer</h1>
          <p className="text-xs text-textSecondary mt-0.5">On-site physical inspection and verification report workflow (Live Backend Connected).</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Assigned Queue" value={queue.length.toString()} subtitle="Verification Items" icon={<ClipboardCheck className="w-5 h-5 text-primaryBlue" />} />
          <KPICard title="Priority Inspections" value={highPriorityCount.toString()} subtitle="High Priority Flagged" icon={<AlertCircle className="w-5 h-5 text-red-600" />} accentColor="border-l-red-600" />
          <KPICard title="Attention Items" value={attentionCount.toString()} subtitle="Requires Review" icon={<MapPin className="w-5 h-5 text-amber-500" />} accentColor="border-l-amber-500" />
          <KPICard title="Total Database Works" value={projects.length.toString()} subtitle="Active Population" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
        </div>

        {/* Inspection Form */}
        <div className="gov-card p-6">
          <h3 className="text-sm font-bold text-govNavy mb-1">Conduct Field Inspection Report</h3>
          <p className="text-xs text-textSecondary mb-4">Submit physical inspection findings to the District Authority decision queue.</p>

          {submittedMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{submittedMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8 text-textSecondary gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" />
              <span className="text-xs font-semibold">Loading assigned project queue...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitInspection} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-textPrimary mb-1">Select Project for Inspection *</label>
                <select 
                  value={selectedProjectId} 
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    const p = projects.find(proj => proj.id === e.target.value);
                    if (p) setPhysicalProgress(p.physicalProgress || 40);
                  }}
                  className="w-full p-2.5 bg-govBg border border-govBorder rounded text-xs font-medium text-govNavy"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectCode} — {p.workName} (Trust: {p.trustScore}/100, Priority: {p.priority})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject && (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-xs space-y-1 text-blue-900">
                  <span className="font-bold text-govNavy">Target Project Details:</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div>Sanctioned Cost: <strong>₹{((selectedProject.sanctionedCost ?? 0)/100000).toFixed(2)} Lakh</strong></div>
                    <div>Actual Exp: <strong>₹{(selectedProject.actualExpenditure/100000).toFixed(2)} Lakh</strong></div>
                    <div>Reported Physical: <strong>{selectedProject.physicalProgress}%</strong></div>
                    <div>Financial Progress: <strong>{selectedProject.financialProgress}%</strong></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Observed Physical Progress (%) *</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={physicalProgress} 
                    onChange={(e) => setPhysicalProgress(Number(e.target.value))}
                    className="w-full p-2 bg-govBg border border-govBorder rounded text-xs font-bold" 
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Verification Outcome *</label>
                  <select 
                    value={outcome} 
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-full p-2 bg-govBg border border-govBorder rounded text-xs font-semibold"
                  >
                    <option value="VERIFIED">VERIFIED (Progress & Location Confirmed)</option>
                    <option value="REQUIRES_FURTHER_EVIDENCE">REQUIRES FURTHER EVIDENCE (Request Photos/Records)</option>
                    <option value="REQUIRES_CORRECTION">REQUIRES CORRECTION (Work Discrepancy Found)</option>
                    <option value="ESCALATED">ESCALATED (Forward to District Collector)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">Field Observation Remarks *</label>
                <textarea 
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2 bg-govBg border border-govBorder rounded text-xs"
                  required
                />
              </div>

              <div className="text-right">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-darkNavy hover:bg-govNavy text-white font-bold text-xs px-5 py-2.5 rounded flex items-center gap-2 ml-auto disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Inspection Report to Authority</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
