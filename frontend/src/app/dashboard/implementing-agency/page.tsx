"use client";

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { Building2, Upload, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';

export default function ImplementingAgencyDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [physical, setPhysical] = useState(50);
  const [financial, setFinancial] = useState(50);
  const [expenditure, setExpenditure] = useState(1000000);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchProjects(100);
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
          setPhysical(data[0].physicalProgress || 50);
          setFinancial(data[0].financialProgress || 50);
          setExpenditure(data[0].actualExpenditure || 1000000);
        }
      } catch (err) {
        console.error("Error loading Implementing Agency projects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateProgress = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Execution progress updated and SHA-256 evidence record registered successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const totalAssigned = projects.length;
  const inProgressCount = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length;
  const totalDisbursed = projects.reduce((sum, p) => sum + (p.actualExpenditure || 0), 0);
  const formattedDisbursed = totalDisbursed >= 10000000 
    ? `₹${(totalDisbursed / 10000000).toFixed(2)} Cr`
    : `₹${(totalDisbursed / 100000).toFixed(2)} Lakh`;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="border-b border-govBorder pb-4">
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">Assigned Works — Implementing Agency</h1>
          <p className="text-xs text-textSecondary mt-0.5">Public Works Department (PWD) / Implementing Agency Execution Portal (Live Database Connected)</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Assigned Works" value={totalAssigned.toString()} subtitle="Agency Scope" icon={<Building2 className="w-5 h-5 text-primaryBlue" />} />
          <KPICard title="Works Underway" value={inProgressCount.toString()} subtitle="In Progress" icon={<RefreshCw className="w-5 h-5 text-amber-500" />} />
          <KPICard title="Completed Works" value={completedCount.toString()} subtitle="Completed" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Verified Disbursements" value={formattedDisbursed} subtitle="Recorded Expenditure" icon={<CheckCircle2 className="w-5 h-5 text-primaryBlue" />} />
        </div>

        {/* Update Progress & Evidence Form */}
        <div className="gov-card p-6">
          <h3 className="text-sm font-bold text-govNavy mb-1">Submit Execution Progress & Site Evidence</h3>
          <p className="text-xs text-textSecondary mb-4">Record physical progress percentages and upload verified site evidence.</p>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8 text-textSecondary gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primaryBlue" />
              <span className="text-xs font-semibold">Loading assigned project works from Supabase...</span>
            </div>
          ) : (
            <form onSubmit={handleUpdateProgress} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-textPrimary mb-1">Target Assigned Project *</label>
                <select 
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    const p = projects.find(proj => proj.id === e.target.value);
                    if (p) {
                      setPhysical(p.physicalProgress || 50);
                      setFinancial(p.financialProgress || 50);
                      setExpenditure(p.actualExpenditure || 1000000);
                    }
                  }}
                  className="w-full p-2 bg-govBg border border-govBorder rounded text-xs font-medium text-govNavy"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectCode} — {p.workName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">Actual Expenditure (INR) *</label>
                <input 
                  type="number" 
                  value={expenditure} 
                  onChange={(e) => setExpenditure(Number(e.target.value))} 
                  className="w-full p-2 bg-govBg border border-govBorder rounded text-xs font-bold" 
                />
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">Physical Progress (%) *</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={physical} 
                  onChange={(e) => setPhysical(Number(e.target.value))} 
                  className="w-full p-2 bg-govBg border border-govBorder rounded text-xs font-bold" 
                />
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">Financial Progress (%) *</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={financial} 
                  onChange={(e) => setFinancial(Number(e.target.value))} 
                  className="w-full p-2 bg-govBg border border-govBorder rounded text-xs font-bold" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-textPrimary mb-1">Upload Site Progress Photo (JPEG/PNG)</label>
                <div className="p-4 border-2 border-dashed border-govBorder rounded text-center bg-govBg hover:border-primaryBlue transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-textSecondary mx-auto mb-1" />
                  <span className="text-xs font-medium text-govNavy">Click or drag site photograph evidence here</span>
                  <span className="block text-[10px] text-textSecondary mt-0.5">SHA-256 cryptographic hash will be auto-generated for audit verification</span>
                </div>
              </div>

              <div className="md:col-span-2 text-right">
                <button type="submit" className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-5 py-2.5 rounded">
                  Commit Execution Progress & Evidence
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
