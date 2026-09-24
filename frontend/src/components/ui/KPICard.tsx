import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  accentColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, trend, accentColor = 'border-l-primaryBlue' }) => {
  return (
    <div className={`gov-card p-4 border-l-4 ${accentColor} flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">{title}</span>
        {icon && <div className="text-govNavy opacity-70">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-bold text-textPrimary tracking-tight">{value}</div>
        {subtitle && <p className="text-[11px] text-textSecondary mt-1">{subtitle}</p>}
        {trend && <p className="text-[11px] font-semibold text-emerald-600 mt-1">{trend}</p>}
      </div>
    </div>
  );
};
