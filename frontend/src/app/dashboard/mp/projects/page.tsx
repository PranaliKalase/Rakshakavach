"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MPSelector } from '@/components/ui/MPSelector';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEMO_USERS } from '@/lib/constants';
import { Search, Filter, Loader2, ArrowRight, FolderKanban, PlusCircle } from 'lucide-react';

export default function MPProjectsPage() {
  const [activeMpName, setActiveMpName] = useState<string>("Demo MP 013");
  const [activeConstituency, setActiveConstituency] = useState<string>("Maharashtra Demo Parliamentary Constituency 13");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rakshakavach_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.mpName) {
          setActiveMpName(u.mpName);
          if (u.constituencyName) setActiveConstituency(u.constituencyName);
        }
      }
    } catch (e) {}
  }, []);

  const loadProjects = async (mpName: string) => {
    try {
      setLoading(true);
      const data = await fetchProjects({ role: 'MP', mpName: mpName });
      setProjects(data);
      setFilteredProjects(data);
    } catch (err) {
      console.error("Failed to load MP projects list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(activeMpName);
  }, [activeMpName]);

  const handleMPChange = (newMpName: string, newConstName: string) => {
    setActiveMpName(newMpName);
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

  useEffect(() => {
    let filtered = projects;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.projectCode.toLowerCase().includes(q) || 
        p.workName.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q)
      );
    }
    if (selectedSector !== 'ALL') {
      filtered = filtered.filter(p => p.sector === selectedSector);
    }
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    if (selectedPriority !== 'ALL') {
      filtered = filtered.filter(p => p.priority === selectedPriority);
    }
    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedSector, selectedStatus, selectedPriority, projects]);

  const sectors = Array.from(new Set(projects.map(p => p.sector))).filter(Boolean);
  const statuses = Array.from(new Set(projects.map(p => p.status))).filter(Boolean);
  const priorities = Array.from(new Set(projects.map(p => p.priority))).filter(Boolean);

  const totalRecords = filteredProjects.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-600" />
              <span>My Projects Register — {activeMpName}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing project records for {activeConstituency} ({totalRecords} records)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <MPSelector currentMpName={activeMpName} onMPChange={handleMPChange} />
            <Link
              href="/dashboard/mp/recommend"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Recommend New Work</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by code, work name, sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Sector Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Sector:</span>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
              >
                <option value="ALL">All Sectors</option>
                {sectors.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
              >
                <option value="ALL">All Statuses</option>
                {statuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
              <span>Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
              >
                <option value="ALL">All Priorities</option>
                {priorities.map(pr => (
                  <option key={pr} value={pr}>{pr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live MP Projects Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Loading project portfolio for {activeMpName}...</span>
            </div>
          ) : paginatedProjects.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No project records found matching current filters for {activeMpName}.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Project Code</th>
                      <th className="p-3.5">Work Name</th>
                      <th className="p-3.5">Sector</th>
                      <th className="p-3.5">Sanctioned Amount</th>
                      <th className="p-3.5">Physical Progress</th>
                      <th className="p-3.5">Financial Progress</th>
                      <th className="p-3.5">Trust Score</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paginatedProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-blue-600">
                          {p.projectCode}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 max-w-xs truncate">
                          <Link href={`/projects/${p.id}`} className="hover:underline hover:text-blue-600">
                            {p.workName}
                          </Link>
                        </td>
                        <td className="p-3.5 text-slate-600">{p.sector}</td>
                        <td className="p-3.5 font-semibold text-slate-900">
                          ₹{((p.sanctionedCost ?? 0) / 100000).toFixed(2)} Lakh
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900">{p.physicalProgress}%</td>
                        <td className="p-3.5 font-semibold text-slate-900">{p.financialProgress}%</td>
                        <td className="p-3.5">
                          <span className={`font-bold px-2 py-0.5 rounded ${
                            p.trustScore >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {p.trustScore}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <StatusBadge priority={p.priority} />
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold">
                            {p.status || 'SANCTIONED'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <Link 
                            href={`/projects/${p.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors text-xs"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Pagination Bar */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                <div>
                  Showing {startIndex + 1}–{endIndex} of {totalRecords} project records for {activeMpName}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-100 transition-colors"
                  >
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-100 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
