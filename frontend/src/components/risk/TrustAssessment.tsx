import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

interface TrustBreakdown {
  financial_score?: number;
  timeline_score?: number;
  evidence_score?: number;
  document_score?: number;
  peer_score?: number;
  geospatial_score?: number;
}

interface TrustAssessmentProps {
  trustScore: number;
  verificationAssessment: string;
  trustBreakdown?: TrustBreakdown;
}

export const TrustAssessment: React.FC<TrustAssessmentProps> = ({
  trustScore,
  verificationAssessment,
  trustBreakdown
}) => {
  const isHealthy = trustScore >= 80;

  const factors = [
    { label: "Financial Consistency", weight: "25%", score: trustBreakdown?.financial_score ?? (isHealthy ? 90 : 55) },
    { label: "Timeline Progress", weight: "15%", score: trustBreakdown?.timeline_score ?? 85 },
    { label: "Evidence Integrity", weight: "20%", score: trustBreakdown?.evidence_score ?? (isHealthy ? 95 : 40) },
    { label: "Document Compliance", weight: "15%", score: trustBreakdown?.document_score ?? 100 },
    { label: "Peer Benchmark", weight: "15%", score: trustBreakdown?.peer_score ?? (isHealthy ? 88 : 50) },
    { label: "Geospatial Alignment", weight: "10%", score: trustBreakdown?.geospatial_score ?? 100 },
  ];

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{score.toFixed(0)}/100</span>;
    if (score >= 60) return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{score.toFixed(0)}/100</span>;
    return <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">{score.toFixed(0)}/100</span>;
  };

  return (
    <div className="gov-card p-5">
      <div className="flex items-center justify-between pb-3 border-b border-govBorder">
        <div>
          <h3 className="text-sm font-bold text-govNavy uppercase tracking-wider">6-Factor Trust Score Assessment</h3>
          <p className="text-[11px] text-textSecondary">Weighted multi-dimension calculation across 6 governance metrics.</p>
        </div>
        <StatusBadge priority={isHealthy ? 'NORMAL' : 'HIGH_PRIORITY'} text={verificationAssessment} />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
        {/* Score Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-govBorder bg-govBg flex-shrink-0">
          <div className="text-center">
            <span className={`text-3xl font-black ${isHealthy ? 'text-emerald-700' : 'text-statusRed'}`}>
              {trustScore.toFixed(0)}
            </span>
            <span className="text-[10px] text-textSecondary block font-bold">/ 100</span>
          </div>
        </div>

        {/* 6 Factors Breakdown Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs w-full">
          {factors.map((item, idx) => (
            <div key={idx} className="p-2 bg-govBg/60 rounded border border-govBorder/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-textPrimary text-[11px] block">{item.label}</span>
                <span className="text-[10px] text-textSecondary font-mono">Weight: {item.weight}</span>
              </div>
              {getScoreBadge(item.score)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-2.5 flex items-start gap-2 text-[11px] text-blue-900">
        <ShieldCheck className="w-4 h-4 text-primaryBlue flex-shrink-0 mt-0.5" />
        <span>
          <strong>Disclaimer:</strong> This score helps prioritize verification. It is not proof of wrongdoing. Confirm information against official records before making administrative decisions.
        </span>
      </div>
    </div>
  );
};
