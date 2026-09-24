"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PlusCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function NewProjectRecommendation() {
  const router = useRouter();
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `MPLADS-2026-DEL01-00${Math.floor(Math.random() * 900 + 100)}`;
    setSubmittedCode(code);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 border-b border-govBorder pb-4">
          <button onClick={() => router.back()} className="p-1.5 bg-govBg border border-govBorder rounded text-textSecondary hover:text-govNavy">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">MP Work Recommendation Form</h1>
            <p className="text-xs text-textSecondary">Submit new work recommendation for District Authority review.</p>
          </div>
        </div>

        {submittedCode ? (
          <div className="gov-card p-6 bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-bold text-emerald-900">Work Recommendation Submitted Successfully</h2>
            <p className="text-xs text-emerald-800">
              Generated Project Code: <strong className="font-mono text-sm">{submittedCode}</strong>
            </p>
            <p className="text-xs text-textSecondary">Next Step: District Authority technical & budget review queue.</p>
            <div className="pt-3">
              <button 
                onClick={() => router.push('/projects')}
                className="bg-primaryBlue text-white text-xs font-bold px-4 py-2 rounded hover:bg-govNavy"
              >
                Return to Projects Register
              </button>
            </div>
          </div>
        ) : (
          <div className="gov-card p-6">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-textPrimary mb-1">Work Name *</label>
                <input required type="text" placeholder="e.g. Construction of Community Water Filter Plant" className="w-full p-2 bg-govBg border border-govBorder rounded text-xs" />
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">Description</label>
                <textarea rows={3} placeholder="Provide details of location and scope of work..." className="w-full p-2 bg-govBg border border-govBorder rounded text-xs" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">District</label>
                  <input type="text" defaultValue="North Delhi (DL-01)" disabled className="w-full p-2 bg-gray-100 border border-govBorder rounded text-xs text-textSecondary" />
                </div>
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Constituency</label>
                  <input type="text" defaultValue="North Delhi MP Constituency" disabled className="w-full p-2 bg-gray-100 border border-govBorder rounded text-xs text-textSecondary" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Sector *</label>
                  <select required className="w-full p-2 bg-govBg border border-govBorder rounded text-xs">
                    <option value="Rural Electrification">Rural Electrification</option>
                    <option value="Drinking Water Sanitation">Drinking Water & Sanitation</option>
                    <option value="Education & Skill">Education & Skill Development</option>
                    <option value="Healthcare">Healthcare Infrastructure</option>
                    <option value="Roads & Bridges">Roads & Bridges</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Estimated Cost (INR) *</label>
                  <input required type="number" min={0} placeholder="e.g. 2500000" className="w-full p-2 bg-govBg border border-govBorder rounded text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Latitude (Optional)</label>
                  <input type="number" step="any" placeholder="e.g. 28.6139" className="w-full p-2 bg-govBg border border-govBorder rounded text-xs" />
                </div>
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Longitude (Optional)</label>
                  <input type="number" step="any" placeholder="e.g. 77.2090" className="w-full p-2 bg-govBg border border-govBorder rounded text-xs" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-govBorder">
                <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-govBg border border-govBorder text-textPrimary text-xs font-semibold rounded hover:bg-gray-100">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-primaryBlue hover:bg-govNavy text-white text-xs font-bold rounded">
                  Submit Work Recommendation
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
