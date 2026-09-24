import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface AnomalyRadarProps {
  factors?: Record<string, string>;
}

export const AnomalyRadar: React.FC<AnomalyRadarProps> = ({ factors }) => {
  const radarData = factors || {
    Financial: "High Priority",
    Timeline: "Normal",
    Evidence: "Attention",
    Documents: "Normal",
    Progress: "Attention",
    Geospatial: "Attention",
    "Peer Benchmark": "Normal"
  };

  const getStatusColor = (val: string) => {
    switch (val) {
      case "High Priority":
        return "bg-red-100 text-statusRed border-red-200";
      case "Attention":
        return "bg-amber-100 text-statusAmber border-amber-200";
      default:
        return "bg-emerald-100 text-statusGreen border-emerald-200";
    }
  };

  return (
    <div className="gov-card p-5">
      <div className="pb-3 border-b border-govBorder mb-4">
        <h3 className="text-sm font-bold text-govNavy uppercase tracking-wider">Multi-Factor Anomaly Radar</h3>
        <p className="text-[11px] text-textSecondary">Independent signal evaluation across 7 key governance metrics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(radarData).map(([key, val]) => (
          <div key={key} className="p-3 bg-govBg rounded border border-govBorder flex flex-col justify-between">
            <span className="text-xs font-semibold text-textPrimary">{key}</span>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(val)}`}>
              {val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
