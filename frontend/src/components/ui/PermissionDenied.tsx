"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';
import { UserRole } from '@/types/user';
import { DEMO_USERS } from '@/lib/constants';

interface PermissionDeniedProps {
  requiredRole?: string;
  userRole: UserRole;
}

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({ userRole }) => {
  const pathname = usePathname();

  // Determine target role based on pathname
  let targetRole: UserRole = 'MP';
  let targetUser = DEMO_USERS.MP;

  if (pathname.includes('/dashboard/district-authority')) {
    targetRole = 'DISTRICT_AUTHORITY';
    targetUser = DEMO_USERS.DISTRICT_AUTHORITY;
  } else if (pathname.includes('/dashboard/monitoring-officer')) {
    targetRole = 'MONITORING_OFFICER';
    targetUser = DEMO_USERS.MONITORING_OFFICER;
  } else if (pathname.includes('/dashboard/implementing-agency')) {
    targetRole = 'IMPLEMENTING_AGENCY';
    targetUser = DEMO_USERS.IMPLEMENTING_AGENCY;
  } else if (pathname.includes('/dashboard/ministry')) {
    targetRole = 'MINISTRY';
    targetUser = DEMO_USERS.MINISTRY;
  } else if (pathname.includes('/admin') || pathname.includes('/dashboard/admin')) {
    targetRole = 'ADMIN';
    targetUser = DEMO_USERS.ADMIN;
  }

  const handleSwitchPersona = () => {
    try {
      localStorage.setItem('rakshakavach_user', JSON.stringify(targetUser));
      window.location.reload();
    } catch (e) {
      console.error("Failed to switch user persona:", e);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="gov-card p-8 max-w-md w-full text-center space-y-5 border-t-4 border-t-statusRed shadow-xl bg-white rounded-2xl">
        <div className="w-14 h-14 bg-red-100 text-statusRed rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-govNavy">Access Denied (403)</h2>
          <p className="text-xs text-textSecondary mt-1 leading-relaxed">
            Your current logged-in role (<strong className="text-govNavy font-bold">{userRole.replace('_', ' ')}</strong>) is not authorized to view this dashboard.
          </p>
        </div>

        <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-[11px] font-medium rounded-xl text-left">
          <strong>Security Policy Enforcement:</strong> RAKSHKAVACH enforces strict role-based access control. Switch your demo persona below to view this portal.
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleSwitchPersona}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to {targetRole.replace('_', ' ')} Persona</span>
          </button>

          <Link
            href={`/dashboard/${userRole.toLowerCase().replace('_', '-')}`}
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
