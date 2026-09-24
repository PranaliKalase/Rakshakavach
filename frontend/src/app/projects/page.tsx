"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { PlusCircle, Search, Eye, Filter, Loader2 } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchProjects(500);
        setProjects(data);
      } catch (err) {
        console.error("Error loading projects list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = projects.filter(p => {
    const matchesSearch = p.workName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-govBorder pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">MPLADS Projects Register</h1>
            <p className="text-xs text-textSecondary mt-0.5">Comprehensive repository of all recommended, sanctioned, and active works (Live Database Connected).</p>
          </div>
          <Link
            href="/dashboard/mp/recommended"
            className="bg-primaryBlue hover:bg-govNavy text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Recommend New Project</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="gov-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-textSecondary absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, code or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-govBg border border-govBorder rounded focus:outline-none focus:border-primaryBlue"
            />
          </div>

          <div className="flex items-center gap-3 text-xs w-full md:w-auto">
            <Filter className="w-4 h-4 text-textSecondary" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 bg-govBg border border-govBorder rounded text-xs font-semibold"
            >
              <option value="">All Statuses ({projects.length})</option>
              <option value="RECOMMENDED">Recommended</option>
              <option value="SANCTIONED">Sanctioned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Projects Table */}
        <div className="gov-card p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-textSecondary gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primaryBlue" />
              <span className="text-xs font-semibold">Loading 500 project records from Supabase...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-govBg text-textSecondary uppercase font-semibold text-[10px] border-b border-govBorder">
                  <tr>
                    <th className="p-3">Project Code</th>
                    <th className="p-3">Work Name</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Sanctioned Cost</th>
                    <th className="p-3">Physical %</th>
                    <th className="p-3">Financial %</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govBorder">
                  {filtered.slice(0, 50).map((p) => (
                    <tr key={p.id} className="hover:bg-govBg/50">
                      <td className="p-3 font-mono font-semibold text-govNavy">{p.projectCode}</td>
                      <td className="p-3 font-medium text-textPrimary">{p.workName}</td>
                      <td className="p-3 text-textSecondary">{p.sector}</td>
                      <td className="p-3 font-bold text-govNavy">₹{(((p.sanctionedCost || p.estimatedCost || 0))/100000).toFixed(2)} L</td>
                      <td className="p-3 font-bold">{p.physicalProgress}%</td>
                      <td className="p-3 font-bold text-primaryBlue">{p.financialProgress}%</td>
                      <td className="p-3"><StatusBadge status={p.status} /></td>
                      <td className="p-3"><StatusBadge priority={p.priority} /></td>
                      <td className="p-3 text-right">
                        <Link href={`/projects/${p.id}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-govBg border border-govBorder hover:border-primaryBlue text-govNavy rounded font-semibold text-[11px]">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-govBg/50 border-t border-govBorder text-right text-[11px] text-textSecondary font-semibold">
                Showing {Math.min(50, filtered.length)} of {filtered.length} matching project records
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
