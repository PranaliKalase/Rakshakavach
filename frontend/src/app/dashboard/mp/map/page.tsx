"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MPSelector } from '@/components/ui/MPSelector';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { DEMO_USERS } from '@/lib/constants';
import { Map, MapPin, Loader2, ArrowRight } from 'lucide-react';

export default function MPMapPage() {
  const [activeMpName, setActiveMpName] = useState<string>("Demo MP 013");
  const [activeConstituency, setActiveConstituency] = useState<string>("Maharashtra Demo Parliamentary Constituency 13");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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

  const loadMapData = async (mpName: string) => {
    try {
      setLoading(true);
      const data = await fetchProjects({ role: 'MP', mpName: mpName });
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0]);
      else setSelectedProject(null);
    } catch (err) {
      console.error("Failed to load map projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData(activeMpName);
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

  const totalProjects = projects.length;
  const highPriorityCount = projects.filter(p => p.priority === 'HIGH_PRIORITY').length;
  const attentionCount = projects.filter(p => p.priority === 'ATTENTION').length;
  const normalCount = Math.max(0, totalProjects - highPriorityCount - attentionCount);

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Map className="w-5 h-5 text-blue-600" />
              <span>Constituency GIS Project Map — {activeMpName}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real spatial plot for {activeConstituency} ({totalProjects} works)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <MPSelector currentMpName={activeMpName} onMPChange={handleMPChange} />
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
              <div className="px-2">
                <span className="text-emerald-600">Normal: </span>
                <strong className="text-slate-900">{normalCount}</strong>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="px-2">
                <span className="text-amber-600">Attention: </span>
                <strong className="text-slate-900">{attentionCount}</strong>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="px-2">
                <span className="text-red-600">High: </span>
                <strong className="text-slate-900">{highPriorityCount}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Visual Interactive GIS Canvas */}
          <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="relative w-full h-[550px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />

              {/* Dynamic Markers Overlay */}
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : projects.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white bg-black/40">
                  No spatial project markers found for {activeMpName}.
                </div>
              ) : (
                <div className="absolute inset-0 p-6">
                  {projects.map((p, idx) => {
                    const isHigh = p.priority === 'HIGH_PRIORITY';
                    const isAttn = p.priority === 'ATTENTION';
                    const colorClass = isHigh ? 'bg-red-500 ring-red-500/40' : isAttn ? 'bg-amber-500 ring-amber-500/40' : 'bg-emerald-500 ring-emerald-500/40';
                    const positions = [
                      'top-1/4 left-1/4', 'top-1/3 left-1/2', 'top-1/2 left-1/3', 'top-2/3 left-1/4',
                      'top-1/4 left-3/4', 'top-2/3 left-2/3', 'top-1/2 left-4/5', 'top-3/4 left-1/2',
                      'top-1/5 left-3/5', 'top-4/5 left-1/5', 'top-2/5 left-1/6', 'top-3/5 left-5/6',
                      'top-1/6 left-2/5', 'top-5/6 left-3/5', 'top-2/3 left-1/2'
                    ];
                    const pos = positions[idx % positions.length];
                    const isSelected = selectedProject?.id === p.id;

                    return (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        className={`absolute ${pos} transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform hover:scale-125 ${
                          isSelected ? 'scale-125 z-30' : ''
                        }`}
                        title={`${p.projectCode}: ${p.workName}`}
                      >
                        <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center shadow-xl ring-4 ${colorClass}`}>
                          <MapPin className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Selected Project Live GIS Details Panel */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                Selected Work GIS Metadata
              </h3>

              {selectedProject ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-blue-600 block text-xs">{selectedProject.projectCode}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{selectedProject.workName}</h4>
                    <p className="text-slate-500 text-[11px] mt-1">Sector: {selectedProject.sector}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-2.5 border border-slate-200/60 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">MP Owner:</span>
                      <span className="font-bold text-slate-900">{selectedProject.mpName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Constituency:</span>
                      <span className="font-bold text-slate-900">{selectedProject.constituencyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sanctioned Amount:</span>
                      <span className="font-bold text-slate-900">₹{((selectedProject.sanctionedCost ?? 0) / 100000).toFixed(2)} Lakh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Physical Progress:</span>
                      <span className="font-bold text-slate-900">{selectedProject.physicalProgress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Financial Progress:</span>
                      <span className="font-bold text-slate-900">{selectedProject.financialProgress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trust Score:</span>
                      <span className="font-bold text-emerald-600">{selectedProject.trustScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Priority:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        selectedProject.priority === 'HIGH_PRIORITY' ? 'bg-red-100 text-red-700' : selectedProject.priority === 'ATTENTION' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedProject.priority || 'NORMAL'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/50">
                      <span className="text-slate-500">Coordinates:</span>
                      <span className="font-mono text-[11px] text-slate-700">{selectedProject.latitude?.toFixed(4)}, {selectedProject.longitude?.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/projects/${selectedProject.id}`}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <span>View Full Project Case File</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 text-center py-12">
                  Click a map marker to view live spatial details.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
