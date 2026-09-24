export type ProjectStatus =
  | 'RECOMMENDED'
  | 'UNDER_REVIEW'
  | 'CLARIFICATION_REQUIRED'
  | 'SANCTIONED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'VERIFICATION_PENDING'
  | 'VERIFIED'
  | 'COMPLETED'
  | 'CLOSED';

export type VerificationPriority = 'NORMAL' | 'ATTENTION' | 'HIGH_PRIORITY';

export interface Project {
  id: string;
  projectCode: string;
  workName: string;
  description?: string;
  allocationId?: string;
  mpName?: string;
  districtId: string;
  districtName?: string;
  constituencyId: string;
  constituencyName?: string;
  agencyId?: string;
  agencyName?: string;
  sector: string;
  estimatedCost: number;
  sanctionedCost?: number;
  actualExpenditure: number;
  physicalProgress: number;
  financialProgress: number;
  status: ProjectStatus;
  priority: VerificationPriority;
  trustScore: number;
  explanation?: string;
  latitude?: number;
  longitude?: number;
  provenance?: string;
  createdAt: string;
  updatedAt: string;
}


export interface AnomalyFinding {
  reasonCode: string;
  severity: VerificationPriority;
  explanation: string;
  affectedField?: string;
  recommendedAction: string;
}

export interface TrustAssessmentData {
  projectId: string;
  projectCode: string;
  trustScore: number;
  verificationAssessment: string;
  totalSignalsCount: number;
  findings: AnomalyFinding[];
  radarFactors: Record<string, string>;
  explanationHeadline: string;
  disclaimer: string;
}
