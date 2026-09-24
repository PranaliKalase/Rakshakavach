"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MPSelector } from '@/components/ui/MPSelector';
import { createRecommendation } from '@/lib/api';
import { DEMO_USERS } from '@/lib/constants';
import { PlusCircle, ArrowLeft, CheckCircle2, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function MPRecommendPage() {
  const [activeMpName, setActiveMpName] = useState<string>("Demo MP 013");
  const [activeConstituency, setActiveConstituency] = useState<string>("Maharashtra Demo Parliamentary Constituency 13");
  const [activeConstituencyId, setActiveConstituencyId] = useState<string>("C001");
  const [activeDistrict, setActiveDistrict] = useState<string>("D007");
  const [activeUserId, setActiveUserId] = useState<string>("USER-MP-013");
  const [activeUserName, setActiveUserName] = useState<string>("Demo MP 013");

  const [formData, setFormData] = useState({
    workTitle: '',
    description: '',
    sector: 'Education',
    estimatedCost: '',
    village: '',
    taluka: '',
    district: 'D007',
    state: 'Maharashtra',
    expectedBeneficiaries: '',
    justification: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rakshakavach_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.mpName) {
          setActiveMpName(u.mpName);
          setActiveUserName(u.fullName || u.mpName);
          if (u.id) setActiveUserId(u.id);
          if (u.constituencyName) setActiveConstituency(u.constituencyName);
          if (u.constituencyId) setActiveConstituencyId(u.constituencyId);
          if (u.districtId) {
            setActiveDistrict(u.districtId);
            setFormData(prev => ({ ...prev, district: u.districtId }));
          }
        }
      }
    } catch (e) {}
  }, []);

  const handleMPChange = (newMpName: string, newConstName: string) => {
    setActiveMpName(newMpName);
    setActiveUserName(newMpName);
    setActiveConstituency(newConstName);
    try {
      const updatedUser = {
        ...DEMO_USERS.MP,
        fullName: newMpName,
        mpName: newMpName,
        constituencyName: newConstName
      };
      localStorage.setItem('rakshakavach_user', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workTitle.trim() || !formData.estimatedCost) {
      setError("Please enter the Work Title and Estimated Cost.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Automatic metadata capture
      const submissionTimestamp = new Date().toISOString();
      const payload = {
        project_title: formData.workTitle,
        project_description: formData.description,
        sector: formData.sector,
        estimated_cost: parseFloat(formData.estimatedCost),
        village: formData.village,
        taluka: formData.taluka,
        district: formData.district || activeDistrict,
        state: formData.state,
        constituency_id: activeConstituencyId,
        constituency_name: activeConstituency,
        recommended_by_user_id: activeUserId,
        recommended_by_name: activeUserName,
        recommended_by_role: "MP",
        mp_id: `MP-${absHash(activeMpName)}`,
        mp_name: activeMpName,
        justification: formData.justification,
        expected_beneficiaries: formData.expectedBeneficiaries,
        priority: "MEDIUM"
      };

      // Call API with role MP header
      const res = await createRecommendation(payload, "MP");
      setSubmittedResult({
        ...res,
        submissionTimestamp
      });
    } catch (err: any) {
      console.error("Recommendation submission error:", err);
      setError(err.message || "Failed to submit recommendation to database.");
    } finally {
      setLoading(false);
    }
  };

  function absHash(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 1000).toString().padStart(3, '0');
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Official MPLADS Work Recommendation Form</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>Recommend New Work</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Permanent database persistence & governance audit trail for {activeConstituency}
            </p>
          </div>

          <MPSelector currentMpName={activeMpName} onMPChange={handleMPChange} />
        </div>

        {submittedResult ? (
          <div className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-sm text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Work Recommendation Persisted in Database</h2>
              <p className="text-xs text-slate-500 mt-1">
                Recommendation ID: <strong className="font-mono text-blue-600 text-sm">{submittedResult.recommendation_id}</strong>
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl text-left space-y-2 font-medium">
              <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Automated System Metadata</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <p><strong>Recommended By MP:</strong> {submittedResult.mp_name}</p>
                <p><strong>Constituency:</strong> {submittedResult.constituency_name}</p>
                <p><strong>District / State:</strong> {submittedResult.district}, {submittedResult.state}</p>
                <p><strong>Submission Timestamp:</strong> {submittedResult.submissionTimestamp || submittedResult.created_at}</p>
                <p><strong>User ID / Role:</strong> {submittedResult.recommended_by_user_id} ({submittedResult.recommended_by_role})</p>
                <p><strong>Workflow Status:</strong> <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">{submittedResult.status}</span></p>
              </div>

              <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 pt-2">Recommendation Details</h4>
              <p><strong>Work Title:</strong> {submittedResult.project_title}</p>
              <p><strong>Sector:</strong> {submittedResult.sector}</p>
              <p><strong>Estimated Cost:</strong> ₹{Number(submittedResult.estimated_cost).toLocaleString('en-IN')}</p>
              <p><strong>Location:</strong> {submittedResult.village ? `${submittedResult.village}, ` : ''}{submittedResult.taluka ? `${submittedResult.taluka}, ` : ''}{submittedResult.district}</p>
              <p><strong>Expected Beneficiaries:</strong> {submittedResult.expected_beneficiaries}</p>
              <p><strong>Justification:</strong> {submittedResult.justification}</p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSubmittedResult(null);
                  setFormData({
                    workTitle: '',
                    description: '',
                    sector: 'Education',
                    estimatedCost: '',
                    village: '',
                    taluka: '',
                    district: activeDistrict,
                    state: 'Maharashtra',
                    expectedBeneficiaries: '',
                    justification: ''
                  });
                }}
                className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Submit Another Work Recommendation
              </button>
              <Link
                href="/dashboard/mp"
                className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-200 transition-colors"
              >
                Back to MP Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* AUTOMATIC METADATA DISPLAY BANNER (NO MANUAL ENTRY FOR MP NAME) */}
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Automated MP Metadata Scoping</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-200 text-blue-800 rounded">Auto-Populated Profile</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-blue-950 font-semibold pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">Logged-in MP Name:</span>
                  <span className="font-bold text-slate-900">{activeMpName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Constituency:</span>
                  <span className="font-bold text-slate-900">{activeConstituency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">District & State Context:</span>
                  <span className="font-bold text-slate-900">{formData.district}, {formData.state}</span>
                </div>
              </div>
            </div>

            {/* Work Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Title / Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Construction of Community Water Storage Tank & Pumping Station"
                value={formData.workTitle}
                onChange={(e) => setFormData({ ...formData, workTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
              />
            </div>

            {/* Sector, Estimated Cost, Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sector *
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
                >
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Water Resources">Water Resources</option>
                  <option value="Roads & Bridges">Roads & Bridges</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Public Infrastructure">Public Infrastructure</option>
                  <option value="Rural Development">Rural Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Cost (in ₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  placeholder="e.g. 2500000"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Village, Taluka, State */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Village / Gram Panchayat
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rampur Gram Panchayat"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Taluka / Tehsil
                </label>
                <input
                  type="text"
                  placeholder="e.g. Haveli Taluka"
                  value={formData.taluka}
                  onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Scope & Technical Description
              </label>
              <textarea
                rows={3}
                placeholder="Provide detailed work scope, technical specifications, and proposed execution timelines..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium text-slate-900"
              />
            </div>

            {/* Expected Beneficiaries & Justification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Beneficiaries
                </label>
                <input
                  type="text"
                  placeholder="e.g. Approx. 12,000 residents across 4 adjoining villages"
                  value={formData.expectedBeneficiaries}
                  onChange={(e) => setFormData({ ...formData, expectedBeneficiaries: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Justification / Public Need
                </label>
                <input
                  type="text"
                  placeholder="e.g. High public demand raised during Panchayat Gram Sabha"
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                Recommendation will be stored permanently with default status RECOMMENDED_BY_MP.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Persisting to Database...</span>
                  </>
                ) : (
                  <span>Submit Work Recommendation</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
