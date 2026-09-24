"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrustAssessment } from '@/components/risk/TrustAssessment';
import { AnomalyRadar } from '@/components/risk/AnomalyRadar';
import { ExplainableAIPanel } from '@/components/risk/ExplainableAIPanel';
import { fetchProjectById, fetchProjectRelational, fetchProjectRisk, fetchRecommendationById } from '@/lib/api';
import { Project } from '@/types/project';
import { ArrowLeft, CheckCircle2, FileCheck2, MapPin, Loader2, DollarSign, FileText, Image as ImageIcon, ClipboardCheck, AlertCircle, Award } from 'lucide-react';

export default function ProjectDetailsPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'relational' | 'risk' | 'audit'>('overview');
  const [project, setProject] = useState<Project | null>(null);
  const [relationalData, setRelationalData] = useState<any | null>(null);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [recommendationDetail, setRecommendationDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [proj, rel, risk] = await Promise.all([
          fetchProjectById(params.projectId),
          fetchProjectRelational(params.projectId),
          fetchProjectRisk(params.projectId)
        ]);
        setProject(proj);
        setRelationalData(rel);
        setRiskData(risk);

        if (proj && (proj as any).recommendation_id) {
          const recRes = await fetchRecommendationById((proj as any).recommendation_id);
          if (recRes && recRes.recommendation) {
            setRecommendationDetail(recRes.recommendation);
          }
        }
      } catch (err) {
        console.error("Error loading project detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.projectId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-textSecondary">
          <Loader2 className="w-8 h-8 animate-spin text-primaryBlue" />
          <span className="text-sm font-semibold">Loading live project data from database...</span>
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="p-8 text-center space-y-4">
          <h2 className="text-lg font-bold text-govNavy">Project Not Found</h2>
          <p className="text-xs text-textSecondary">Requested project ID could not be loaded from database.</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-primaryBlue text-white text-xs font-bold rounded">
            Back to Projects
          </button>
        </div>
      </AppShell>
    );
  }

  const payments = relationalData?.payments || [];
  const evidence = relationalData?.evidence || [];
  const documents = relationalData?.documents || [];
  const inspections = relationalData?.inspections || [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex items-center gap-3 border-b border-govBorder pb-4">
          <button onClick={() => router.back()} className="p-1.5 bg-govBg border border-govBorder rounded text-textSecondary hover:text-govNavy">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-govNavy">{project.projectCode}</span>
              <StatusBadge status={project.status} />
              <StatusBadge priority={project.priority} />
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-900 border border-blue-200">
                {project.provenance}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight mt-0.5">{project.workName}</h1>
          </div>
          <button 
            onClick={() => router.push('/verification-queue')}
            className="bg-darkNavy hover:bg-govNavy text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Verification Queue</span>
          </button>
        </div>

        {/* Lifecycle Timeline */}
        <div className="gov-card p-4">
          <div className="flex justify-between items-center text-xs font-bold text-textSecondary overflow-x-auto">
            {['RECOMMENDED', 'UNDER_REVIEW', 'SANCTIONED', 'ASSIGNED', 'IN_PROGRESS', 'VERIFICATION_PENDING', 'VERIFIED', 'COMPLETED', 'CLOSED'].map((st, idx) => (
              <div key={st} className="flex flex-col items-center min-w-[70px]">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                  st === project.status ? 'bg-primaryBlue text-white font-bold ring-2 ring-primaryBlue/30' : 'bg-govBg border border-govBorder text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                <span className="text-[10px] mt-1 font-semibold text-govNavy hidden md:block">{st.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-govBorder text-xs font-bold">
          {(['overview', 'relational', 'risk', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === tab ? 'border-primaryBlue text-primaryBlue bg-white' : 'border-transparent text-textSecondary hover:text-govNavy'
              }`}
            >
              {tab === 'relational' ? `Relational Data (${payments.length + evidence.length + documents.length + inspections.length})` : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* CORE REQUIREMENT: RECOMMENDATION INFORMATION BLOCK */}
              <div className="gov-card p-5 space-y-3 bg-blue-50/50 border border-blue-200 rounded-2xl">
                <h3 className="text-sm font-bold text-govNavy flex items-center gap-2 border-b border-blue-200 pb-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Recommendation Information</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-textSecondary block font-medium">Recommended By (MP Name):</span>
                    <strong className="text-govNavy text-sm font-bold">{recommendationDetail?.mp_name || project.mpName || 'Demo MP 013'}</strong>
                  </div>
                  <div>
                    <span className="text-textSecondary block font-medium">Recommended On (Date):</span>
                    <strong className="text-govNavy font-bold">{recommendationDetail?.recommended_at ? new Date(recommendationDetail.recommended_at).toLocaleDateString('en-IN') : (project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN') : '2026-09-20')}</strong>
                  </div>
                  <div>
                    <span className="text-textSecondary block font-medium">Constituency:</span>
                    <strong className="text-govNavy font-bold">{recommendationDetail?.constituency_name || project.constituencyName || 'Constituency C001'}</strong>
                  </div>
                  <div>
                    <span className="text-textSecondary block font-medium">Recommendation Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {recommendationDetail?.status || project.status || 'SANCTIONED'}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <span className="text-textSecondary block font-medium">Justification:</span>
                    <p className="text-govNavy text-xs font-medium italic mt-0.5">
                      "{recommendationDetail?.justification || (project as any).justification || 'High public demand for essential community infrastructure development.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Standard Project Overview */}
              <div className="gov-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-govNavy border-b border-govBorder pb-2">Project Technical Overview</h3>
                <p className="text-xs text-textPrimary leading-relaxed">{project.description || "Official MPLADS Scheme Work."}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-2">
                  <div>
                    <span className="text-textSecondary block font-medium">Allocation Reference</span>
                    <strong className="text-blue-600 font-mono font-bold">{project.allocationId || 'ALLOC-SYN-0013'}</strong>
                  </div>
                  <div>
                    <span className="text-textSecondary block font-medium">District</span>
                    <strong className="text-govNavy">{project.districtName || project.districtId}</strong>
                  </div>
                  <div>
                    <span className="text-textSecondary block font-medium">Implementing Agency</span>
                    <strong className="text-govNavy">{project.agencyName || project.agencyId || 'Unassigned'}</strong>
                  </div>
                  <div>
                    <span className="text-textSecondary block font-medium">Sector</span>
                    <strong className="text-govNavy">{project.sector}</strong>
                  </div>
                  <div>
                    <span className="text-textSecondary block font-medium">Sanctioned Amount</span>
                    <strong className="text-govNavy text-sm">₹{((project.sanctionedCost ?? 0)/100000).toFixed(2)} Lakh</strong>
                  </div>
                  <div>
                    <span className="text-textSecondary block font-medium">Actual Expenditure</span>
                    <strong className="text-primaryBlue text-sm">₹{(project.actualExpenditure/100000).toFixed(2)} Lakh</strong>
                  </div>
                  <div>
                    <span className="text-textSecondary block font-medium">Progress (Phys / Fin)</span>
                    <strong className="text-emerald-700">{project.physicalProgress}% / {project.financialProgress}%</strong>
                  </div>
                </div>

                {/* Relational Quick Counters */}
                <div className="pt-4 border-t border-govBorder grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-govBg rounded border border-govBorder">
                    <span className="block font-bold text-govNavy text-sm">{payments.length}</span>
                    <span className="text-[10px] text-textSecondary">Payments</span>
                  </div>
                  <div className="p-2 bg-govBg rounded border border-govBorder">
                    <span className="block font-bold text-govNavy text-sm">{documents.length}</span>
                    <span className="text-[10px] text-textSecondary">Documents</span>
                  </div>
                  <div className="p-2 bg-govBg rounded border border-govBorder">
                    <span className="block font-bold text-govNavy text-sm">{evidence.length}</span>
                    <span className="text-[10px] text-textSecondary">Evidence Files</span>
                  </div>
                  <div className="p-2 bg-govBg rounded border border-govBorder">
                    <span className="block font-bold text-govNavy text-sm">{inspections.length}</span>
                    <span className="text-[10px] text-textSecondary">Inspections</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <TrustAssessment trustScore={project.trustScore} verificationAssessment={project.priority === 'HIGH_PRIORITY' ? "Requires Field Verification" : "Normal Verification"} />
            </div>
          </div>
        )}

        {activeTab === 'relational' && (
          <div className="space-y-6 text-xs">
            {/* Payments */}
            <div className="gov-card p-5 space-y-3">
              <h4 className="font-bold text-govNavy flex items-center gap-2 text-sm border-b border-govBorder pb-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Expenditure Payments ({payments.length})</span>
              </h4>
              {payments.length === 0 ? (
                <p className="text-textSecondary">No payment records linked to this project.</p>
              ) : (
                <div className="divide-y divide-govBorder">
                  {payments.map((p: any) => (
                    <div key={p.id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-govNavy mr-2">{p.payment_ref}</span>
                        <span className="text-textSecondary">{p.remarks || 'Disbursement'}</span>
                      </div>
                      <div className="text-right font-bold text-primaryBlue">
                        ₹{(p.amount / 100000).toFixed(2)} Lakh ({p.payment_date})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="gov-card p-5 space-y-3">
              <h4 className="font-bold text-govNavy flex items-center gap-2 text-sm border-b border-govBorder pb-2">
                <FileText className="w-4 h-4 text-primaryBlue" />
                <span>Sanction & Work Order Documents ({documents.length})</span>
              </h4>
              {documents.length === 0 ? (
                <p className="text-textSecondary">No documents uploaded for this project.</p>
              ) : (
                <div className="divide-y divide-govBorder">
                  {documents.map((d: any) => (
                    <div key={d.id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-govNavy mr-2">{d.doc_code}</span>
                        <span className="font-medium text-textPrimary">{d.doc_type}</span>
                      </div>
                      <span className="text-textSecondary font-mono">{d.file_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evidence Files */}
            <div className="gov-card p-5 space-y-3">
              <h4 className="font-bold text-govNavy flex items-center gap-2 text-sm border-b border-govBorder pb-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <span>Site Progress Evidence Photographs ({evidence.length})</span>
              </h4>
              {evidence.length === 0 ? (
                <p className="text-textSecondary">No evidence photographs submitted for this project.</p>
              ) : (
                <div className="divide-y divide-govBorder">
                  {evidence.map((e: any) => (
                    <div key={e.id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-govNavy mr-2">{e.evidence_code}</span>
                        <span className="text-textSecondary">{e.file_name}</span>
                      </div>
                      <span className="gov-badge bg-emerald-100 text-statusGreen border border-emerald-200">
                        {e.verification_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Field Inspections */}
            <div className="gov-card p-5 space-y-3">
              <h4 className="font-bold text-govNavy flex items-center gap-2 text-sm border-b border-govBorder pb-2">
                <ClipboardCheck className="w-4 h-4 text-primaryBlue" />
                <span>Field Inspections ({inspections.length})</span>
              </h4>
              {inspections.length === 0 ? (
                <p className="text-textSecondary">No field inspection reports filed for this project.</p>
              ) : (
                <div className="divide-y divide-govBorder">
                  {inspections.map((i: any) => (
                    <div key={i.id} className="py-2 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="font-mono text-govNavy">{i.inspection_code}</span>
                        <span className="text-emerald-700">{i.verification_outcome} ({i.inspection_date})</span>
                      </div>
                      <p className="text-textSecondary text-[11px]">{i.observed_condition || i.officer_remarks}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrustAssessment trustScore={project.trustScore} verificationAssessment={project.priority === 'HIGH_PRIORITY' ? "Requires Field Verification" : "Normal Verification"} />
              <AnomalyRadar />
            </div>
            <ExplainableAIPanel />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="gov-card p-5">
            <h3 className="text-sm font-bold text-govNavy mb-4">Governance Audit Log</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-govBg border border-govBorder rounded flex justify-between items-start">
                <div>
                  <span className="font-bold text-govNavy">PROJECT RECORD INITIALIZED</span>
                  <p className="text-textSecondary mt-0.5">Ingested canonical project record from database.</p>
                </div>
                <span className="text-textSecondary text-[11px] font-mono">{project.createdAt}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
