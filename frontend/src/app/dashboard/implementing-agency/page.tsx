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
  updateProjectProgress, 
  submitProjectEvidence, 
  submitVerificationResponse,
  submitProjectCompletion
} from '@/lib/api';
import { Project } from '@/types/project';

// ... lucide-react imports ...

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
  BarChart3,
  LayoutDashboard,
  Bell,
  Settings,
  UserCheck,
  Compass,
  Hash,
  Calendar,
  ChevronRight,
  FolderKanban,
  Sparkles,
  Download,
  CheckSquare
} from 'lucide-react';

function ImplementingAgencyDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTabParam = searchParams.get('tab') || 'overview';

  // Main page tab state
  const [currentTab, setCurrentTab] = useState<string>(activeTabParam);

  useEffect(() => {
    if (activeTabParam) {
      setCurrentTab(activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    router.push(`/dashboard/implementing-agency?tab=${tabId}`, { scroll: false });
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'progress' | 'evidence' | 'documents' | 'verification' | 'audit' | 'completion'>('overview');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // Form States for Progress & Evidence
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');
  const [updateErrorMsg, setUpdateErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Target Project for Forms in main page tabs
  const [targetProjectId, setTargetProjectId] = useState<string>('');

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

  // File Input Refs
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const completionFileInputRef = React.useRef<HTMLInputElement>(null);

  // Completion Form State
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [completionFile, setCompletionFile] = useState<File | null>(null);

  // Document Viewer Modal State
  const [viewingDocument, setViewingDocument] = useState<{ id: string; title: string; status: string; code: string; uploadedAt: string } | null>(null);

  // Verification Query Response Form
  const [verificationQueryId, setVerificationQueryId] = useState('Q-2026-089');
  const [queryResponseText, setQueryResponseText] = useState('');


  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 'N1', title: 'Evidence Submission Required', project: 'MPLADS-2026-002456', priority: 'HIGH', time: '2 hours ago', read: false },
    { id: 'N2', title: 'Verification Clarification Query Raised', project: 'MPLADS-2026-001873', priority: 'HIGH', time: '5 hours ago', read: false },
    { id: 'N3', title: 'Fortnightly Progress Update Schedule', project: 'MPLADS-2026-001642', priority: 'MEDIUM', time: '1 day ago', read: true },
    { id: 'N4', title: 'Technical Measurement Sheet Requested', project: 'MPLADS-2026-001231', priority: 'MEDIUM', time: '2 days ago', read: true },
  ]);

  // Documents State
  const [documentsList, setDocumentsList] = useState([
    { id: 'D1', title: 'Sanction Order Document', status: 'AVAILABLE', code: 'DOC-SANCTION-01', uploadedAt: '2026-08-10' },
    { id: 'D2', title: 'Work Order & Agency Contract', status: 'AVAILABLE', code: 'DOC-WORKORDER-02', uploadedAt: '2026-08-15' },
    { id: 'D3', title: 'Technical Estimate & Drawings', status: 'AVAILABLE', code: 'DOC-ESTIMATE-03', uploadedAt: '2026-08-18' },
    { id: 'D4', title: 'Fortnightly Progress Report', status: 'AVAILABLE', code: 'DOC-PROGRESS-04', uploadedAt: '2026-09-10' },
    { id: 'D5', title: 'Technical Measurement Sheet', status: 'PENDING', code: 'DOC-MEASURE-05', uploadedAt: '-' },
    { id: 'D6', title: 'Final Completion Certificate', status: 'REQUIRED', code: 'DOC-COMPLETION-06', uploadedAt: '-' },
  ]);

  // Current IA Profile Context
  const agencyName = "Public Works Department (PWD)";
  const agencyId = "IA011";

  const fallbackProjects: Project[] = useMemo(() => [
    {
      id: "MPLADS-DEMO-0001",
      projectCode: "MPLADS-DEMO-0001",
      workName: "Traffic Safety Improvement & Junction Modernization",
      description: "Installation of high-mast LED lights, signal modernization, and pedestrian safety barriers.",
      allocationId: "ALLOC-DEMO-001",
      mpName: "Hon'ble MP Demo",
      districtId: "D001",
      districtName: "Pune District",
      constituencyId: "C001",
      constituencyName: "Pune Constituency",
      agencyId: "IA011",
      agencyName: "Public Works Department (PWD)",
      sector: "Public Infrastructure",
      estimatedCost: 5000000,
      sanctionedCost: 5000000,
      actualExpenditure: 4600000,
      physicalProgress: 100,
      financialProgress: 92,
      status: "COMPLETED",
      priority: "NORMAL",
      trustScore: 96.5,
      explanation: "Multi-point verified on-site completion certificate.",
      latitude: 18.5204,
      longitude: 73.8567,
      evidenceCount: 12,
      documentCount: 6,
      provenance: "OFFICIAL",
      createdAt: "2025-01-10",
      updatedAt: "2026-02-15"
    },
    {
      id: "MPLADS-DEMO-0002",
      projectCode: "MPLADS-DEMO-0002",
      workName: "Water Supply System at Rural Health Facility",
      description: "Pipeline connectivity, overhead tank construction, and purification unit installation.",
      allocationId: "ALLOC-DEMO-002",
      mpName: "Hon'ble MP Demo",
      districtId: "D001",
      districtName: "Pune District",
      constituencyId: "C001",
      constituencyName: "Pune Constituency",
      agencyId: "IA011",
      agencyName: "Public Works Department (PWD)",
      sector: "Drinking Water",
      estimatedCost: 5000000,
      sanctionedCost: 5000000,
      actualExpenditure: 4500000,
      physicalProgress: 100,
      financialProgress: 90,
      status: "COMPLETED",
      priority: "NORMAL",
      trustScore: 94.2,
      explanation: "Water purity report and completion verified.",
      latitude: 18.5312,
      longitude: 73.8445,
      evidenceCount: 10,
      documentCount: 5,
      provenance: "OFFICIAL",
      createdAt: "2025-02-01",
      updatedAt: "2026-03-01"
    },
    {
      id: "MPLADS-DEMO-0003",
      projectCode: "MPLADS-DEMO-0003",
      workName: "Rural Market Shed & Vendors Complex",
      description: "Covered market shed for local agricultural produce and small vendors.",
      allocationId: "ALLOC-DEMO-003",
      mpName: "Hon'ble MP Demo",
      districtId: "D001",
      districtName: "Pune District",
      constituencyId: "C001",
      constituencyName: "Pune Constituency",
      agencyId: "IA011",
      agencyName: "Public Works Department (PWD)",
      sector: "Community Infrastructure",
      estimatedCost: 5000000,
      sanctionedCost: 5000000,
      actualExpenditure: 0,
      physicalProgress: 0,
      financialProgress: 0,
      status: "REJECTED",
      priority: "ATTENTION",
      trustScore: 65.0,
      explanation: "Land availability clearance issue.",
      latitude: 18.5401,
      longitude: 73.8610,
      evidenceCount: 2,
      documentCount: 3,
      provenance: "OFFICIAL",
      createdAt: "2025-03-12",
      updatedAt: "2025-05-20"
    },
    {
      id: "MPLADS-DEMO-0004",
      projectCode: "MPLADS-DEMO-0004",
      workName: "Civic Amenities Centre & Community Hall",
      description: "Multipurpose hall for community events, skill development, and public meetings.",
      allocationId: "ALLOC-DEMO-004",
      mpName: "Hon'ble MP Demo",
      districtId: "D001",
      districtName: "Pune District",
      constituencyId: "C001",
      constituencyName: "Pune Constituency",
      agencyId: "IA011",
      agencyName: "Public Works Department (PWD)",
      sector: "Community Infrastructure",
      estimatedCost: 5000000,
      sanctionedCost: 5000000,
      actualExpenditure: 1200000,
      physicalProgress: 25,
      financialProgress: 24,
      status: "SANCTIONED",
      priority: "NORMAL",
      trustScore: 88.0,
      explanation: "Sanction issued, site layout approved.",
      latitude: 18.5150,
      longitude: 73.8720,
      evidenceCount: 5,
      documentCount: 4,
      provenance: "OFFICIAL",
      createdAt: "2025-04-15",
      updatedAt: "2026-01-10"
    },
    {
      id: "MPLADS-DEMO-0005",
      projectCode: "MPLADS-DEMO-0005",
      workName: "Bus Shelter & Passenger Amenities",
      description: "Stainless steel passenger shelters with solar lighting and digital timetables.",
      allocationId: "ALLOC-DEMO-005",
      mpName: "Hon'ble MP Demo",
      districtId: "D001",
      districtName: "Pune District",
      constituencyId: "C001",
      constituencyName: "Pune Constituency",
      agencyId: "IA011",
      agencyName: "Public Works Department (PWD)",
      sector: "Roads & Transport",
      estimatedCost: 5000000,
      sanctionedCost: 5000000,
      actualExpenditure: 0,
      physicalProgress: 0,
      financialProgress: 0,
      status: "REJECTED",
      priority: "ATTENTION",
      trustScore: 68.5,
      explanation: "Overlapping road expansion project.",
      latitude: 18.5280,
      longitude: 73.8390,
      evidenceCount: 1,
      documentCount: 2,
      provenance: "OFFICIAL",
      createdAt: "2025-05-10",
      updatedAt: "2025-06-15"
    },
    {
      id: "MPLADS-DEMO-0006",
      projectCode: "MPLADS-DEMO-0006",
      workName: "Public Sanitation Block & Hygiene Complex",
      description: "Modern public toilet facility with rainwater harvesting and solar water heater.",
      allocationId: "ALLOC-DEMO-006",
      mpName: "Hon'ble MP Demo",
      districtId: "D001",
      districtName: "Pune District",
      constituencyId: "C001",
      constituencyName: "Pune Constituency",
      agencyId: "IA011",
      agencyName: "Public Works Department (PWD)",
      sector: "Public Infrastructure",
      estimatedCost: 5000000,
      sanctionedCost: 5000000,
      actualExpenditure: 2250000,
      physicalProgress: 45,
      financialProgress: 45,
      status: "ASSIGNED",
      priority: "HIGH_PRIORITY",
      trustScore: 78.4,
      explanation: "Evidence photo required for foundation stage.",
      latitude: 18.5350,
      longitude: 73.8490,
      evidenceCount: 6,
      documentCount: 4,
      provenance: "OFFICIAL",
      createdAt: "2025-06-01",
      updatedAt: "2026-02-28"
    },
    {
      id: "MPLADS-DEMO-0007",
      projectCode: "MPLADS-DEMO-0007",
      workName: "Indoor Sports Room & Youth Skill Hub",
      description: "Facility for youth sports, indoor games, and digital learning center.",
      allocationId: "ALLOC-DEMO-007",
      mpName: "Hon'ble MP Demo",
      districtId: "D001",
      districtName: "Pune District",
      constituencyId: "C001",
      constituencyName: "Pune Constituency",
      agencyId: "IA011",
      agencyName: "Public Works Department (PWD)",
      sector: "Education",
      estimatedCost: 5000000,
      sanctionedCost: 5000000,
      actualExpenditure: 3200000,
      physicalProgress: 65,
      financialProgress: 64,
      status: "IN_PROGRESS",
      priority: "NORMAL",
      trustScore: 91.0,
      explanation: "Roofing completed, interior plastering in progress.",
      latitude: 18.5420,
      longitude: 73.8580,
      evidenceCount: 9,
      documentCount: 5,
      provenance: "OFFICIAL",
      createdAt: "2025-07-15",
      updatedAt: "2026-03-10"
    }
  ], []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchProjects(500);
        const finalProjects = data && data.length > 0 ? data : fallbackProjects;
        setProjects(finalProjects);
        if (finalProjects.length > 0) {
          setTargetProjectId(finalProjects[0].id);
          setPhysicalProgress(finalProjects[0].physicalProgress || 50);
          setFinancialProgress(finalProjects[0].financialProgress || 50);
          setExpenditure(finalProjects[0].actualExpenditure || 1000000);
        }
      } catch (err) {
        console.error("Error loading Implementing Agency projects:", err);
        setProjects(fallbackProjects);
        setTargetProjectId(fallbackProjects[0].id);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [fallbackProjects]);

  // Sync target project selections
  const activeTargetProject = useMemo(() => {
    return projects.find(p => p.id === targetProjectId) || projects[0] || null;
  }, [projects, targetProjectId]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = searchTerm === '' || 
        p.workName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || p.status.toUpperCase() === statusFilter.toUpperCase();
      const matchesSector = sectorFilter === 'ALL' || 
        p.sector.toUpperCase().includes(sectorFilter.toUpperCase()) ||
        sectorFilter.toUpperCase().includes(p.sector.toUpperCase());

      let matchesKpi = true;
      if (kpiFilter === 'ACTIVE') {
        matchesKpi = p.status === 'IN_PROGRESS' || p.status === 'ASSIGNED' || p.status === 'SANCTIONED';
      } else if (kpiFilter === 'DELAYED') {
        matchesKpi = p.priority === 'HIGH_PRIORITY' || p.priority === 'ATTENTION' || (p.physicalProgress < 50 && p.financialProgress > 60);
      } else if (kpiFilter === 'EVIDENCE_PENDING') {
        matchesKpi = (p.physicalProgress > 0 && p.physicalProgress < 100) || p.priority === 'HIGH_PRIORITY';
      }

      return matchesSearch && matchesStatus && matchesSector && matchesKpi;
    });
  }, [projects, searchTerm, statusFilter, sectorFilter, kpiFilter]);

  // Dynamic KPI Calculations
  const assignedCount = projects.length;
  const activeCount = projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'ASSIGNED' || p.status === 'SANCTIONED').length;
  const delayedCount = projects.filter(p => p.priority === 'HIGH_PRIORITY' || p.priority === 'ATTENTION' || (p.physicalProgress < 50 && p.financialProgress > 60)).length;
  const evidencePendingCount = projects.filter(p => (p.physicalProgress > 0 && p.physicalProgress < 100) || p.priority === 'HIGH_PRIORITY').length;
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
  const handleProgressSubmit = async (e: React.FormEvent, projId: string = targetProjectId) => {
    e.preventDefault();
    const targetProj = projects.find(p => p.id === projId) || selectedProject;
    if (!targetProj) return;

    try {
      setIsSubmitting(true);
      setUpdateErrorMsg('');
      setUpdateSuccessMsg('');

      await updateProjectProgress(targetProj.id, {
        physical_progress: physicalProgress,
        financial_progress: financialProgress,
        actual_expenditure: expenditure,
        milestone: nextMilestone,
        remarks: currentWork
      });

      // Update local state
      setProjects(prev => prev.map(p => {
        if (p.id === targetProj.id) {
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

      if (selectedProject && selectedProject.id === targetProj.id) {
        setSelectedProject(prev => prev ? {
          ...prev,
          physicalProgress: physicalProgress,
          financialProgress: financialProgress,
          actualExpenditure: expenditure,
          status: physicalProgress >= 100 ? 'COMPLETED' : 'IN_PROGRESS'
        } : null);
      }

      setUpdateSuccessMsg('Physical progress updated & logged with cryptographic audit trail.');
    } catch (err: any) {
      setUpdateErrorMsg(err.message || 'Failed to submit progress update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Evidence Upload
  const handleEvidenceSubmit = async (e: React.FormEvent, projId: string = targetProjectId) => {
    e.preventDefault();
    const targetProj = projects.find(p => p.id === projId) || selectedProject;
    if (!targetProj) return;

    try {
      setIsSubmitting(true);
      setUpdateErrorMsg('');
      setUpdateSuccessMsg('');

      const res = await submitProjectEvidence(targetProj.id, {
        file_name: evidenceFile ? evidenceFile.name : `${targetProj.projectCode}_site_photo.jpg`,
        evidence_type: evidenceType,
        description: evidenceDesc || `Verified ${evidenceType} photograph for ${targetProj.workName}`,
        uploaded_by: `${agencyName} Official`
      });

      // Update local state with new evidence & audit trail
      if (res.evidence) {
        setProjects(prev => prev.map(p => {
          if (p.id === targetProj.id) {
            const currentFiles = (p as any).evidence_files || [];
            const currentAudit = (p as any).audit_history || [];
            return {
              ...p,
              evidence_files: [res.evidence, ...currentFiles],
              evidenceCount: (p.evidenceCount || 0) + 1,
              audit_history: [{
                timestamp: new Date().toISOString(),
                action: 'SITE_EVIDENCE_REGISTERED',
                performed_by: `${agencyName} Official`,
                details: `Registered ${evidenceType} (${res.evidence.file_name}) with SHA-256 Hash ${res.evidence.hash.slice(0, 16)}...`
              }, ...currentAudit]
            };
          }
          return p;
        }));

        if (selectedProject && selectedProject.id === targetProj.id) {
          setSelectedProject(prev => {
            if (!prev) return null;
            const currentFiles = (prev as any).evidence_files || [];
            const currentAudit = (prev as any).audit_history || [];
            return {
              ...prev,
              evidence_files: [res.evidence, ...currentFiles],
              evidenceCount: (prev.evidenceCount || 0) + 1,
              audit_history: [{
                timestamp: new Date().toISOString(),
                action: 'SITE_EVIDENCE_REGISTERED',
                performed_by: `${agencyName} Official`,
                details: `Registered ${evidenceType} (${res.evidence.file_name}) with SHA-256 Hash ${res.evidence.hash.slice(0, 16)}...`
              }, ...currentAudit]
            };
          });
        }
      }

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
  const handleQueryResponseSubmit = async (e: React.FormEvent, projId: string = targetProjectId) => {
    e.preventDefault();
    const targetProj = projects.find(p => p.id === projId) || selectedProject;
    if (!targetProj || !queryResponseText.trim()) return;

    try {
      setIsSubmitting(true);
      setUpdateErrorMsg('');
      setUpdateSuccessMsg('');

      const res = await submitVerificationResponse(targetProj.id, {
        query_id: verificationQueryId,
        response_text: queryResponseText,
        submitted_by: `${agencyName} Field Engineer`
      });

      // Update local audit history
      setProjects(prev => prev.map(p => {
        if (p.id === targetProj.id) {
          const currentAudit = (p as any).audit_history || [];
          return {
            ...p,
            audit_history: [{
              timestamp: new Date().toISOString(),
              action: 'VERIFICATION_RESPONSE_SUBMITTED',
              performed_by: `${agencyName} Field Engineer`,
              details: `Submitted response to query ${verificationQueryId}: ${queryResponseText}`
            }, ...currentAudit]
          };
        }
        return p;
      }));

      if (selectedProject && selectedProject.id === targetProj.id) {
        setSelectedProject(prev => {
          if (!prev) return null;
          const currentAudit = (prev as any).audit_history || [];
          return {
            ...prev,
            audit_history: [{
              timestamp: new Date().toISOString(),
              action: 'VERIFICATION_RESPONSE_SUBMITTED',
              performed_by: `${agencyName} Field Engineer`,
              details: `Submitted response to query ${verificationQueryId}: ${queryResponseText}`
            }, ...currentAudit]
          };
        });
      }

      setUpdateSuccessMsg('Verification response submitted successfully to Monitoring Officer & District Authority.');
      setQueryResponseText('');
    } catch (err: any) {
      setUpdateErrorMsg(err.message || 'Failed to submit verification response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Completion Package
  const handleCompletionSubmit = async (e: React.FormEvent, projId: string = targetProjectId) => {
    e.preventDefault();
    const targetProj = projects.find(p => p.id === projId) || selectedProject;
    if (!targetProj) return;

    try {
      setIsSubmitting(true);
      setUpdateErrorMsg('');
      setUpdateSuccessMsg('');

      await submitProjectCompletion(targetProj.id, {
        completion_certificate_file: completionFile ? completionFile.name : `COMPLETION_CERT_${targetProj.projectCode}.pdf`,
        remarks: completionRemarks || 'Physical work 100% completed and handover package submitted.',
        submitted_by: `${agencyName} Nodal Officer`
      });

      setProjects(prev => prev.map(p => {
        if (p.id === targetProj.id) {
          const currentAudit = (p as any).audit_history || [];
          return {
            ...p,
            physicalProgress: 100,
            status: 'COMPLETED',
            audit_history: [{
              timestamp: new Date().toISOString(),
              action: 'COMPLETION_SUBMITTED',
              performed_by: `${agencyName} Nodal Officer`,
              details: `Final completion certificate and handover package submitted. Remarks: ${completionRemarks || 'Work completed per specifications.'}`
            }, ...currentAudit]
          };
        }
        return p;
      }));

      if (selectedProject && selectedProject.id === targetProj.id) {
        setSelectedProject(prev => {
          if (!prev) return null;
          const currentAudit = (prev as any).audit_history || [];
          return {
            ...prev,
            physicalProgress: 100,
            status: 'COMPLETED',
            audit_history: [{
              timestamp: new Date().toISOString(),
              action: 'COMPLETION_SUBMITTED',
              performed_by: `${agencyName} Nodal Officer`,
              details: `Final completion certificate and handover package submitted. Remarks: ${completionRemarks || 'Work completed per specifications.'}`
            }, ...currentAudit]
          };
        });
      }

      setUpdateSuccessMsg(`Project completion package submitted successfully for ${targetProj.projectCode}. Status updated to COMPLETED.`);
      setCompletionRemarks('');
      setCompletionFile(null);
    } catch (err: any) {
      setUpdateErrorMsg(err.message || 'Failed to submit completion package.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Toggle Document Status
  const handleDocumentUpload = (docId: string) => {
    setDocumentsList(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'AVAILABLE',
          uploadedAt: new Date().toISOString().slice(0, 10)
        };
      }
      return d;
    }));
    setUpdateSuccessMsg('Document file uploaded and verified successfully.');
    setTimeout(() => setUpdateSuccessMsg(''), 4000);
  };

  // Mark notification read
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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
                <option value="projects">My Projects ({projects.length})</option>
                <option value="progress">Progress Updates</option>
                <option value="map">Project Map</option>
                <option value="evidence">Evidence Ledger</option>
                <option value="documents">Document Center</option>
                <option value="verification">Verification Responses (2)</option>
                <option value="completion">Completion</option>
                <option value="notifications">Notifications ({notifications.filter(n => !n.read).length})</option>
                <option value="settings">Settings</option>
              </select>
            </div>

            <div className="bg-govBg px-3 py-2 rounded border border-govBorder text-right">
              <span className="text-[10px] text-textSecondary uppercase font-bold block">Financial Year</span>
              <span className="text-xs font-bold text-govNavy">FY 2025 – 2026</span>
            </div>
            <button 
              onClick={() => handleTabChange('progress')}
              className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-4 py-2.5 rounded flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Update Progress</span>
            </button>
          </div>
        </div>

        {/* Global Success / Error Banners */}
        {updateSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{updateSuccessMsg}</span>
            </div>
            <button onClick={() => setUpdateSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
          </div>
        )}
        {updateErrorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{updateErrorMsg}</span>
            </div>
            <button onClick={() => setUpdateErrorMsg('')} className="text-red-700 hover:text-red-900 font-bold text-xs">✕</button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 1: OVERVIEW TAB */}
        {/* ---------------------------------------------------- */}
        {(currentTab === 'overview') && (
          <div className="space-y-6">
            {/* Top Execution KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div onClick={() => setKpiFilter(null)} className="cursor-pointer transition-transform hover:scale-[1.01]">
                <KPICard 
                  title="Assigned Projects" 
                  value={loading ? "..." : assignedCount.toString()} 
                  subtitle="Agency Jurisdiction" 
                  icon={<Building2 className="w-5 h-5 text-primaryBlue" />} 
                />
              </div>
              <div onClick={() => setKpiFilter(kpiFilter === 'ACTIVE' ? null : 'ACTIVE')} className="cursor-pointer transition-transform hover:scale-[1.01]">
                <KPICard 
                  title="Active Projects" 
                  value={loading ? "..." : activeCount.toString()} 
                  subtitle="Under Execution" 
                  icon={<RefreshCw className="w-5 h-5 text-amber-500" />} 
                />
              </div>
              <div onClick={() => setKpiFilter(kpiFilter === 'DELAYED' ? null : 'DELAYED')} className="cursor-pointer transition-transform hover:scale-[1.01]">
                <KPICard 
                  title="Delayed Projects" 
                  value={loading ? "..." : delayedCount.toString()} 
                  subtitle="Requires Priority" 
                  icon={<AlertTriangle className="w-5 h-5 text-red-600" />} 
                />
              </div>
              <div onClick={() => setKpiFilter(kpiFilter === 'EVIDENCE_PENDING' ? null : 'EVIDENCE_PENDING')} className="cursor-pointer transition-transform hover:scale-[1.01]">
                <KPICard 
                  title="Evidence Pending" 
                  value={loading ? "..." : evidencePendingCount.toString()} 
                  subtitle="Photos / Documents" 
                  icon={<Upload className="w-5 h-5 text-blue-600" />} 
                />
              </div>
              <div className="cursor-pointer">
                <KPICard 
                  title="Completion Progress" 
                  value={loading ? "..." : `${avgCompletionProgress}%`} 
                  subtitle="Avg Physical Progress" 
                  icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} 
                />
              </div>
            </div>

            {/* Action Required Section */}
            <div className="gov-card p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between pb-3 border-b border-govBorder mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide">ACTION REQUIRED QUEUE</h3>
                    <p className="text-[11px] text-textSecondary">High-priority compliance, evidence uploads, and verification responses requiring your response.</p>
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
                      onClick={() => {
                        if (projects[0]) setTargetProjectId(projects[0].id);
                        handleTabChange('evidence');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] px-3 py-1.5 rounded shrink-0 transition-colors shadow-xs"
                    >
                      Upload Evidence
                    </button>
                  </div>

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
                      onClick={() => {
                        const target = projects[1] || projects[0];
                        if (target) setTargetProjectId(target.id);
                        handleTabChange('verification');
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] px-3 py-1.5 rounded shrink-0 transition-colors shadow-xs"
                    >
                      Respond Query
                    </button>
                  </div>

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
                      onClick={() => {
                        const target = projects[2] || projects[0];
                        if (target) setTargetProjectId(target.id);
                        handleTabChange('progress');
                      }}
                      className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-[11px] px-3 py-1.5 rounded shrink-0 transition-colors shadow-xs"
                    >
                      Update Progress
                    </button>
                  </div>

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
                      onClick={() => {
                        const target = projects[3] || projects[0];
                        if (target) setTargetProjectId(target.id);
                        handleTabChange('documents');
                      }}
                      className="bg-govNavy hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded shrink-0 transition-colors shadow-xs"
                    >
                      Review Checklist
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* GIS Map Summary */}
            <ProjectMap projects={projects} />

            {/* Quick Table Summary */}
            <div className="gov-card p-5">
              <div className="flex items-center justify-between pb-3 border-b border-govBorder mb-4">
                <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primaryBlue" />
                  ASSIGNED PROJECTS OVERVIEW
                </h3>
                <button 
                  onClick={() => handleTabChange('projects')}
                  className="text-xs text-primaryBlue hover:text-govNavy font-bold flex items-center gap-1"
                >
                  <span>View All Projects</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px]">
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Work Title</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Physical Progress</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-govBorder">
                    {filteredProjects.slice(0, 5).map(p => (
                      <tr key={p.id} className="hover:bg-govBg/50">
                        <td className="p-2.5 font-mono font-bold text-primaryBlue">{p.projectCode}</td>
                        <td className="p-2.5 font-bold text-govNavy">{p.workName}</td>
                        <td className="p-2.5"><StatusBadge status={p.status} /></td>
                        <td className="p-2.5">
                          <span className="font-bold text-emerald-700">{p.physicalProgress}%</span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button 
                            onClick={() => openProjectModal(p, 'overview')}
                            className="bg-govBg hover:bg-primaryBlue hover:text-white border border-govBorder font-bold text-[10px] px-2.5 py-1 rounded"
                          >
                            Open Workspace
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: MY PROJECTS TAB */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'projects' && (
          <div className="gov-card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-govBorder mb-4">
              <div>
                <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primaryBlue" />
                  MY ASSIGNED PROJECTS ({filteredProjects.length})
                </h3>
                <p className="text-xs text-textSecondary mt-0.5">
                  Full project list assigned to {agencyName}. Click "Open Workspace" to report physical progress or evidence.
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
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 3: PROGRESS UPDATES TAB */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'progress' && (
          <div className="gov-card p-6 max-w-3xl mx-auto space-y-4">
            <div className="pb-3 border-b border-govBorder">
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primaryBlue" />
                SUBMIT PHYSICAL EXECUTION PROGRESS
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Record updated physical completion percentages, financial expenditure, work milestones, and expected completion dates.
              </p>
            </div>

            <form onSubmit={(e) => handleProgressSubmit(e, targetProjectId)} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-govNavy mb-1">Target Assigned Project *</label>
                <select 
                  value={targetProjectId}
                  onChange={(e) => {
                    setTargetProjectId(e.target.value);
                    const p = projects.find(proj => proj.id === e.target.value);
                    if (p) {
                      setPhysicalProgress(p.physicalProgress || 50);
                      setFinancialProgress(p.financialProgress || 50);
                      setExpenditure(p.actualExpenditure || 1000000);
                    }
                  }}
                  className="w-full p-2.5 bg-govBg border border-govBorder rounded text-xs font-bold text-govNavy"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectCode} — {p.workName} ({p.physicalProgress}%)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-govNavy mb-1">Physical Progress Percentage (%) *</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={physicalProgress}
                    onChange={(e) => setPhysicalProgress(Number(e.target.value))}
                    className="w-full p-2 bg-govBg border border-govBorder rounded font-bold text-govNavy text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-govNavy mb-1">Financial Progress Percentage (%) *</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={financialProgress}
                    onChange={(e) => setFinancialProgress(Number(e.target.value))}
                    className="w-full p-2 bg-govBg border border-govBorder rounded font-bold text-govNavy text-sm"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-govNavy mb-1">Actual Recorded Expenditure (INR) *</label>
                  <input 
                    type="number"
                    value={expenditure}
                    onChange={(e) => setExpenditure(Number(e.target.value))}
                    className="w-full p-2 bg-govBg border border-govBorder rounded font-bold text-govNavy text-sm"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-govNavy mb-1">Summary of Physical Work Executed *</label>
                  <textarea 
                    rows={3}
                    value={currentWork}
                    onChange={(e) => setCurrentWork(e.target.value)}
                    placeholder="Provide details on exact construction milestones completed on site..."
                    className="w-full p-2 bg-govBg border border-govBorder rounded text-xs text-govNavy"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-govNavy mb-1">Next Milestone Target</label>
                  <input 
                    type="text"
                    value={nextMilestone}
                    onChange={(e) => setNextMilestone(e.target.value)}
                    placeholder="e.g. Roof slab casting"
                    className="w-full p-2 bg-govBg border border-govBorder rounded text-xs text-govNavy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-govNavy mb-1">Target Completion Date</label>
                  <input 
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full p-2 bg-govBg border border-govBorder rounded text-xs font-semibold text-govNavy"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-govBorder text-right">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-6 py-2.5 rounded shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Committing Progress...' : 'Commit Execution Progress Update'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 4: PROJECT MAP TAB */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-govBorder shadow-xs">
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primaryBlue" />
                MY PROJECT GEOSPATIAL MAP
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Displays live GPS positions for works assigned to {agencyName}. Click pins for physical progress and status.
              </p>
            </div>
            <ProjectMap projects={projects} />
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 5: EVIDENCE LEDGER TAB */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'evidence' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Upload Form */}
            <div className="gov-card p-6">
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2 mb-1">
                <Upload className="w-5 h-5 text-primaryBlue" />
                REGISTER SITE EVIDENCE PASSPORT
              </h3>
              <p className="text-xs text-textSecondary mb-4">
                Upload verified site progress photographs. Cryptographic SHA-256 integrity hash is automatically generated.
              </p>

              <form onSubmit={(e) => handleEvidenceSubmit(e, targetProjectId)} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-govNavy mb-1">Target Assigned Project *</label>
                  <select 
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full p-2.5 bg-govBg border border-govBorder rounded text-xs font-bold text-govNavy"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.projectCode} — {p.workName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-govNavy mb-1">Evidence Classification *</label>
                    <select 
                      value={evidenceType}
                      onChange={(e) => setEvidenceType(e.target.value)}
                      className="w-full p-2 bg-govBg border border-govBorder rounded text-xs font-semibold text-govNavy"
                    >
                      <option value="Progress Photograph">Progress Photograph</option>
                      <option value="Completion Photograph">Completion Photograph</option>
                      <option value="Quality Certificate">Quality Certificate</option>
                      <option value="Material Test Measurement">Material Test Measurement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-govNavy mb-1">GPS Location Status</label>
                    <input 
                      type="text"
                      readOnly
                      value={`GPS Coordinates Verified (${activeTargetProject?.latitude || 21.3554}° N, ${activeTargetProject?.longitude || 72.7368}° E)`}
                      className="w-full p-2 bg-slate-100 border border-govBorder rounded text-xs font-mono text-slate-700"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-govNavy mb-1">Evidence Description *</label>
                    <input 
                      type="text"
                      value={evidenceDesc}
                      onChange={(e) => setEvidenceDesc(e.target.value)}
                      placeholder="Add brief technical description of physical work depicted..."
                      className="w-full p-2 bg-govBg border border-govBorder rounded text-xs"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-govNavy mb-1">Attach Site Photo (JPEG/PNG)</label>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)} 
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-5 border-2 border-dashed border-govBorder rounded text-center bg-govBg hover:border-primaryBlue transition-colors cursor-pointer"
                    >
                      <Upload className="w-6 h-6 text-textSecondary mx-auto mb-1" />
                      <span className="text-xs font-bold text-govNavy block">
                        {evidenceFile ? evidenceFile.name : "Click or drag site photograph evidence file here"}
                      </span>
                      <span className="text-[10px] text-textSecondary mt-1 block">
                        SHA-256 cryptographic hash generated on platform ledger.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right pt-2 border-t border-govBorder">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering Evidence...' : 'Register Evidence Passport Record'}
                  </button>
                </div>
              </form>
            </div>

            {/* Evidence Passports View */}
            <div className="space-y-3">
              <h4 className="font-bold text-govNavy text-sm uppercase tracking-wide">REGISTERED EVIDENCE PASSPORTS</h4>
              {((activeTargetProject as any)?.evidence_files || []).length > 0 ? (
                ((activeTargetProject as any).evidence_files as any[]).map((ev: any, idx: number) => (
                  <EvidencePassport 
                    key={ev.evidence_id || idx}
                    evidenceId={ev.evidence_id || `EV-2026-${activeTargetProject?.projectCode || 'P01'}`}
                    uploadedBy={ev.uploaded_by || agencyName}
                    timestamp={ev.timestamp || "2026-09-24 11:30 System Time"}
                    coordinates={ev.location || `${activeTargetProject?.latitude || 21.3554}° N, ${activeTargetProject?.longitude || 72.7368}° E`}
                    hash={ev.hash || "a7f8e910b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9"}
                    integrityVerified={true}
                  />
                ))
              ) : (
                <EvidencePassport 
                  evidenceId={`EV-2026-${activeTargetProject?.projectCode || 'P01'}`}
                  uploadedBy={`${agencyName}`}
                  timestamp="2026-09-24 11:30 System Time"
                  coordinates={`${activeTargetProject?.latitude || 21.3554}° N, ${activeTargetProject?.longitude || 72.7368}° E`}
                  hash="a7f8e910b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9"
                  integrityVerified={true}
                />
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 6: DOCUMENT CENTER TAB */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'documents' && (
          <div className="gov-card p-6 max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-govBorder">
              <div>
                <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primaryBlue" />
                  MANDATORY COMPLIANCE DOCUMENT CENTER
                </h3>
                <p className="text-xs text-textSecondary mt-0.5">
                  Attach technical estimates, work orders, measurement documents, and completion certificates.
                </p>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded border border-emerald-200">
                {documentsList.filter(d => d.status === 'AVAILABLE').length} / {documentsList.length} Uploaded
              </span>
            </div>

            <div className="space-y-3">
              {documentsList.map((doc) => (
                <div key={doc.id} className="p-4 bg-govBg border border-govBorder rounded flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white rounded border border-govBorder text-primaryBlue">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-govNavy text-xs">{doc.title}</p>
                      <p className="text-[10px] text-textSecondary font-mono">{doc.code} • Last updated: {doc.uploadedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${
                      doc.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      doc.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {doc.status}
                    </span>

                    {doc.status === 'AVAILABLE' ? (
                      <button 
                        onClick={() => setViewingDocument(doc)}
                        className="bg-white hover:bg-slate-100 text-govNavy border border-govBorder text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-primaryBlue" />
                        <span>View File</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDocumentUpload(doc.id)}
                        className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 7: VERIFICATION RESPONSES TAB */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'verification' && (
          <div className="gov-card p-6 max-w-3xl mx-auto space-y-4">
            <div className="pb-3 border-b border-govBorder">
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primaryBlue" />
                VERIFICATION QUERY RESPONSES
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Respond to verification queries raised by Monitoring Officers or District Collectorate.
              </p>
            </div>

            {/* Verification Signal Alert */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="font-extrabold text-amber-900 uppercase tracking-wide">VERIFICATION SIGNAL REQUIRES RESPONSE</span>
              </div>
              <p className="text-amber-900 font-medium">
                Query Reference: <strong>Q-2026-089</strong> • Target Work: <strong>{activeTargetProject?.workName || 'Community Infrastructure Work'}</strong>
              </p>
              <div className="bg-white/70 p-3 rounded border border-amber-200 text-amber-900 space-y-1">
                <p>• <strong>Officer Query:</strong> Physical progress reported (62%) requires site photograph clarification.</p>
                <p>• <strong>Action Required:</strong> Submit technical response statement below.</p>
              </div>
            </div>

            {/* Response Form */}
            <form onSubmit={(e) => handleQueryResponseSubmit(e, targetProjectId)} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-govNavy mb-1">Target Assigned Project *</label>
                <select 
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full p-2.5 bg-govBg border border-govBorder rounded text-xs font-bold text-govNavy"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectCode} — {p.workName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-govNavy mb-1">Query Reference ID *</label>
                <input 
                  type="text"
                  value={verificationQueryId}
                  onChange={(e) => setVerificationQueryId(e.target.value)}
                  className="w-full p-2 bg-govBg border border-govBorder rounded text-xs font-mono font-bold text-govNavy"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-govNavy mb-1">Implementing Agency Response Statement *</label>
                <textarea 
                  rows={4}
                  value={queryResponseText}
                  onChange={(e) => setQueryResponseText(e.target.value)}
                  placeholder="Provide technical justification, site condition details, or milestone explanation..."
                  className="w-full p-2 bg-govBg border border-govBorder rounded text-xs text-govNavy"
                  required
                />
              </div>

              <div className="pt-2 border-t border-govBorder text-right">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-6 py-2.5 rounded shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Response...' : 'Submit Official Response'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 8: COMPLETION WORKFLOW TAB */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'completion' && (
          <div className="gov-card p-6 max-w-3xl mx-auto space-y-4">
            <div className="pb-3 border-b border-govBorder">
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                PROJECT COMPLETION WORKFLOW
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Submit official completion certificates and final site handovers when physical execution reaches 100%.
              </p>
            </div>

            <div>
              <label className="block font-bold text-govNavy mb-1 text-xs">Select Target Project *</label>
              <select 
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                className="w-full p-2.5 bg-govBg border border-govBorder rounded text-xs font-bold text-govNavy"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.projectCode} — {p.workName} (Physical: {p.physicalProgress}%)</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-govBg border border-govBorder rounded text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-govNavy">Current Physical Progress:</span>
                <span className="font-extrabold text-emerald-700 text-sm">{activeTargetProject?.physicalProgress || 0}%</span>
              </div>

              {(activeTargetProject?.physicalProgress || 0) < 100 ? (
                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Completion submission requires 100% physical progress. Current progress is {activeTargetProject?.physicalProgress || 0}%. Update progress first under Progress Updates.</span>
                </div>
              ) : (
                <form onSubmit={(e) => handleCompletionSubmit(e, targetProjectId)} className="space-y-3">
                  <div>
                    <label className="block font-bold text-govNavy mb-1">Attach Signed Completion Certificate (PDF)</label>
                    <input 
                      type="file" 
                      ref={completionFileInputRef} 
                      className="w-full p-2 bg-white border border-govBorder rounded text-xs" 
                      onChange={(e) => setCompletionFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-govNavy mb-1">Final Handover Remarks</label>
                    <textarea 
                      rows={3} 
                      value={completionRemarks}
                      onChange={(e) => setCompletionRemarks(e.target.value)}
                      className="w-full p-2 bg-white border border-govBorder rounded text-xs" 
                      placeholder="Provide final site handover remarks and completion certification details..." 
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting Completion Package...' : 'Submit Final Completion Package'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 9: NOTIFICATIONS TAB */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'notifications' && (
          <div className="gov-card p-6 max-w-3xl mx-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-govBorder">
              <div>
                <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primaryBlue" />
                  IMPLEMENTING AGENCY NOTIFICATIONS
                </h3>
                <p className="text-xs text-textSecondary mt-0.5">
                  Alerts regarding evidence submissions, verification queries, and milestone deadlines.
                </p>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-primaryBlue px-3 py-1 rounded border border-blue-200">
                {notifications.filter(n => !n.read).length} Unread
              </span>
            </div>

            <div className="space-y-2">
              {notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    const matchingProj = projects.find(p => p.projectCode === n.project);
                    if (matchingProj) {
                      setTargetProjectId(matchingProj.id);
                    }
                    if (n.id === 'N1') handleTabChange('evidence');
                    else if (n.id === 'N2') handleTabChange('verification');
                    else if (n.id === 'N3') handleTabChange('progress');
                    else if (n.id === 'N4') handleTabChange('documents');
                  }}
                  className={`p-4 rounded border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    n.read ? 'bg-govBg/40 border-govBorder opacity-80' : 'bg-white border-primaryBlue/30 shadow-xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded text-white ${n.priority === 'HIGH' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {n.priority}
                      </span>
                      <span className="font-bold text-govNavy text-xs">{n.title}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <p className="text-[11px] font-semibold text-primaryBlue">{n.project}</p>
                    <p className="text-[10px] text-textSecondary">{n.time}</p>
                  </div>
                  <button className="text-xs font-bold text-primaryBlue hover:text-govNavy">
                    {n.read ? 'Read' : 'Mark Read'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 10: SETTINGS TAB */}
        {/* ---------------------------------------------------- */}
        {currentTab === 'settings' && (
          <div className="gov-card p-6 max-w-3xl mx-auto space-y-5 text-xs">
            <div className="pb-3 border-b border-govBorder">
              <h3 className="text-base font-bold text-govNavy flex items-center gap-2">
                <Settings className="w-5 h-5 text-primaryBlue" />
                AGENCY PROFILE & CONFIGURATION
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">
                Implementing agency credentials, nodal officer contacts, and GIS integration configuration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-govNavy mb-1">Agency Name</label>
                <input type="text" readOnly value={agencyName} className="w-full p-2 bg-slate-100 border border-govBorder rounded font-semibold text-govNavy" />
              </div>

              <div>
                <label className="block font-bold text-govNavy mb-1">Agency Reference Code</label>
                <input type="text" readOnly value={agencyId} className="w-full p-2 bg-slate-100 border border-govBorder rounded font-mono font-semibold text-govNavy" />
              </div>

              <div>
                <label className="block font-bold text-govNavy mb-1">Nodal Executive Engineer</label>
                <input type="text" defaultValue="Er. Rajesh Sharma (PWD Zone 1)" className="w-full p-2 bg-govBg border border-govBorder rounded text-govNavy font-semibold" />
              </div>

              <div>
                <label className="block font-bold text-govNavy mb-1">Official Contact Email</label>
                <input type="email" defaultValue="pwd.execution@state.gov.in" className="w-full p-2 bg-govBg border border-govBorder rounded text-govNavy font-semibold" />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-govNavy mb-1">GIS & Geofencing Mode</label>
                <select className="w-full p-2 bg-govBg border border-govBorder rounded font-semibold text-govNavy">
                  <option value="AUTO">Automated High-Precision GPS Geofencing (Recommended)</option>
                  <option value="MANUAL">Manual Site Coordinates Verification</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-govBorder text-right">
              <button 
                onClick={() => {
                  setUpdateSuccessMsg('Agency profile configuration updated successfully.');
                  setTimeout(() => setUpdateSuccessMsg(''), 4000);
                }}
                className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-5 py-2 rounded"
              >
                Save Agency Configuration
              </button>
            </div>
          </div>
        )}

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
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">✓</div>
                    <span className="text-[10px] text-emerald-300 font-semibold">Recommended</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-emerald-600 mx-1" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">✓</div>
                    <span className="text-[10px] text-emerald-300 font-semibold">Sanctioned</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-emerald-600 mx-1" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">✓</div>
                    <span className="text-[10px] text-emerald-300 font-semibold">Assigned</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-blue-500 mx-1" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-blue-600/30">●</div>
                    <span className="text-[10px] text-blue-300 font-bold">Execution</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-white/20 mx-1" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-gray-400 flex items-center justify-center font-bold text-xs">○</div>
                    <span className="text-[10px] text-gray-400">Evidence</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-white/20 mx-1" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-gray-400 flex items-center justify-center font-bold text-xs">○</div>
                    <span className="text-[10px] text-gray-400">Verification</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-white/20 mx-1" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-gray-400 flex items-center justify-center font-bold text-xs">○</div>
                    <span className="text-[10px] text-gray-400">Completion</span>
                  </div>
                </div>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="bg-govBg p-1 border-b border-govBorder flex flex-wrap md:flex-nowrap items-center justify-between gap-1">
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
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-bold rounded transition-all whitespace-nowrap ${
                        isActive 
                          ? 'bg-primaryBlue text-white shadow-xs font-extrabold' 
                          : 'text-textSecondary hover:text-govNavy hover:bg-white/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-textSecondary'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Modal Content Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
                
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
                  <form onSubmit={(e) => handleProgressSubmit(e, selectedProject.id)} className="space-y-4 text-xs">
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

                {/* TAB 3: EVIDENCE UPLOAD */}
                {activeModalTab === 'evidence' && (
                  <div className="space-y-5 text-xs">
                    <form onSubmit={(e) => handleEvidenceSubmit(e, selectedProject.id)} className="p-4 bg-govBg border border-govBorder rounded space-y-3">
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
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-4 border-2 border-dashed border-govBorder rounded text-center bg-white hover:border-primaryBlue transition-colors cursor-pointer"
                          >
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
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded shadow-xs disabled:opacity-50"
                        >
                          {isSubmitting ? 'Hashing & Uploading...' : 'Register Site Evidence Passport'}
                        </button>
                      </div>
                    </form>

                    {((selectedProject as any)?.evidence_files || []).length > 0 ? (
                      ((selectedProject as any).evidence_files as any[]).map((ev: any, idx: number) => (
                        <EvidencePassport 
                          key={ev.evidence_id || idx}
                          evidenceId={ev.evidence_id || `EV-2026-${selectedProject.projectCode}`}
                          uploadedBy={ev.uploaded_by || agencyName}
                          timestamp={ev.timestamp || "2026-09-24 11:30 System Time"}
                          coordinates={ev.location || `${selectedProject.latitude || 21.3554}° N, ${selectedProject.longitude || 72.7368}° E`}
                          hash={ev.hash || "a7f8e910b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9"}
                          integrityVerified={true}
                        />
                      ))
                    ) : (
                      <EvidencePassport 
                        evidenceId={`EV-2026-${selectedProject.projectCode}`}
                        uploadedBy={`${agencyName}`}
                        timestamp="2026-09-24 11:30 System Time"
                        coordinates={`${selectedProject.latitude || 21.3554}° N, ${selectedProject.longitude || 72.7368}° E`}
                        hash="a7f8e910b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9"
                        integrityVerified={true}
                      />
                    )}
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
                        {documentsList.filter(d => d.status === 'AVAILABLE').length} / {documentsList.length} Verified
                      </span>
                    </div>

                    <div className="space-y-2">
                      {documentsList.map((doc) => (
                        <div key={doc.id} className="p-3 bg-govBg border border-govBorder rounded flex items-center justify-between">
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
                            {doc.status === 'AVAILABLE' ? (
                              <button 
                                onClick={() => setViewingDocument(doc)}
                                className="bg-white hover:bg-slate-100 text-govNavy border border-govBorder text-[10px] font-bold px-2.5 py-1 rounded"
                              >
                                View File
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleDocumentUpload(doc.id)}
                                className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-[10px] px-2.5 py-1 rounded"
                              >
                                Upload File
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: VERIFICATION RESPONSES */}
                {activeModalTab === 'verification' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-amber-50/80 border border-amber-300 rounded space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="font-extrabold text-amber-900 uppercase tracking-wide">VERIFICATION SIGNAL</span>
                      </div>
                      <p className="text-[11px] text-amber-900 font-medium">
                        The submitted physical progress evidence requires additional verification clarification.
                      </p>
                      <div className="text-[11px] text-amber-800 space-y-0.5 bg-white/60 p-2.5 rounded border border-amber-200">
                        <p>• <strong>Observation:</strong> Physical milestone reported ({selectedProject.physicalProgress}%) requires site photograph clarification.</p>
                        <p>• <strong>Recommended Action:</strong> Provide additional photo evidence or technical justification response.</p>
                      </div>
                    </div>

                    <form onSubmit={(e) => handleQueryResponseSubmit(e, selectedProject.id)} className="p-4 bg-govBg border border-govBorder rounded space-y-3">
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
                      {((selectedProject as any)?.audit_history || []).length > 0 ? (
                        ((selectedProject as any).audit_history as any[]).map((audit: any, idx: number) => (
                          <div key={idx} className="relative pt-1">
                            <span className="absolute -left-[21px] top-2.5 w-2.5 h-2.5 rounded-full bg-primaryBlue" />
                            <p className="font-bold text-govNavy">{audit.action?.replace(/_/g, ' ') || 'Audit Log Entry'}</p>
                            <p className="text-[11px] text-textSecondary">{audit.details || 'System recorded event.'}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{audit.timestamp} • By {audit.performed_by || 'System'}</p>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600" />
                            <p className="font-bold text-govNavy">Physical Progress Update Committed</p>
                            <p className="text-[11px] text-textSecondary">Physical progress recorded at {selectedProject.physicalProgress}%, Financial expenditure ₹{(selectedProject.actualExpenditure/100000).toFixed(2)} Lakh.</p>
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
                        </>
                      )}
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
                        <form onSubmit={(e) => handleCompletionSubmit(e, selectedProject.id)} className="space-y-3">
                          <div>
                            <label className="block font-semibold text-textPrimary mb-1">Attach Final Completion Certificate (PDF)</label>
                            <input 
                              type="file" 
                              ref={completionFileInputRef} 
                              className="w-full p-2 bg-white border border-govBorder rounded text-xs" 
                              onChange={(e) => setCompletionFile(e.target.files?.[0] || null)}
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-textPrimary mb-1">Final Handover Remarks</label>
                            <textarea 
                              rows={2} 
                              value={completionRemarks}
                              onChange={(e) => setCompletionRemarks(e.target.value)}
                              className="w-full p-2 bg-white border border-govBorder rounded text-xs" 
                              placeholder="Provide final site handover remarks..." 
                              required
                            />
                          </div>
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded shadow-xs disabled:opacity-50"
                          >
                            {isSubmitting ? 'Submitting Completion Package...' : 'Submit Official Completion Package'}
                          </button>
                        </form>
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

        {/* DOCUMENT PREVIEW MODAL */}
        {viewingDocument && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-govBorder shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-govNavy text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">{viewingDocument.title}</h3>
                    <p className="text-[10px] text-blue-200 font-mono">{viewingDocument.code}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingDocument(null)}
                  className="p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex justify-between items-center text-emerald-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold">Official Verification Provenance Verified</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    STATUS: {viewingDocument.status}
                  </span>
                </div>

                <div className="border border-govBorder rounded p-4 bg-slate-50 space-y-3 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-govBorder pb-2">
                    <span className="text-textSecondary">Document Identifier:</span>
                    <span className="font-bold text-govNavy">{viewingDocument.code}</span>
                  </div>
                  <div className="flex justify-between border-b border-govBorder pb-2">
                    <span className="text-textSecondary">Upload Date:</span>
                    <span className="font-bold text-govNavy">{viewingDocument.uploadedAt}</span>
                  </div>
                  <div className="flex justify-between border-b border-govBorder pb-2">
                    <span className="text-textSecondary">Issuing Agency:</span>
                    <span className="font-bold text-govNavy">{agencyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Digital Signature Hash:</span>
                    <span className="font-bold text-primaryBlue truncate max-w-[200px]">sha256:d8a4f9...e21c</span>
                  </div>
                </div>

                <div className="p-4 border-2 border-dashed border-govBorder rounded text-center bg-govBg space-y-2">
                  <FileCheck className="w-8 h-8 text-primaryBlue mx-auto" />
                  <p className="font-bold text-govNavy text-xs">Verified PDF Document Content Loaded</p>
                  <p className="text-[10px] text-textSecondary">This document has been digitally verified and sealed by the MPLADS District Nodal Portal.</p>
                </div>
              </div>

              <div className="bg-govBg p-3 border-t border-govBorder flex justify-between items-center text-xs">
                <button 
                  onClick={() => alert(`Downloading verified document ${viewingDocument.code}...`)}
                  className="bg-primaryBlue hover:bg-govNavy text-white font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Document</span>
                </button>
                <button 
                  onClick={() => setViewingDocument(null)}
                  className="bg-govBg hover:bg-slate-200 text-govNavy border border-govBorder font-bold px-4 py-1.5 rounded transition-colors"
                >
                  Close
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
