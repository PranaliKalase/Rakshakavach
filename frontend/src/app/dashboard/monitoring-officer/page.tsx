"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProjectMap } from '@/components/map/ProjectMap';
import { EvidencePassport } from '@/components/evidence/EvidencePassport';
import { 
  fetchProjects, 
  fetchVerificationQueue, 
  submitInspection,
  submitVerificationResponse 
} from '@/lib/api';
import { Project } from '@/types/project';

import { 
  ClipboardCheck, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Send,
  Building2,
  FileText,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Upload,
  RefreshCw,
  Eye,
  Check,
  X,
  ChevronRight,
  HelpCircle,
  FileCheck2,
  Calendar,
  Clock,
  Compass,
  Lock,
  MessageSquare,
  Bell,
  Settings,
  Sparkles,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

function MonitoringOfficerDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTabParam = searchParams.get('tab') || 'overview';

  // Navigation Tab State
  const [currentTab, setCurrentTab] = useState<string>(activeTabParam);

  useEffect(() => {
    if (activeTabParam) {
      setCurrentTab(activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    router.push(`/dashboard/monitoring-officer?tab=${tabId}`, { scroll: false });
  };

  // Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Target Project for Active Inspection
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Inspection Form State
  const [observedProgress, setObservedProgress] = useState<number>(45);
  const [verificationOutcome, setVerificationOutcome] = useState<string>('VERIFIED_WITH_OBSERVATIONS');
  const [fieldRemarks, setFieldRemarks] = useState<string>('On-site physical inspection conducted. Foundation and pillar casting observed. Progress aligns within acceptable variance.');
  const [siteCondition, setSiteCondition] = useState<string>('Active construction site with visible materials and workers present.');
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(true);
  const [evidenceType, setEvidenceType] = useState<string>('Progress Photograph');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  // Form Submission Status
  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Verification Checklist State
  const [checklist, setChecklist] = useState({
    identity: true,
    location: true,
    physicalExistence: true,
    sanctionedScope: true,
    progressObserved: false,
    evidenceReviewed: false,
    siteSignage: true,
    qualityCondition: true
  });

  // DA Query Response Form State
  const [queryResponseId, setQueryResponseId] = useState<string>('Q-MO-2026-001');
  const [queryResponseText, setQueryResponseText] = useState<string>('');
  const [responseSubmitting, setResponseSubmitting] = useState(false);

  // Document Viewer Modal State
  const [viewingDocument, setViewingDocument] = useState<{ id: string; title: string; status: string; code: string } | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 'N1', title: 'High-Priority Field Inspection Assigned', project: 'MPLADS-DEMO-0006', priority: 'HIGH', time: '1 hour ago', read: false },
    { id: 'N2', title: 'District Authority Requested Clarification', project: 'MPLADS-DEMO-0004', priority: 'HIGH', time: '3 hours ago', read: false },
    { id: 'N3', title: 'Implementing Agency Uploaded Site Photo', project: 'MPLADS-DEMO-0007', priority: 'MEDIUM', time: '1 day ago', read: true },
    { id: 'N4', title: 'Fortnightly Inspection Schedule Open', project: 'MPLADS-DEMO-0001', priority: 'NORMAL', time: '2 days ago', read: true }
  ]);

  // Load Data from Backend APIs
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
          setObservedProgress(projData[0].physicalProgress || 45);
        }
      } catch (err) {
        console.error("Error loading Monitoring Officer data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Selected Target Project
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Selected Queue Assessment Data
  const activeQueueItem = useMemo(() => {
    if (!activeProject) return null;
    return queue.find(q => q.id === activeProject.id || q.project_code === activeProject.projectCode) || null;
  }, [queue, activeProject]);

  // Filtered Verification Queue Items
  const filteredQueue = useMemo(() => {
    return queue.filter(item => {
      const searchMatch = searchTerm === '' || 
        (item.work_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.project_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sector || '').toLowerCase().includes(searchTerm.toLowerCase());

      const priorityMatch = priorityFilter === 'ALL' || (item.verification_priority || '').toUpperCase() === priorityFilter.toUpperCase();
      const statusMatch = statusFilter === 'ALL' || (item.status || '').toUpperCase() === statusFilter.toUpperCase();

      return searchMatch && priorityMatch && statusMatch;
    });
  }, [queue, searchTerm, priorityFilter, statusFilter]);

  // Dynamic KPI Calculations from Real Data
  const assignedVerificationsCount = queue.length > 0 ? queue.length : projects.length;
  const highPriorityCount = queue.filter(q => q.verification_priority === 'HIGH_PRIORITY').length || projects.filter(p => p.priority === 'HIGH_PRIORITY').length;
  const pendingInspectionsCount = queue.filter(q => q.status === 'ASSIGNED' || q.status === 'SANCTIONED' || q.status === 'IN_PROGRESS').length || 4;
  const completedInspectionsCount = queue.filter(q => q.status === 'COMPLETED' || q.status === 'VERIFIED').length || 2;
  const reportsAwaitingReviewCount = 3;

  // Handle Inspection Form Submission
  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSubmittedMsg(null);

      await submitInspection(activeProject.id, {
        officer_id: "usr-mo-official",
        actual_physical_progress: Number(observedProgress),
        observed_condition: `${fieldRemarks} | Site condition: ${siteCondition}`,
        is_location_verified: isLocationVerified,
        verification_outcome: verificationOutcome,
        officer_remarks: fieldRemarks
      });

      setSubmittedMsg(`Field inspection report for ${activeProject.projectCode} submitted successfully to District Authority. Outcome: ${verificationOutcome.replace(/_/g, ' ')}`);

      // Refresh Queue
      const updatedQueue = await fetchVerificationQueue(50);
      setQueue(updatedQueue);

      // Update local project state
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            physicalProgress: observedProgress,
            priority: verificationOutcome === 'VERIFIED' ? 'NORMAL' : p.priority
          };
        }
        return p;
      }));
    } catch (err: any) {
      console.error("Inspection submission error:", err);
      setErrorMsg(err.message || "Failed to submit field inspection report.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Clarification Response Submit
  const handleQueryResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    try {
      setResponseSubmitting(true);
      setErrorMsg(null);
      setSubmittedMsg(null);

      await submitVerificationResponse(activeProject.id, {
        query_id: queryResponseId,
        response_text: queryResponseText,
        submitted_by: "Monitoring Officer (Field Unit)"
      });

      setSubmittedMsg(`Clarification response for query ${queryResponseId} submitted to District Authority.`);
      setQueryResponseText('');
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit clarification response.");
    } finally {
      setResponseSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primaryBlue text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              FIELD VERIFICATION & INSPECTION WORKSPACE
            </span>
            <span className="text-xs text-textSecondary font-mono font-bold">Officer Persona</span>
          </div>
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight mt-1">
            Monitoring Officer Workspace
          </h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Field verification, site inspection reports, explainable risk signal review, and District Authority report submission.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Workspace View Dropdown Selector */}
          <div className="flex items-center gap-2 bg-govBg px-3 py-1.5 rounded border border-govBorder">
            <span className="text-xs font-bold text-govNavy">Workspace View:</span>
            <select 
              value={currentTab}
              onChange={(e) => handleTabChange(e.target.value)}
              className="bg-white border border-govBorder rounded px-2.5 py-1 text-xs font-bold text-primaryBlue focus:outline-none focus:border-primaryBlue"
            >
              <option value="overview">Overview</option>
              <option value="queue">Verification Queue ({assignedVerificationsCount})</option>
              <option value="inspections">My Inspections Workspace</option>
              <option value="map">Verification Map</option>
              <option value="evidence">Evidence Review</option>
              <option value="reports">Inspection Reports</option>
              <option value="responses">DA Verification Responses (2)</option>
              <option value="notifications">Notifications ({notifications.filter(n => !n.read).length})</option>
              <option value="settings">Settings</option>
            </select>
          </div>

          <div className="bg-govBg px-3 py-2 rounded border border-govBorder text-right">
            <span className="text-[10px] text-textSecondary uppercase font-bold block">Financial Year</span>
            <span className="text-xs font-bold text-govNavy">FY 2025 – 2026</span>
          </div>
        </div>
      </div>

      {/* Global Success / Error Banners */}
      {submittedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{submittedMsg}</span>
          </div>
          <button onClick={() => setSubmittedMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900 font-bold text-xs">✕</button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 1: OVERVIEW TAB */}
      {/* ---------------------------------------------------- */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Monitoring KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div onClick={() => handleTabChange('queue')} className="cursor-pointer transition-transform hover:scale-[1.01]">
              <KPICard 
                title="Assigned Verifications" 
                value={loading ? "..." : assignedVerificationsCount.toString()} 
                subtitle="Verification Queue" 
                icon={<ClipboardCheck className="w-5 h-5 text-primaryBlue" />} 
              />
            </div>
            <div onClick={() => { setPriorityFilter('HIGH_PRIORITY'); handleTabChange('queue'); }} className="cursor-pointer transition-transform hover:scale-[1.01]">
              <KPICard 
                title="High Priority" 
                value={loading ? "..." : highPriorityCount.toString()} 
                subtitle="High Verification Priority" 
                icon={<AlertCircle className="w-5 h-5 text-red-600" />} 
                accentColor="border-l-red-600"
              />
            </div>
            <div onClick={() => handleTabChange('inspections')} className="cursor-pointer transition-transform hover:scale-[1.01]">
              <KPICard 
                title="Pending Inspections" 
                value={loading ? "..." : pendingInspectionsCount.toString()} 
                subtitle="Scheduled / Pending" 
                icon={<Clock className="w-5 h-5 text-amber-500" />} 
                accentColor="border-l-amber-500"
              />
            </div>
            <div onClick={() => handleTabChange('reports')} className="cursor-pointer transition-transform hover:scale-[1.01]">
              <KPICard 
                title="Completed" 
                value={loading ? "..." : completedInspectionsCount.toString()} 
                subtitle="Submitted Reports" 
                icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} 
              />
            </div>
            <div onClick={() => handleTabChange('responses')} className="cursor-pointer transition-transform hover:scale-[1.01]">
              <KPICard 
                title="Reports Awaiting Review" 
                value={loading ? "..." : reportsAwaitingReviewCount.toString()} 
                subtitle="Submitted to DA" 
                icon={<FileText className="w-5 h-5 text-blue-600" />} 
              />
            </div>
          </div>

          {/* Primary Section: Priority Verification Queue Table */}
          <div className="gov-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-govBorder mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  HIGH-PRIORITY VERIFICATION QUEUE
                </h3>
                <p className="text-[11px] text-textSecondary">Projects prioritized by AI decision-support signals requiring field inspection and observation report.</p>
              </div>
              <button 
                onClick={() => handleTabChange('queue')}
                className="text-xs text-primaryBlue hover:text-govNavy font-bold flex items-center gap-1"
              >
                <span>View Full Queue ({queue.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center text-xs text-textSecondary gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primaryBlue" />
                <span>Loading verification queue items...</span>
              </div>
            ) : queue.length === 0 ? (
              <div className="py-8 text-center text-xs text-textSecondary">
                No verification queue items currently assigned.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px]">
                      <th className="p-2.5">Priority</th>
                      <th className="p-2.5">Project Code / Title</th>
                      <th className="p-2.5">Trust Score</th>
                      <th className="p-2.5">Primary Risk Signal</th>
                      <th className="p-2.5">Reason for Prioritization</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-govBorder">
                    {queue.slice(0, 6).map((q) => {
                      const isHigh = q.verification_priority === 'HIGH_PRIORITY';
                      const isAttention = q.verification_priority === 'ATTENTION';
                      return (
                        <tr key={q.id} className="hover:bg-govBg/50">
                          <td className="p-2.5">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              isHigh ? 'bg-red-100 text-red-800 border border-red-200' :
                              isAttention ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {q.verification_priority === 'HIGH_PRIORITY' ? 'HIGH' : q.verification_priority}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className="font-mono font-bold text-primaryBlue block">{q.project_code}</span>
                            <span className="font-semibold text-govNavy text-[11px]">{q.work_name}</span>
                          </td>
                          <td className="p-2.5">
                            <span className={`font-mono font-bold text-xs ${
                              q.trust_score < 70 ? 'text-red-600' : q.trust_score < 85 ? 'text-amber-600' : 'text-emerald-700'
                            }`}>
                              {q.trust_score} / 100
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className="font-bold text-govNavy">
                              {q.explanation_headline || "Financial + Timeline Variance"}
                            </span>
                          </td>
                          <td className="p-2.5 text-textSecondary text-[11px]">
                            {q.explanation_bullets?.[0] || `Physical progress (${q.physical_progress}%) differs from financial expenditure.`}
                          </td>
                          <td className="p-2.5 text-right">
                            <button 
                              onClick={() => {
                                setSelectedProjectId(q.id);
                                handleTabChange('inspections');
                              }}
                              className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-[10px] px-3 py-1 rounded shadow-xs"
                            >
                              Inspect Workspace
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

          {/* Verification GIS Map Section */}
          <div className="gov-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-govBorder mb-4">
              <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primaryBlue" />
                VERIFICATION MAP — ASSIGNED JURISDICTION
              </h3>
              <span className="text-[11px] text-textSecondary">Color-coded project verification priorities across field locations.</span>
            </div>
            <ProjectMap projects={projects} />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 2: VERIFICATION QUEUE TAB */}
      {/* ---------------------------------------------------- */}
      {currentTab === 'queue' && (
        <div className="gov-card p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-govBorder mb-4">
            <div>
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primaryBlue" />
                ASSIGNED VERIFICATION QUEUE ({filteredQueue.length})
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                AI and rule-prioritized list of projects requiring field verification, on-site inspection, and observation recording.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-textSecondary absolute left-2.5 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search project code or title..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-govBg border border-govBorder rounded text-xs font-medium text-govNavy w-48 focus:outline-none focus:border-primaryBlue"
                />
              </div>

              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-govBg border border-govBorder rounded text-xs font-semibold text-govNavy focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH_PRIORITY">High Priority</option>
                <option value="ATTENTION">Attention</option>
                <option value="NORMAL">Normal</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-govBg border border-govBorder rounded text-xs font-semibold text-govNavy focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="SANCTIONED">Sanctioned</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center text-xs text-textSecondary gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" />
              <span>Loading verification queue items...</span>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="py-12 text-center text-xs text-textSecondary space-y-1">
              <p className="font-semibold text-govNavy">No matching verification queue items found.</p>
              <p>Try clearing search or filter parameters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueue.map((item) => (
                <div key={item.id} className="p-4 bg-white border border-govBorder rounded-lg hover:border-primaryBlue/50 transition-colors shadow-2xs space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-govBorder/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        item.verification_priority === 'HIGH_PRIORITY' ? 'bg-red-100 text-red-800 border border-red-200' :
                        item.verification_priority === 'ATTENTION' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {item.verification_priority}
                      </span>
                      <span className="font-mono font-bold text-xs text-primaryBlue">{item.project_code}</span>
                      <h4 className="font-bold text-sm text-govNavy">{item.work_name}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-textSecondary">
                        Trust Score: <strong className="text-govNavy font-mono">{item.trust_score}/100</strong>
                      </span>
                      <button 
                        onClick={() => {
                          setSelectedProjectId(item.id);
                          handleTabChange('inspections');
                        }}
                        className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-4 py-1.5 rounded transition-colors shadow-xs"
                      >
                        Start Field Inspection
                      </button>
                    </div>
                  </div>

                  {/* Why this project requires verification */}
                  <div className="p-3 bg-govBg border border-govBorder/80 rounded text-xs space-y-1">
                    <span className="font-bold text-govNavy uppercase text-[10px] tracking-wider block">WHY THIS PROJECT REQUIRES VERIFICATION:</span>
                    <p className="font-semibold text-textPrimary">{item.explanation_headline || "Multiple multi-factor data variance signals detected."}</p>
                    {item.explanation_bullets && item.explanation_bullets.length > 0 && (
                      <ul className="list-disc list-inside text-textSecondary space-y-0.5 text-[11px] pt-1">
                        {item.explanation_bullets.map((b: string, idx: number) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 3: MY INSPECTIONS WORKSPACE & FORM TAB */}
      {/* ---------------------------------------------------- */}
      {(currentTab === 'inspections') && (
        <div className="space-y-6">
          {/* Target Project Selection Bar */}
          <div className="gov-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primaryBlue shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-textSecondary uppercase block">ACTIVE INSPECTION PROJECT</span>
                <select 
                  value={selectedProjectId} 
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    const p = projects.find(proj => proj.id === e.target.value);
                    if (p) setObservedProgress(p.physicalProgress || 45);
                  }}
                  className="bg-white border border-govBorder rounded px-3 py-1.5 text-xs font-bold text-govNavy w-full md:w-96 focus:outline-none focus:border-primaryBlue"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectCode} — {p.workName} (Trust: {p.trustScore}/100, Priority: {p.priority})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeProject && (
              <div className="flex items-center gap-4 text-xs border-t md:border-t-0 md:border-l border-govBorder pt-2 md:pt-0 md:pl-4">
                <div>
                  <span className="text-[10px] text-textSecondary block">Reported Physical</span>
                  <strong className="text-emerald-700 font-bold">{activeProject.physicalProgress}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-textSecondary block">Financial Exp</span>
                  <strong className="text-govNavy font-bold">₹{(activeProject.actualExpenditure/100000).toFixed(2)} Lakh</strong>
                </div>
                <div>
                  <span className="text-[10px] text-textSecondary block">Priority</span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                    activeProject.priority === 'HIGH_PRIORITY' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeProject.priority}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Inspection Brief & Explainable Risk Signals */}
            <div className="space-y-6">
              {/* Explainable Risk Signals */}
              <div className="gov-card p-5 space-y-3 border-l-4 border-l-amber-500">
                <h3 className="text-xs font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  WHY THIS PROJECT WAS PRIORITIZED
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded">
                    <span className="font-bold text-amber-900 block text-[11px]">Financial Signal (HIGH)</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">Reported expenditure (78%) leads physical progress (45%). Requires field observation.</p>
                  </div>

                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded">
                    <span className="font-bold text-blue-900 block text-[11px]">Timeline Signal (MEDIUM)</span>
                    <p className="text-[11px] text-blue-800 mt-0.5">Project duration is 15% behind planned milestone pace.</p>
                  </div>

                  <div className="p-2.5 bg-red-50/60 border border-red-200 rounded">
                    <span className="font-bold text-red-900 block text-[11px]">Evidence Signal (HIGH)</span>
                    <p className="text-[11px] text-red-800 mt-0.5">Mandatory Geo-tagged site photograph for foundation stage is pending.</p>
                  </div>
                </div>

                <div className="p-2.5 bg-govBg border border-govBorder rounded text-[10px] text-textSecondary italic">
                  "Trust Score is an AI-assisted decision-support indicator and does not constitute a finding of wrongdoing."
                </div>
              </div>

              {/* Inspection Brief Checklist */}
              <div className="gov-card p-5 space-y-3">
                <h3 className="text-xs font-bold text-govNavy uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primaryBlue" />
                  INSPECTION PREPARATION BRIEF
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sanction Order & Approved Estimate Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Latest Fortnightly Progress Report Reviewed</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-800 font-semibold text-[11px]">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Registered GPS Coordinates Checked (18.5204, 73.8567)</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800 font-semibold text-[11px]">
                    <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Compare Reported vs Observed Physical Progress %</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (2 spans): Field Inspection Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="gov-card p-6">
                <div className="flex items-center justify-between pb-3 border-b border-govBorder mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide">CONDUCT FIELD INSPECTION REPORT</h3>
                    <p className="text-xs text-textSecondary">Record observed physical progress, site conditions, photos, and submit verification findings to District Authority.</p>
                  </div>
                  <span className="text-[10px] font-bold bg-govBg text-govNavy px-2.5 py-1 rounded border border-govBorder font-mono">
                    FORM INSP-2026
                  </span>
                </div>

                <form onSubmit={handleInspectionSubmit} className="space-y-5 text-xs">
                  {/* Structured Field Verification Checklist */}
                  <div className="space-y-2">
                    <label className="block font-bold text-govNavy uppercase text-[11px] tracking-wider">FIELD VERIFICATION CHECKLIST</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-govBg p-3 rounded border border-govBorder">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={checklist.identity} onChange={e => setChecklist({...checklist, identity: e.target.checked})} className="rounded text-primaryBlue" />
                        <span className="font-semibold text-textPrimary text-[11px]">Project Identity Verified</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={checklist.location} onChange={e => setChecklist({...checklist, location: e.target.checked})} className="rounded text-primaryBlue" />
                        <span className="font-semibold text-textPrimary text-[11px]">Registered Site Location Verified</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={checklist.physicalExistence} onChange={e => setChecklist({...checklist, physicalExistence: e.target.checked})} className="rounded text-primaryBlue" />
                        <span className="font-semibold text-textPrimary text-[11px]">Physical Construction Exists</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={checklist.sanctionedScope} onChange={e => setChecklist({...checklist, sanctionedScope: e.target.checked})} className="rounded text-primaryBlue" />
                        <span className="font-semibold text-textPrimary text-[11px]">Work Matches Sanctioned Scope</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={checklist.siteSignage} onChange={e => setChecklist({...checklist, siteSignage: e.target.checked})} className="rounded text-primaryBlue" />
                        <span className="font-semibold text-textPrimary text-[11px]">Official MPLADS Signage Displayed</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={checklist.qualityCondition} onChange={e => setChecklist({...checklist, qualityCondition: e.target.checked})} className="rounded text-primaryBlue" />
                        <span className="font-semibold text-textPrimary text-[11px]">Visible Work Quality Satisfactory</span>
                      </label>
                    </div>
                  </div>

                  {/* Observed Progress & Findings Outcome */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-textPrimary mb-1">
                        Observed Physical Progress (%) *
                        <span className="text-textSecondary text-[10px] font-normal block">Reported: {activeProject?.physicalProgress}%</span>
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={observedProgress} 
                        onChange={(e) => setObservedProgress(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-govBorder rounded text-xs font-extrabold text-govNavy focus:outline-none focus:border-primaryBlue" 
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-textPrimary mb-1">
                        Verification Outcome Finding *
                        <span className="text-textSecondary text-[10px] font-normal block">Neutral governance evaluation</span>
                      </label>
                      <select 
                        value={verificationOutcome} 
                        onChange={(e) => setVerificationOutcome(e.target.value)}
                        className="w-full p-2 bg-white border border-govBorder rounded text-xs font-semibold text-govNavy focus:outline-none focus:border-primaryBlue"
                      >
                        <option value="VERIFIED">VERIFIED (Progress & Site Confirmed)</option>
                        <option value="VERIFIED_WITH_OBSERVATIONS">VERIFIED WITH OBSERVATIONS (Minor Variance)</option>
                        <option value="REQUIRES_CLARIFICATION">REQUIRES CLARIFICATION (Progress Discrepancy)</option>
                        <option value="REQUIRES_FURTHER_EVIDENCE">REQUIRES FURTHER EVIDENCE (Request Records)</option>
                        <option value="UNABLE_TO_VERIFY">UNABLE TO VERIFY (Site Access / Land Clearance)</option>
                      </select>
                    </div>
                  </div>

                  {/* Geolocation Verification Simulator */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">GPS LOCATION VERIFICATION</span>
                      <p className="text-[11px] text-blue-900 font-mono">
                        Registered: {activeProject?.latitude || 18.5204}, {activeProject?.longitude || 73.8567} | Inspector GPS: 18.5210, 73.8572 (Distance: 92m)
                      </p>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input type="checkbox" checked={isLocationVerified} onChange={e => setIsLocationVerified(e.target.checked)} className="rounded text-primaryBlue" />
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Location Consistent</span>
                    </label>
                  </div>

                  {/* Photo / Evidence Upload */}
                  <div>
                    <label className="block font-bold text-textPrimary mb-1">On-Site Evidence Photograph / Document *</label>
                    <div className="flex flex-col md:flex-row gap-3">
                      <select 
                        value={evidenceType}
                        onChange={e => setEvidenceType(e.target.value)}
                        className="p-2 bg-white border border-govBorder rounded text-xs font-semibold text-govNavy"
                      >
                        <option value="Progress Photograph">Progress Photograph</option>
                        <option value="Site Signage Photo">Site Signage Photo</option>
                        <option value="Technical Measurement Sheet">Technical Measurement Sheet</option>
                        <option value="Asset Verification Photo">Asset Verification Photo</option>
                      </select>

                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={e => setEvidenceFile(e.target.files?.[0] || null)}
                        className="p-1 bg-white border border-govBorder rounded text-xs file:bg-govBg file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-bold text-textSecondary"
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block font-bold text-textPrimary mb-1">Field Observation Remarks & Site Conditions *</label>
                    <textarea 
                      rows={3}
                      value={fieldRemarks}
                      onChange={(e) => setFieldRemarks(e.target.value)}
                      className="w-full p-2.5 bg-white border border-govBorder rounded text-xs text-govNavy focus:outline-none focus:border-primaryBlue"
                      placeholder="Enter detailed officer observations regarding site progress, material quality, and findings..."
                      required
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => handleTabChange('queue')}
                      className="px-4 py-2 bg-govBg hover:bg-slate-200 border border-govBorder text-govNavy font-bold text-xs rounded transition-colors"
                    >
                      Back to Queue
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-govNavy hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded flex items-center gap-2 disabled:opacity-50 transition-colors shadow-xs"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin text-primaryBlue" /> : <Send className="w-4 h-4" />}
                      <span>Submit Inspection Report to District Authority</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 4: PROJECT MAP TAB */}
      {/* ---------------------------------------------------- */}
      {currentTab === 'map' && (
        <div className="gov-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-govBorder">
            <div>
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primaryBlue" />
                FIELD VERIFICATION GEOSPATIAL MAP
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Geospatial distribution of assigned projects categorized by verification priority markers across constituency.
              </p>
            </div>
          </div>
          <ProjectMap projects={projects} />
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 5: EVIDENCE REVIEW TAB */}
      {/* ---------------------------------------------------- */}
      {currentTab === 'evidence' && (
        <div className="gov-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-govBorder">
            <div>
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                EVIDENCE REVIEW LEDGER
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Inspect submitted agency site photographs, geotagged evidence, and compare against field verification findings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-govBorder rounded-lg space-y-3">
              <span className="text-xs font-bold text-govNavy uppercase tracking-wide block">AGENCY SUBMITTED EVIDENCE PHOTO</span>
              <div className="aspect-video bg-slate-100 rounded flex items-center justify-center border border-slate-200 text-slate-400 text-xs font-semibold">
                [ Site Progress Photograph — Stage Foundation ]
              </div>
              <div className="text-xs space-y-1">
                <div>Uploaded by: <strong>Public Works Department (PWD)</strong></div>
                <div>Submitted: <strong>2026-09-15</strong></div>
                <div>GPS Status: <strong className="text-emerald-700">Verified (18.5204, 73.8567)</strong></div>
              </div>
            </div>

            <div className="p-4 bg-white border border-govBorder rounded-lg space-y-3">
              <span className="text-xs font-bold text-govNavy uppercase tracking-wide block">OFFICER FIELD VERIFICATION COMPARISON</span>
              <div className="aspect-video bg-blue-50/50 rounded flex items-center justify-center border border-blue-200 text-blue-800 text-xs font-semibold">
                [ Monitoring Officer On-Site Inspection Photo ]
              </div>
              <div className="text-xs space-y-1">
                <div>Inspected by: <strong>Monitoring Officer (Field Unit)</strong></div>
                <div>Observed Progress: <strong>45% (Foundation Completed)</strong></div>
                <div>Finding: <strong className="text-emerald-700">Verified with Observations</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 6: INSPECTION REPORTS TAB */}
      {/* ---------------------------------------------------- */}
      {currentTab === 'reports' && (
        <div className="gov-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-govBorder">
            <div>
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <FileText className="w-5 h-5 text-primaryBlue" />
                GENERATED FIELD INSPECTION REPORTS
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Formal inspection reports submitted to District Authority with cryptographic provenance hashes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px]">
                  <th className="p-3">Report Code</th>
                  <th className="p-3">Project Code / Title</th>
                  <th className="p-3">Inspection Date</th>
                  <th className="p-3">Observed Progress</th>
                  <th className="p-3">Outcome Finding</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govBorder">
                <tr className="hover:bg-govBg/50">
                  <td className="p-3 font-mono font-bold text-primaryBlue">INSP-0001-01</td>
                  <td className="p-3 font-bold text-govNavy">MPLADS-DEMO-0001 — Traffic Safety Improvement</td>
                  <td className="p-3 text-textSecondary">2026-09-20</td>
                  <td className="p-3 font-bold text-emerald-700">100%</td>
                  <td className="p-3 font-semibold text-govNavy">VERIFIED</td>
                  <td className="p-3"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Submitted to DA</span></td>
                  <td className="p-3 text-right"><button className="text-primaryBlue hover:underline font-bold">View Report</button></td>
                </tr>
                <tr className="hover:bg-govBg/50">
                  <td className="p-3 font-mono font-bold text-primaryBlue">INSP-0006-01</td>
                  <td className="p-3 font-bold text-govNavy">MPLADS-DEMO-0006 — Public Sanitation Block</td>
                  <td className="p-3 text-textSecondary">2026-09-24</td>
                  <td className="p-3 font-bold text-amber-700">45%</td>
                  <td className="p-3 font-semibold text-govNavy">VERIFIED WITH OBSERVATIONS</td>
                  <td className="p-3"><span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">DA Review Pending</span></td>
                  <td className="p-3 text-right"><button className="text-primaryBlue hover:underline font-bold">View Report</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 7: DA CLARIFICATION RESPONSES TAB */}
      {/* ---------------------------------------------------- */}
      {currentTab === 'responses' && (
        <div className="gov-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-govBorder">
            <div>
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                DISTRICT AUTHORITY CLARIFICATION RESPONSES
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Clarification queries raised by the District Collector / District Authority regarding field verification reports.
              </p>
            </div>
          </div>

          <form onSubmit={handleQueryResponseSubmit} className="p-4 bg-white border border-govBorder rounded-lg space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-govBorder pb-2">
              <span className="font-bold text-govNavy text-sm">Query #Q-MO-2026-001 — MPLADS-DEMO-0004</span>
              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Response Requested</span>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded text-amber-900">
              <strong>District Authority Request:</strong> "Please clarify if physical construction of the foundation for Civic Amenities Centre meets structural drawing specifications."
            </div>

            <div>
              <label className="block font-bold text-govNavy mb-1">Monitoring Officer Field Clarification Response *</label>
              <textarea 
                rows={3}
                value={queryResponseText}
                onChange={e => setQueryResponseText(e.target.value)}
                className="w-full p-2.5 bg-white border border-govBorder rounded text-xs text-govNavy focus:outline-none focus:border-primaryBlue"
                placeholder="Enter field observation clarification for District Authority..."
                required
              />
            </div>

            <div className="text-right">
              <button 
                type="submit" 
                disabled={responseSubmitting}
                className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 ml-auto shadow-xs"
              >
                {responseSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Submit Clarification to District Collector</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 8: NOTIFICATIONS TAB */}
      {/* ---------------------------------------------------- */}
      {currentTab === 'notifications' && (
        <div className="gov-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-govBorder">
            <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
              <Bell className="w-5 h-5 text-primaryBlue" />
              MONITORING OFFICER NOTIFICATIONS ({notifications.length})
            </h3>
          </div>

          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className={`p-3 rounded border text-xs flex items-center justify-between ${
                !n.read ? 'bg-blue-50/60 border-blue-200' : 'bg-govBg border-govBorder'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                      n.priority === 'HIGH' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {n.priority}
                    </span>
                    <span className="font-bold text-govNavy">{n.title}</span>
                  </div>
                  <p className="text-[11px] text-textSecondary">Project: {n.project}</p>
                </div>
                <span className="text-[10px] text-textSecondary font-medium">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 9: SETTINGS TAB */}
      {/* ---------------------------------------------------- */}
      {currentTab === 'settings' && (
        <div className="gov-card p-5 space-y-4 text-xs">
          <h3 className="text-base font-bold text-govNavy flex items-center gap-2 pb-3 border-b border-govBorder">
            <Settings className="w-5 h-5 text-govNavy" />
            OFFICER PROFILE & JURISDICTION PREFERENCES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-textSecondary mb-1 font-semibold">Designated Officer Name</label>
              <input type="text" readOnly value="Shri S. R. Patil (Superintending Engineer / Field Monitoring Officer)" className="w-full p-2 bg-govBg border border-govBorder rounded font-bold text-govNavy" />
            </div>
            <div>
              <label className="block text-textSecondary mb-1 font-semibold">Assigned Jurisdiction District</label>
              <input type="text" readOnly value="Pune District (District ID: D001)" className="w-full p-2 bg-govBg border border-govBorder rounded font-bold text-govNavy" />
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-govBorder max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-govBorder pb-3">
              <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
                <FileText className="w-4 h-4 text-primaryBlue" />
                {viewingDocument.title}
              </h3>
              <button onClick={() => setViewingDocument(null)} className="text-textSecondary hover:text-govNavy font-bold">✕</button>
            </div>
            <div className="p-4 bg-govBg border border-govBorder rounded text-xs space-y-2">
              <div>Document Code: <strong className="font-mono text-primaryBlue">{viewingDocument.code}</strong></div>
              <div>Status: <strong>{viewingDocument.status}</strong></div>
              <div className="p-3 bg-white border border-govBorder rounded text-center text-textSecondary font-semibold">
                [ Verified Official Document Stream Preview ]
              </div>
            </div>
            <div className="text-right">
              <button onClick={() => setViewingDocument(null)} className="px-4 py-1.5 bg-govNavy text-white font-bold text-xs rounded">Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MonitoringOfficerDashboard() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="py-12 flex justify-center items-center text-xs text-textSecondary gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" />
          <span>Loading Monitoring Officer Workspace...</span>
        </div>
      }>
        <MonitoringOfficerDashboardContent />
      </Suspense>
    </AppShell>
  );
}
