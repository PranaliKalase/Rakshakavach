"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProjectMap } from '@/components/map/ProjectMap';
import { EvidencePassport } from '@/components/evidence/EvidencePassport';
import { 
  fetchProjects, 
  updateProjectProgress, 
  submitProjectEvidence, 
  submitVerificationResponse 
} from '@/lib/api';
import { Project } from '@/types/project';
import { 
  Building2, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Eye, 
  Lock,
  ArrowRight,
  Info,
  X,
  FileCheck,
  AlertCircle,
  BarChart3
} from 'lucide-react';

function ImplementingAgencyDashboardContent() {
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'overview';


  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'progress' | 'evidence' | 'documents' | 'verification' | 'audit' | 'completion'>('overview');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');

  // Form States for Progress & Evidence
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');
  const [updateErrorMsg, setUpdateErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Progress Update Form
  const [physicalProgress, setPhysicalProgress] = useState(50);
  const [financialProgress, setFinancialProgress] = useState(50);
  const [expenditure, setExpenditure] = useState(1000000);
  const [currentWork, setCurrentWork] = useState('');
  const [nextMilestone, setNextMilestone] = useState('');
  const [completionDate, setCompletionDate] = useState('2026-12-31');

  // Evidence Upload Form
  const [evidenceType, setEvidenceType] = useState('Progress Photograph');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  // Verification Query Response Form
  const [verificationQueryId, setVerificationQueryId] = useState('Q-2026-089');
  const [queryResponseText, setQueryResponseText] = useState('');

  // Current IA Profile Context
  const agencyName = "Public Works Department (PWD)";
  const agencyId = "IA011";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch projects scoped to Implementing Agency
        const data = await fetchProjects({ role: 'IMPLEMENTING_AGENCY', agencyId: agencyId });
        setProjects(data);
      } catch (err) {
        console.error("Error loading Implementing Agency projects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = searchTerm === '' || 
        p.workName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || p.status.toUpperCase() === statusFilter.toUpperCase();
      const matchesSector = sectorFilter === 'ALL' || p.sector.toUpperCase() === sectorFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesSector;
    });
  }, [projects, searchTerm, statusFilter, sectorFilter]);

  // Dynamic KPI Calculations from Real Data
  const assignedCount = projects.length;
  const activeCount = projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'ASSIGNED' || p.status === 'SANCTIONED').length;
  const delayedCount = projects.filter(p => p.priority === 'HIGH_PRIORITY' || p.priority === 'ATTENTION' || (p.physicalProgress < 50 && p.financialProgress > 60)).length;
  const evidencePendingCount = projects.filter(p => (p.physicalProgress > 0 && (p.physicalProgress < 100)) || p.priority === 'HIGH_PRIORITY').length;
  const avgCompletionProgress = assignedCount > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.physicalProgress, 0) / assignedCount)
    : 0;

  // Open Project Detail Modal
  const openProjectModal = (proj: Project, initialTab: 'overview' | 'progress' | 'evidence' | 'documents' | 'verification' | 'audit' | 'completion' = 'overview') => {
    setSelectedProject(proj);
    setActiveModalTab(initialTab);
    setPhysicalProgress(proj.physicalProgress || 0);
    setFinancialProgress(proj.financialProgress || 0);
    setExpenditure(proj.actualExpenditure || 0);
    setCurrentWork(`Executing ongoing physical construction for ${proj.workName}`);
    setNextMilestone('Phase completion and site quality inspection');
    setUpdateSuccessMsg('');
    setUpdateErrorMsg('');
  };

  // Submit Physical Progress Update
  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setIsSubmitting(true);
      setUpdateErrorMsg('');
      setUpdateSuccessMsg('');

      await updateProjectProgress(selectedProject.id, {
        physical_progress: physicalProgress,
        financial_progress: financialProgress,
        actual_expenditure: expenditure,
        milestone: nextMilestone,
        remarks: currentWork
      });

      // Update local state
      setProjects(prev => prev.map(p => {
        if (p.id === selectedProject.id) {
          return {
            ...p,
            physicalProgress: physicalProgress,
            financialProgress: financialProgress,
            actualExpenditure: expenditure,
            status: physicalProgress >= 100 ? 'COMPLETED' : 'IN_PROGRESS'
          };
        }
        return p;
      }));

      setSelectedProject(prev => prev ? {
        ...prev,
        physicalProgress: physicalProgress,
        financialProgress: financialProgress,
        actualExpenditure: expenditure,
        status: physicalProgress >= 100 ? 'COMPLETED' : 'IN_PROGRESS'
      } : null);

      setUpdateSuccessMsg('Physical progress updated & logged with cryptographic audit trail.');
    } catch (err: any) {
      setUpdateErrorMsg(err.message || 'Failed to submit progress update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Evidence Upload
  const handleEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setIsSubmitting(true);
      setUpdateErrorMsg('');
      setUpdateSuccessMsg('');

      const res = await submitProjectEvidence(selectedProject.id, {
        file_name: evidenceFile ? evidenceFile.name : `${selectedProject.projectCode}_site_photo.jpg`,
        evidence_type: evidenceType,
        description: evidenceDesc || `Verified ${evidenceType} photograph for ${selectedProject.workName}`,
        uploaded_by: `${agencyName} Official`
      });

      setUpdateSuccessMsg(`Evidence item ${res.evidence.evidence_id} registered with SHA-256 Hash: ${res.evidence.hash.slice(0, 16)}...`);
      setEvidenceDesc('');
      setEvidenceFile(null);
    } catch (err: any) {
      setUpdateErrorMsg(err.message || 'Failed to submit evidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Verification Response
  const handleQueryResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !queryResponseText.trim()) return;

    try {
      setIsSubmitting(true);
      setUpdateErrorMsg('');
      setUpdateSuccessMsg('');

      await submitVerificationResponse(selectedProject.id, {
        query_id: verificationQueryId,
        response_text: queryResponseText,
        submitted_by: `${agencyName} Field Engineer`
      });

      setUpdateSuccessMsg('Verification response submitted successfully to Monitoring Officer & District Authority.');
      setQueryResponseText('');
    } catch (err: any) {
      setUpdateErrorMsg(err.message || 'Failed to submit verification response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Workspace Header Banner */}
        <div className="bg-white border border-govBorder rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-primaryBlue text-[11px] font-extrabold px-2.5 py-0.5 rounded border border-blue-200 uppercase tracking-wide">
                EXECUTION WORKSPACE
              </span>
              <span className="text-xs text-textSecondary font-semibold">• Agency ID: {agencyId}</span>
            </div>
            <h1 className="text-xl font-black text-govNavy tracking-tight">
              Implementing Agency Portal — {agencyName}
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Assigned work execution, physical progress reporting, site evidence upload, and verification response management.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-govBg px-3 py-2 rounded border border-govBorder text-right">
              <span className="text-[10px] text-textSecondary uppercase font-bold block">Financial Year</span>
              <span className="text-xs font-bold text-govNavy">FY 2025 – 2026</span>
            </div>
            <button 
              onClick={() => {
                if (projects.length > 0) openProjectModal(projects[0], 'progress');
              }}
              className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-4 py-2.5 rounded flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Update Progress</span>
            </button>
          </div>
        </div>

        {/* Top Execution KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPICard 
            title="Assigned Projects" 
            value={loading ? "..." : assignedCount.toString()} 
            subtitle="Agency Jurisdiction" 
            icon={<Building2 className="w-5 h-5 text-primaryBlue" />} 
          />
          <KPICard 
            title="Active Projects" 
            value={loading ? "..." : activeCount.toString()} 
            subtitle="Under Execution" 
            icon={<RefreshCw className="w-5 h-5 text-amber-500" />} 
          />
          <KPICard 
            title="Delayed Projects" 
            value={loading ? "..." : delayedCount.toString()} 
            subtitle="Requires Priority" 
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />} 
          />
          <KPICard 
            title="Evidence Pending" 
            value={loading ? "..." : evidencePendingCount.toString()} 
            subtitle="Photos / Documents" 
            icon={<Upload className="w-5 h-5 text-blue-600" />} 
          />
          <KPICard 
            title="Completion Progress" 
            value={loading ? "..." : `${avgCompletionProgress}%`} 
            subtitle="Avg Physical Progress" 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} 
          />
        </div>

        {/* Action Required Section */}
        <div className="gov-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between pb-3 border-b border-govBorder mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide">ACTION REQUIRED</h3>
                <p className="text-[11px] text-textSecondary">High-priority compliance, evidence uploads, and verification responses requiring your attention.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
              {projects.length > 0 ? "4 Active Actions" : "No Action Pending"}
            </span>
          </div>

          {loading ? (
            <div className="py-6 flex justify-center text-xs text-textSecondary gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primaryBlue" />
              <span>Loading action required queue...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-6 text-center text-xs text-textSecondary">
              No pending actions required for assigned projects.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Action 1: Evidence Submission */}
              <div className="p-3 bg-red-50/60 border border-red-200 rounded flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">HIGH</span>
                    <span className="text-xs font-bold text-govNavy">Evidence Submission Pending</span>
                  </div>
                  <p className="text-[11px] font-semibold text-textPrimary">{projects[0]?.projectCode} — {projects[0]?.workName}</p>
                  <p className="text-[10px] text-textSecondary">Milestone completed without mandatory geo-tagged progress photo.</p>
                </div>
                <button 
                  onClick={() => openProjectModal(projects[0], 'evidence')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] px-3 py-1.5 rounded shrink-0 transition-colors shadow-xs"
                >
                  Upload Evidence
                </button>
              </div>

              {/* Action 2: Verification Query */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">HIGH</span>
                    <span className="text-xs font-bold text-govNavy">Verification Query Requires Response</span>
                  </div>
                  <p className="text-[11px] font-semibold text-textPrimary">{projects[1]?.projectCode || projects[0]?.projectCode} — {projects[1]?.workName || projects[0]?.workName}</p>
                  <p className="text-[10px] text-textSecondary">Monitoring Officer requested clarification regarding site physical progress.</p>
                </div>
                <button 
                  onClick={() => openProjectModal(projects[1] || projects[0], 'verification')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] px-3 py-1.5 rounded shrink-0 transition-colors shadow-xs"
                >
                  Respond Query
                </button>
              </div>

              {/* Action 3: Progress Update Due */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">MEDIUM</span>
                    <span className="text-xs font-bold text-govNavy">Fortnightly Progress Update Due</span>
                  </div>
                  <p className="text-[11px] font-semibold text-textPrimary">{projects[2]?.projectCode || projects[0]?.projectCode} — {projects[2]?.workName || projects[0]?.workName}</p>
                  <p className="text-[10px] text-textSecondary">Scheduled progress percentage reporting window is open.</p>
                </div>
                <button 
                  onClick={() => openProjectModal(projects[2] || projects[0], 'progress')}
                  className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-[11px] px-3 py-1.5 rounded shrink-0 transition-colors shadow-xs"
                >
                  Update Progress
                </button>
              </div>

              {/* Action 4: Document Correction */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">MEDIUM</span>
                    <span className="text-xs font-bold text-govNavy">Measurement Sheet Document Required</span>
                  </div>
                  <p className="text-[11px] font-semibold text-textPrimary">{projects[3]?.projectCode || projects[0]?.projectCode} — {projects[3]?.workName || projects[0]?.workName}</p>
                  <p className="text-[10px] text-textSecondary">District Authority checklist requires technical measurement sheet upload.</p>
                </div>
                <button 
                  onClick={() => openProjectModal(projects[3] || projects[0], 'documents')}
                  className="bg-govNavy hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded shrink-0 transition-colors shadow-xs"
                >
                  Review Checklist
                </button>
              </div>
            </div>
          )}
        </div>

        {/* My Project Map */}
        <div id="project-map">
          <ProjectMap projects={projects} />
        </div>

        {/* My Projects Table & Filter Section */}
        <div id="my-projects" className="gov-card p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-govBorder mb-4">
            <div>
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primaryBlue" />
                MY ASSIGNED PROJECTS ({filteredProjects.length})
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Full list of works assigned to {agencyName}. Click "Open Workspace" to report progress, manage evidence, or respond to verifications.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-textSecondary absolute left-2.5 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search work code or title..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-govBg border border-govBorder rounded text-xs font-medium text-govNavy w-48 focus:outline-none focus:border-primaryBlue"
                />
              </div>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-govBg border border-govBorder rounded text-xs font-semibold text-govNavy focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="SANCTIONED">Sanctioned</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select 
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-govBg border border-govBorder rounded text-xs font-semibold text-govNavy focus:outline-none"
              >
                <option value="ALL">All Sectors</option>
                <option value="ROADS">Roads & Transport</option>
                <option value="EDUCATION">Education</option>
                <option value="WATER">Drinking Water</option>
                <option value="HEALTH">Healthcare</option>
                <option value="COMMUNITY">Community Infra</option>
              </select>
            </div>
          </div>

          {/* Projects Table */}
          {loading ? (
            <div className="py-12 flex justify-center items-center text-xs text-textSecondary gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" />
              <span>Loading assigned works database...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-xs text-textSecondary space-y-1">
              <p className="font-semibold text-govNavy">No matching projects found.</p>
              <p>Try clearing filters or checking agency assignment permissions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3">Project Code</th>
                    <th className="p-3">Work Name / Sector</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Physical Progress</th>
                    <th className="p-3">Financial Expenditure</th>
                    <th className="p-3">Evidence Health</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govBorder">
                  {filteredProjects.map((p) => {
                    const phys = p.physicalProgress || 0;
                    const fin = p.financialProgress || 0;
                    const isVariance = Math.abs(phys - fin) > 20;

                    return (
                      <tr key={p.id} className="hover:bg-govBg/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-primaryBlue">
                          {p.projectCode}
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-govNavy max-w-xs truncate">{p.workName}</p>
                          <p className="text-[10px] text-textSecondary">{p.sector} • District: {p.districtName || p.districtId}</p>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="p-3">
                          <div className="w-32">
                            <div className="flex justify-between text-[10px] font-bold mb-0.5">
                              <span>{phys}%</span>
                              {isVariance && <span className="text-amber-600 font-semibold" title="Progress variance detected">⚠ Variance</span>}
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${phys >= 100 ? 'bg-emerald-600' : phys < 30 ? 'bg-amber-500' : 'bg-primaryBlue'}`}
                                style={{ width: `${Math.min(100, Math.max(0, phys))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-govNavy">₹{(p.actualExpenditure / 100000).toFixed(2)} L</p>
                          <p className="text-[10px] text-textSecondary">Fin: {fin}% of Sanctioned</p>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            {p.evidenceCount || 8} / 10 Verified
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => openProjectModal(p, 'overview')}
                            className="bg-govBg hover:bg-primaryBlue hover:text-white text-govNavy border border-govBorder font-bold text-[11px] px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <span>Open Workspace</span>
                            <ArrowRight className="w-3 h-3" />
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

        {/* PROJECT WORKSPACE MODAL / DRAWER */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg border border-govBorder shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
              
              {/* Modal Header */}
              <div className="bg-govNavy text-white p-4 flex items-center justify-between border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      {selectedProject.projectCode}
                    </span>
                    <span className="text-xs text-blue-200 font-semibold">• {selectedProject.sector}</span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1 leading-tight">
                    {selectedProject.workName}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Visual Project Lifecycle Tracker */}
              <div className="bg-slate-900 text-white p-3 border-b border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-2 text-center">
                  PROJECT LIFECYCLE TRACKER
                </p>
                <div className="flex items-center justify-between max-w-2xl mx-auto text-[11px]">
                  {/* Step 1: Recommendation */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">✓</div>
                    <span className="text-[10px] text-emerald-300 font-semibold">Recommended</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-emerald-600 mx-1" />

                  {/* Step 2: Sanction */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">✓</div>
                    <span className="text-[10px] text-emerald-300 font-semibold">Sanctioned</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-emerald-600 mx-1" />

                  {/* Step 3: Assigned */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">✓</div>
                    <span className="text-[10px] text-emerald-300 font-semibold">Assigned</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-blue-500 mx-1" />

                  {/* Step 4: Execution */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-blue-600/30">●</div>
                    <span className="text-[10px] text-blue-300 font-bold">Execution</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-white/20 mx-1" />

                  {/* Step 5: Evidence */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-gray-400 flex items-center justify-center font-bold text-xs">○</div>
                    <span className="text-[10px] text-gray-400">Evidence</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-white/20 mx-1" />

                  {/* Step 6: Verification */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-gray-400 flex items-center justify-center font-bold text-xs">○</div>
                    <span className="text-[10px] text-gray-400">Verification</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-white/20 mx-1" />

                  {/* Step 7: Completion */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-gray-400 flex items-center justify-center font-bold text-xs">○</div>
                    <span className="text-[10px] text-gray-400">Completion</span>
                  </div>
                </div>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="flex border-b border-govBorder bg-govBg px-4 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'progress', label: 'Progress Update', icon: BarChart3 },
                  { id: 'evidence', label: 'Evidence Upload', icon: Upload },
                  { id: 'documents', label: 'Document Checklist', icon: FileText },
                  { id: 'verification', label: 'Verification Query', icon: MessageSquare },
                  { id: 'audit', label: 'Audit History', icon: FileCheck },
                  { id: 'completion', label: 'Completion Workflow', icon: CheckCircle2 },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeModalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveModalTab(tab.id as any)}
                      className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
                        isActive 
                          ? 'border-primaryBlue text-primaryBlue bg-white' 
                          : 'border-transparent text-textSecondary hover:text-govNavy'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Modal Content Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                
                {/* Status Banners */}
                {updateSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{updateSuccessMsg}</span>
                  </div>
                )}
                {updateErrorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{updateErrorMsg}</span>
                  </div>
                )}

                {/* TAB 1: OVERVIEW */}
                {activeModalTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-govBg p-4 rounded border border-govBorder text-xs">
                      <div>
                        <span className="text-textSecondary block text-[10px] font-bold uppercase">Estimated Cost</span>
                        <span className="font-bold text-govNavy text-sm">₹{(selectedProject.estimatedCost / 100000).toFixed(2)} Lakh</span>
                      </div>
                      <div>
                        <span className="text-textSecondary block text-[10px] font-bold uppercase">Sanctioned Cost</span>
                        <span className="font-bold text-govNavy text-sm">₹{((selectedProject.sanctionedCost || 0) / 100000).toFixed(2)} Lakh</span>
                      </div>
                      <div>
                        <span className="text-textSecondary block text-[10px] font-bold uppercase">Recorded Expenditure</span>
                        <span className="font-bold text-primaryBlue text-sm">₹{(selectedProject.actualExpenditure / 100000).toFixed(2)} Lakh</span>
                      </div>
                      <div>
                        <span className="text-textSecondary block text-[10px] font-bold uppercase">Physical Progress</span>
                        <span className="font-bold text-emerald-600 text-sm">{selectedProject.physicalProgress}%</span>
                      </div>
                    </div>

                    {/* Progress Alignment Widget */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-govNavy">Physical vs Financial Progress Alignment</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          Math.abs(selectedProject.physicalProgress - selectedProject.financialProgress) > 20
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {Math.abs(selectedProject.physicalProgress - selectedProject.financialProgress) > 20
                            ? 'Progress Variance Requires Review'
                            : 'Progress Aligned'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold mb-1">
                            <span>Physical Progress</span>
                            <span className="font-bold text-emerald-700">{selectedProject.physicalProgress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${selectedProject.physicalProgress}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold mb-1">
                            <span>Financial Progress</span>
                            <span className="font-bold text-primaryBlue">{selectedProject.financialProgress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primaryBlue rounded-full" style={{ width: `${selectedProject.financialProgress}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-govNavy">Description</span>
                      <p className="text-textSecondary bg-govBg p-3 rounded border border-govBorder">
                        {selectedProject.description || "Official MPLADS public infrastructure project under execution by Public Works Department."}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: PROGRESS UPDATE */}
                {activeModalTab === 'progress' && (
                  <form onSubmit={handleProgressSubmit} className="space-y-4 text-xs">
                    <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded">
                      <p className="font-bold">Execution Progress Update Form</p>
                      <p className="text-[11px]">Submit updated physical completion percentage, work highlights, and financial expenditure.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-govNavy mb-1">Physical Progress (%) *</label>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={physicalProgress}
                          onChange={(e) => setPhysicalProgress(Number(e.target.value))}
                          className="w-full p-2 bg-govBg border border-govBorder rounded font-bold text-govNavy"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-govNavy mb-1">Financial Progress (%) *</label>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={financialProgress}
                          onChange={(e) => setFinancialProgress(Number(e.target.value))}
                          className="w-full p-2 bg-govBg border border-govBorder rounded font-bold text-govNavy"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block font-bold text-govNavy mb-1">Actual Expenditure (INR) *</label>
                        <input 
                          type="number"
                          value={expenditure}
                          onChange={(e) => setExpenditure(Number(e.target.value))}
                          className="w-full p-2 bg-govBg border border-govBorder rounded font-bold text-govNavy"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block font-bold text-govNavy mb-1">Current Work Executed *</label>
                        <textarea 
                          rows={2}
                          value={currentWork}
                          onChange={(e) => setCurrentWork(e.target.value)}
                          placeholder="Describe exact physical work completed during this period..."
                          className="w-full p-2 bg-govBg border border-govBorder rounded text-xs text-govNavy"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-govNavy mb-1">Next Target Milestone</label>
                        <input 
                          type="text"
                          value={nextMilestone}
                          onChange={(e) => setNextMilestone(e.target.value)}
                          placeholder="e.g., Structural slab casting"
                          className="w-full p-2 bg-govBg border border-govBorder rounded text-xs text-govNavy"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-govNavy mb-1">Expected Completion Date</label>
                        <input 
                          type="date"
                          value={completionDate}
                          onChange={(e) => setCompletionDate(e.target.value)}
                          className="w-full p-2 bg-govBg border border-govBorder rounded text-xs font-semibold text-govNavy"
                        />
                      </div>
                    </div>

                    <div className="text-right pt-2 border-t border-govBorder">
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-5 py-2.5 rounded disabled:opacity-50"
                      >
                        {isSubmitting ? 'Committing Progress...' : 'Commit Physical Progress Update'}
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 3: EVIDENCE UPLOAD & PASSPORT */}
                {activeModalTab === 'evidence' && (
                  <div className="space-y-5 text-xs">
                    {/* Upload Form */}
                    <form onSubmit={handleEvidenceSubmit} className="p-4 bg-govBg border border-govBorder rounded space-y-3">
                      <h4 className="font-bold text-govNavy text-xs uppercase tracking-wide">Upload Verified Site Evidence</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-textPrimary mb-1">Evidence Type *</label>
                          <select 
                            value={evidenceType}
                            onChange={(e) => setEvidenceType(e.target.value)}
                            className="w-full p-2 bg-white border border-govBorder rounded text-xs font-semibold text-govNavy"
                          >
                            <option value="Progress Photograph">Progress Photograph</option>
                            <option value="Completion Photograph">Completion Photograph</option>
                            <option value="Quality Inspection Certificate">Quality Inspection Certificate</option>
                            <option value="Material Test Measurement">Material Test Measurement</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-textPrimary mb-1">Site GPS Location</label>
                          <input 
                            type="text"
                            readOnly
                            value={`GPS Verified (${selectedProject.latitude || 21.3554}° N, ${selectedProject.longitude || 72.7368}° E)`}
                            className="w-full p-2 bg-slate-100 border border-govBorder rounded text-xs font-mono text-slate-700"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block font-semibold text-textPrimary mb-1">Evidence Description</label>
                          <input 
                            type="text"
                            value={evidenceDesc}
                            onChange={(e) => setEvidenceDesc(e.target.value)}
                            placeholder="Add brief description of physical milestone depicted..."
                            className="w-full p-2 bg-white border border-govBorder rounded text-xs"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block font-semibold text-textPrimary mb-1">Attach Image File (JPEG/PNG)</label>
                          <div className="p-4 border-2 border-dashed border-govBorder rounded text-center bg-white hover:border-primaryBlue transition-colors cursor-pointer">
                            <Upload className="w-5 h-5 text-textSecondary mx-auto mb-1" />
                            <span className="text-xs font-semibold text-govNavy block">
                              {evidenceFile ? evidenceFile.name : "Click to select site progress photograph"}
                            </span>
                            <span className="text-[10px] text-textSecondary mt-0.5 block">
                              Cryptographic SHA-256 hash will be calculated automatically upon registration.
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded shadow-xs"
                        >
                          {isSubmitting ? 'Hashing & Uploading...' : 'Register Site Evidence Passport'}
                        </button>
                      </div>
                    </form>

                    {/* Existing Evidence Passport Cards */}
                    <div>
                      <h4 className="font-bold text-govNavy mb-2 text-xs uppercase tracking-wide">Registered Evidence Passport Records</h4>
                      <EvidencePassport 
                        evidenceId={`EV-2026-${selectedProject.projectCode}`}
                        uploadedBy={`${agencyName}`}
                        timestamp="2026-09-24 11:30 System Time"
                        coordinates={`${selectedProject.latitude || 21.3554}° N, ${selectedProject.longitude || 72.7368}° E`}
                        hash="a7f8e910b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9"
                        integrityVerified={true}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: DOCUMENT CHECKLIST */}
                {activeModalTab === 'documents' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                      <div>
                        <p className="font-bold text-govNavy">Mandatory Compliance Document Checklist</p>
                        <p className="text-[11px] text-textSecondary">Ensure technical and administrative documents are attached.</p>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200">
                        4 / 6 Verified
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { title: 'Sanction Order Document', status: 'AVAILABLE', code: 'DOC-SANCTION-01' },
                        { title: 'Work Order & Agency Contract', status: 'AVAILABLE', code: 'DOC-WORKORDER-02' },
                        { title: 'Technical Estimate & Drawings', status: 'AVAILABLE', code: 'DOC-ESTIMATE-03' },
                        { title: 'Fortnightly Progress Report', status: 'AVAILABLE', code: 'DOC-PROGRESS-04' },
                        { title: 'Technical Measurement Sheet', status: 'PENDING', code: 'DOC-MEASURE-05' },
                        { title: 'Final Completion Certificate', status: 'REQUIRED', code: 'DOC-COMPLETION-06' },
                      ].map((doc, idx) => (
                        <div key={idx} className="p-3 bg-govBg border border-govBorder rounded flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-primaryBlue" />
                            <div>
                              <p className="font-bold text-govNavy">{doc.title}</p>
                              <p className="text-[10px] text-textSecondary font-mono">{doc.code}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              doc.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              doc.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {doc.status}
                            </span>
                            <button className="bg-white hover:bg-slate-100 text-govNavy border border-govBorder text-[10px] font-bold px-2.5 py-1 rounded">
                              {doc.status === 'AVAILABLE' ? 'View Document' : 'Upload File'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: VERIFICATION RESPONSES */}
                {activeModalTab === 'verification' && (
                  <div className="space-y-4 text-xs">
                    {/* Active Verification Signal Box (Neutral Advisory AI Language) */}
                    <div className="p-4 bg-amber-50/80 border border-amber-300 rounded space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="font-extrabold text-amber-900 uppercase tracking-wide">VERIFICATION SIGNAL</span>
                      </div>
                      <p className="text-[11px] text-amber-900 font-medium">
                        The submitted physical progress evidence requires additional verification clarification.
                      </p>
                      <div className="text-[11px] text-amber-800 space-y-0.5 bg-white/60 p-2.5 rounded border border-amber-200">
                        <p>• <strong>Observation:</strong> Physical milestone reported (62%) differs slightly from expected linear timeline.</p>
                        <p>• <strong>Recommended Action:</strong> Provide additional photo evidence or technical justification response.</p>
                      </div>
                    </div>

                    {/* Response Form */}
                    <form onSubmit={handleQueryResponseSubmit} className="p-4 bg-govBg border border-govBorder rounded space-y-3">
                      <h4 className="font-bold text-govNavy uppercase text-xs tracking-wide">Submit Verification Query Response</h4>
                      <div>
                        <label className="block font-semibold text-textPrimary mb-1">Target Query Reference ID</label>
                        <input 
                          type="text"
                          value={verificationQueryId}
                          onChange={(e) => setVerificationQueryId(e.target.value)}
                          className="w-full p-2 bg-white border border-govBorder rounded text-xs font-mono font-bold text-govNavy"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-textPrimary mb-1">IA Response & Clarification Statement *</label>
                        <textarea 
                          rows={3}
                          value={queryResponseText}
                          onChange={(e) => setQueryResponseText(e.target.value)}
                          placeholder="Provide detailed technical clarification regarding site condition..."
                          className="w-full p-2 bg-white border border-govBorder rounded text-xs text-govNavy"
                          required
                        />
                      </div>
                      <div className="text-right">
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-4 py-2 rounded shadow-xs"
                        >
                          {isSubmitting ? 'Submitting Response...' : 'Submit Verification Response'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 6: AUDIT HISTORY */}
                {activeModalTab === 'audit' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                      <div>
                        <p className="font-bold text-govNavy">Immutable Digital Audit Room History</p>
                        <p className="text-[11px] text-textSecondary">Full lifecycle chronological log of recommendations, sanctions, progress commits, and evidence.</p>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-100 text-primaryBlue px-2 py-0.5 rounded border border-blue-200">
                        Read-Only View
                      </span>
                    </div>

                    <div className="space-y-2 border-l-2 border-primaryBlue pl-4 ml-2 py-1">
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <p className="font-bold text-govNavy">Physical Progress Update Committed</p>
                        <p className="text-[11px] text-textSecondary">Physical progress recorded at 62%, Financial expenditure ₹14.50 Lakh.</p>
                        <p className="text-[10px] text-gray-400 font-mono">2026-09-24 10:15:00 UTC • By Public Works Dept</p>
                      </div>

                      <div className="relative pt-2">
                        <span className="absolute -left-[21px] top-3.5 w-2.5 h-2.5 rounded-full bg-primaryBlue" />
                        <p className="font-bold text-govNavy">Site Evidence Passport Registered</p>
                        <p className="text-[11px] text-textSecondary">SHA-256 Hash calculated and logged on platform ledger.</p>
                        <p className="text-[10px] text-gray-400 font-mono">2026-09-20 14:22:10 UTC • By Public Works Dept</p>
                      </div>

                      <div className="relative pt-2">
                        <span className="absolute -left-[21px] top-3.5 w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <p className="font-bold text-govNavy">Agency Allocation Finalized</p>
                        <p className="text-[11px] text-textSecondary">Assigned to Public Works Department (PWD) by District Collectorate.</p>
                        <p className="text-[10px] text-gray-400 font-mono">2026-08-15 09:00:00 UTC • By District Authority</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 7: COMPLETION WORKFLOW */}
                {activeModalTab === 'completion' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Project Completion Submission Workflow
                      </p>
                      <p className="text-[11px]">
                        When physical execution reaches 100%, submit final completion certificate and site handover documentation.
                      </p>
                    </div>

                    <div className="p-4 bg-govBg border border-govBorder rounded space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-govNavy">Current Physical Completion:</span>
                        <span className="font-extrabold text-emerald-700 text-sm">{selectedProject.physicalProgress}%</span>
                      </div>

                      {selectedProject.physicalProgress < 100 ? (
                        <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Completion submission requires 100% physical progress milestone update. Current progress is {selectedProject.physicalProgress}%.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block font-semibold text-textPrimary mb-1">Attach Final Completion Certificate (PDF)</label>
                            <input type="file" className="w-full p-2 bg-white border border-govBorder rounded text-xs" />
                          </div>
                          <div>
                            <label className="block font-semibold text-textPrimary mb-1">Final Handover Remarks</label>
                            <textarea rows={2} className="w-full p-2 bg-white border border-govBorder rounded text-xs" placeholder="Final handover remarks..." />
                          </div>
                          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded shadow-xs">
                            Submit Official Completion Package
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="bg-govBg p-3 border-t border-govBorder flex justify-between items-center text-xs">
                <span className="text-textSecondary font-semibold">
                  Authorized Role: Implementing Agency ({agencyName})
                </span>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="bg-govNavy text-white font-bold px-4 py-1.5 rounded hover:bg-slate-800 transition-colors"
                >
                  Close Workspace
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}

export default function ImplementingAgencyDashboard() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading Implementing Agency Workspace...</span>
      </div>
    }>
      <ImplementingAgencyDashboardContent />
    </Suspense>
  );
}

