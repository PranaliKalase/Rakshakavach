"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldCheck } from 'lucide-react';

interface AdminBreadcrumbsProps {
  currentSection: string;
}

export const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({ currentSection }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-textSecondary mb-3">
      <Link 
        href="/dashboard/admin" 
        className="flex items-center gap-1.5 text-primaryBlue hover:text-govNavy transition-colors font-bold"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-primaryBlue shrink-0" />
        <span>Admin</span>
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <span className="text-govNavy font-extrabold">{currentSection}</span>
    </nav>
  );
};
