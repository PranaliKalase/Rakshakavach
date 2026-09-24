"use client";

import React from 'react';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import { UserProfile } from '@/types/user';

interface HeaderProps {
  currentUser: UserProfile;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onMenuToggle }) => {
  // Extract initials for circular avatar badge
  const initials = currentUser.fullName
    ? currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'RK';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      {/* Left: Greeting & Role Subtitle matching Image 2 */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className="md:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded border border-slate-200"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-base md:text-lg font-bold text-[#0F172A] tracking-tight leading-tight">
            Welcome, {currentUser.fullName}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {currentUser.role === 'MP' 
              ? `Member of Parliament — ${currentUser.constituencyName || currentUser.mpName || 'Lok Sabha Scope'}`
              : currentUser.role === 'DISTRICT_AUTHORITY'
              ? `District Authority Collectorate — ${currentUser.districtId || 'District Scope'}`
              : `${currentUser.role.replace('_', ' ')} Jurisdiction Scope`}
          </p>
        </div>
      </div>

      {/* Right Controls: Bell Icon & User Profile Badge matching Image 2 */}
      <div className="flex items-center gap-4">
        {/* Bell Notification */}
        <Link 
          href="/verification-queue"
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          title="Notifications & Alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
        </Link>

        {/* Profile Badge Circle matching Image 2 */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="w-9 h-9 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.fullName}</p>
            <p className="text-[11px] text-slate-500 font-semibold">{currentUser.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
