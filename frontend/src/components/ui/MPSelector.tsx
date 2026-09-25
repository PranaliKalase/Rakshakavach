"use client";

import React, { useEffect, useState } from 'react';
import { UserCheck, ChevronDown, Award } from 'lucide-react';
import { fetchMPList } from '@/lib/api';

interface MPSelectorProps {
  currentMpName: string;
  onMPChange: (newMpName: string, constituencyName: string) => void;
  className?: string;
}

export const MPSelector: React.FC<MPSelectorProps> = ({ currentMpName, onMPChange, className = "" }) => {
  const [mpList, setMpList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMPs() {
      try {
        setLoading(true);
        const data = await fetchMPList();
        setMpList(data || []);
        
        // If currentMpName is a placeholder or not in the loaded dataset MP list, auto select first real dataset MP
        if (data && data.length > 0) {
          const match = data.find(m => m.mp_name === currentMpName);
          if (!match) {
            onMPChange(data[0].mp_name, data[0].constituency_name);
          }
        }
      } catch (err) {
        console.error("Failed to load MP list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMPs();
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const mpInfo = mpList.find(m => m.mp_name === selectedName);
    const constName = mpInfo ? mpInfo.constituency_name : "Constituency";
    onMPChange(selectedName, constName);
  };

  return (
    <div className={`flex items-center gap-2 bg-blue-50/80 border border-blue-200 px-3 py-1.5 rounded-xl shadow-sm text-xs ${className}`}>
      <div className="flex items-center gap-1.5 font-bold text-blue-900 shrink-0">
        <Award className="w-4 h-4 text-blue-600" />
        <span>Active MP Portfolio:</span>
      </div>
      <div className="relative flex-1 min-w-[220px]">
        <select
          value={currentMpName}
          onChange={handleSelect}
          disabled={loading}
          className="w-full bg-white border border-blue-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <option value={currentMpName}>Loading MPs from Canonical Dataset...</option>
          ) : (
            mpList.map((m) => (
              <option key={m.mp_name} value={m.mp_name}>
                {m.mp_name} — {m.constituency_name} ({m.project_count} Works)
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};
