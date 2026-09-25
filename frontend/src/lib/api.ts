import { Project } from '@/types/project';

export type NormalizedProject = Project & { [key: string]: any };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface FetchProjectsOptions {
  role?: string;
  mpName?: string;
  districtId?: string;
  agencyId?: string;
  status?: string;
  sector?: string;
  priority?: string;
  search?: string;
  limit?: number;
  provenance?: string;
}

export async function fetchProjects(optsOrLimit: number | FetchProjectsOptions = {}): Promise<Project[]> {
  try {
    const options: FetchProjectsOptions = typeof optsOrLimit === 'number' ? { limit: optsOrLimit } : optsOrLimit;
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.role) params.append('role', options.role);
    if (options.mpName) params.append('mp_name', options.mpName);
    if (options.districtId) params.append('district_id', options.districtId);
    if (options.agencyId) params.append('agency_id', options.agencyId);
    if (options.status) params.append('status', options.status);
    if (options.sector) params.append('sector', options.sector);
    if (options.priority) params.append('priority', options.priority);
    if (options.search) params.append('search', options.search);
    if (options.provenance) params.append('provenance', options.provenance);

    const url = `${API_BASE_URL}/projects?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.statusText}`);
    }
    const data = await res.json();
    return data.map((p: any) => normalizeProject(p));
  } catch (err) {
    console.error("API error in fetchProjects:", err);
    return [];
  }
}

export async function fetchMPSummary(mpName: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/mp/summary?mp_name=${encodeURIComponent(mpName)}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch MP summary for ${mpName}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API error in fetchMPSummary(${mpName}):`, err);
    return null;
  }
}

export async function fetchMPList(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/mp/list`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch MP list: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("API error in fetchMPList:", err);
    return [];
  }
}

// ----------------------------------------------------
// MP RECOMMENDATIONS API ENDPOINTS
// ----------------------------------------------------

export interface CreateRecommendationPayload {
  project_title: string;
  project_description?: string;
  sector: string;
  estimated_cost: number;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  constituency_id?: string;
  constituency_name?: string;
  recommended_by_user_id?: string;
  recommended_by_name?: string;
  recommended_by_role?: string;
  mp_id?: string;
  mp_name?: string;
  justification?: string;
  expected_beneficiaries?: string;
  priority?: string;
  evidence_file?: string;
  evidence_filename?: string;
}

export async function createRecommendation(payload: CreateRecommendationPayload, userRole: string = "MP"): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': userRole
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Recommendation submission failed (${res.status}): ${errText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error("API error in createRecommendation:", err);
    throw new Error(err?.message && err.message !== "Failed to fetch" ? err.message : "Unable to connect to RAKSHKAVACH Backend API (http://localhost:8000). Please check your connection.");
  }
}

export async function fetchRecommendations(opts: {
  mpName?: string;
  district?: string;
  status?: string;
  role?: string;
} = {}): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (opts.mpName) params.append('mp_name', opts.mpName);
    if (opts.district) params.append('district', opts.district);
    if (opts.status) params.append('status', opts.status);
    if (opts.role) params.append('role', opts.role);

    const res = await fetch(`${API_BASE_URL}/recommendations?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("API error in fetchRecommendations:", err);
    return [];
  }
}

export async function fetchRecommendationById(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch recommendation ${id}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API error in fetchRecommendationById(${id}):`, err);
    return null;
  }
}

export async function updateRecommendationStatus(
  id: string,
  payload: { status: string; performed_by?: string; performed_role?: string; remarks?: string },
  userRole: string = "DISTRICT_AUTHORITY"
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': userRole
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to update recommendation status: ${errText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API error in updateRecommendationStatus(${id}):`, err);
    throw err;
  }
}

export async function fetchRecommendationsSummary(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations/summary`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch recommendations summary: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("API error in fetchRecommendationsSummary:", err);
    return null;
  }
}

export async function createProject(payload: {
  work_name: string;
  sector: string;
  estimated_cost: number;
  description?: string;
  mp_name?: string;
  constituency_id?: string;
  district_id?: string;
  latitude?: number;
  longitude?: number;
}): Promise<Project | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        work_name: payload.work_name,
        sector: payload.sector,
        estimated_cost: payload.estimated_cost,
        description: payload.description || `MP Recommended Work: ${payload.work_name}`,
        mp_name: payload.mp_name || "Demo MP 013",
        constituency_id: payload.constituency_id || "C007",
        district_id: payload.district_id || "D007",
        latitude: payload.latitude || 21.3554,
        longitude: payload.longitude || 72.7368
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Project recommendation failed: ${errText}`);
    }
    const data = await res.json();
    return normalizeProject(data);
  } catch (err) {
    console.error("API error in createProject:", err);
    return null;
  }
}

export async function queryCopilot(payload: { prompt: string; role?: string; mp_name?: string; project_id?: string }): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Copilot query failed: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("API error in queryCopilot:", err);
    return null;
  }
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch project ${id}: ${res.statusText}`);
    }
    const data = await res.json();
    return normalizeProject(data);
  } catch (err) {
    console.error(`API error in fetchProjectById(${id}):`, err);
    return null;
  }
}

export async function fetchProjectRelational(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(id)}/relational`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch relational data for ${id}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API error in fetchProjectRelational(${id}):`, err);
    return null;
  }
}

export async function fetchProjectRisk(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(id)}/risk`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch risk data for ${id}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API error in fetchProjectRisk(${id}):`, err);
    return null;
  }
}

export async function fetchVerificationQueue(limit: number = 500): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/verification-queue?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch verification queue: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("API error in fetchVerificationQueue:", err);
    return [];
  }
}

export async function submitInspection(projectId: string, payload: {
  officer_id?: string;
  actual_physical_progress: number;
  observed_condition: string;
  is_location_verified?: boolean;
  verification_outcome?: string;
  officer_remarks: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/inspections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Inspection submission failed: ${errText}`);
  }
  return await res.json();
}

export async function recordAuthorityDecision(projectId: string, payload: {
  authority_id?: string;
  decision: string;
  remarks: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Authority decision recording failed: ${errText}`);
  }
  return await res.json();
}

export async function fetchAuditLogs(limit: number = 100): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/audit-logs?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch audit logs: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("API error in fetchAuditLogs:", err);
    return [];
  }
}

// Normalize snake_case or camelCase properties into standard frontend Project type
export function normalizeProject(p: any): Project {
  return {
    id: p.id || p.project_id,
    projectCode: p.project_code || p.projectCode || p.id,
    workName: p.work_name || p.workName || p.project_title || "Untitled Project",
    description: p.description || p.project_description || "",
    allocationId: p.allocation_id || p.allocationId || "",
    mpName: p.mp_name || p.mpName || "Demo MP 013",
    districtId: p.district_id || p.districtId || p.district || "D001",
    districtName: p.district_name || p.districtName || `District ${p.district_id || p.district || 'D001'}`,
    district: p.district || p.district_name || p.districtName || "D001",
    state: p.state || "Maharashtra",
    constituencyId: p.constituency_id || p.constituencyId || "C001",
    constituencyName: p.constituency_name || p.constituencyName || "Constituency C001",
    agencyId: p.agency_id || p.agencyId || "",
    agencyName: p.agency_name || p.agencyName || "",
    sector: p.sector || "Infrastructure",
    estimatedCost: Number(p.estimated_cost || p.estimatedCost || 0),
    sanctionedCost: Number(p.sanctioned_cost || p.sanctionedCost || 0),
    actualExpenditure: Number(p.actual_expenditure || p.actualExpenditure || p.expenditure || 0),
    physicalProgress: Number(p.physical_progress || p.physicalProgress || 0),
    financialProgress: Number(p.financial_progress || p.financialProgress || 0),
    status: p.status || "IN_PROGRESS",
    priority: p.priority || p.verification_priority || "NORMAL",
    trustScore: Number(p.trust_score || p.trustScore || 100),
    explanation: p.explanation || "",
    latitude: p.latitude ? Number(p.latitude) : 21.3554,
    longitude: p.longitude ? Number(p.longitude) : 72.7368,
    evidenceCount: p.evidence_count || (p.evidence_files ? p.evidence_files.length : 8),
    documentCount: p.document_count || (p.documents ? p.documents.length : 4),
    provenance: p.provenance || "OFFICIAL",
    createdAt: p.created_at || p.createdAt || "2026-09-25T00:00:00.000Z",
    updatedAt: p.updated_at || p.updatedAt || "2026-09-25T00:00:00.000Z"
  };
}

export async function updateProjectProgress(projectId: string, payload: {
  physical_progress: number;
  financial_progress: number;
  actual_expenditure: number;
  milestone?: string;
  remarks?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Progress update failed: ${errText}`);
  }
  return await res.json();
}

export async function submitProjectEvidence(projectId: string, payload: {
  file_name?: string;
  evidence_type?: string;
  description?: string;
  location?: string;
  uploaded_by?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Evidence submission failed: ${errText}`);
  }
  return await res.json();
}

export async function submitVerificationResponse(projectId: string, payload: {
  query_id?: string;
  response_text: string;
  supporting_evidence_id?: string;
  submitted_by?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/verification-response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Verification response submission failed: ${errText}`);
  }
  return await res.json();
}

export async function submitProjectCompletion(projectId: string, payload: {
  completion_certificate_file?: string;
  remarks?: string;
  submitted_by?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/completion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Completion submission failed: ${errText}`);
  }
  return await res.json();
}


