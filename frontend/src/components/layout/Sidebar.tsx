"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Map, 
  BarChart3, 
  FileCheck2, 
  Bot, 
  LogOut,
  X,
  ShieldAlert,
  PlusCircle,
  Bell,
  ChevronRight,
  PieChart,
  Upload,
  MessageSquare,
  FileText,
  CheckCircle2,
  Settings,
  Building2,
  Clock,
  ClipboardCheck
} from 'lucide-react';
import { UserProfile } from '@/types/user';

interface SidebarProps {
  currentUser: UserProfile;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, isOpen = false, onClose, onLogout }) => {
  const pathname = usePathname();
  const isLinkActive = (path: string) => pathname === path;
  const role = currentUser.role;

  // Determine active dashboard path for current role
  const dashboardPath = `/dashboard/${role.toLowerCase().replace('_', '-')}`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside className={`w-64 bg-[#091D34] text-white flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-white/10 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Clickable Brand Header -> Redirects to Home Landing Page */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link 
            href="/" 
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
            <div className="bg-blue-600 p-2 rounded-xl shadow-md group-hover:bg-blue-500 transition-colors">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-white leading-tight group-hover:text-blue-200 transition-colors">RAKSHKAVACH</h1>
              <p className="text-[10px] text-blue-200 font-medium">Verification & Trust Platform</p>
            </div>
          </Link>
          {onClose && (
            <button 
              onClick={onClose}
              className="md:hidden p-1 text-gray-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links - All 100% Clickable & Redirecting */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-4">
          {pathname.startsWith('/dashboard/implementing-agency') ? (
            <>
              {/* MAIN SECTION */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300/70 px-3 mb-1.5">MAIN</p>
                <div className="space-y-1">
                  {[
                    { name: 'Dashboard', path: '/dashboard/implementing-agency', icon: LayoutDashboard },
                    { name: 'My Projects', path: '/dashboard/implementing-agency?tab=projects', icon: FolderKanban },
                    { name: 'Progress Updates', path: '/dashboard/implementing-agency?tab=progress', icon: BarChart3 },
                    { name: 'Project Map', path: '/dashboard/implementing-agency?tab=map', icon: Map },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path || (typeof window !== 'undefined' && window.location.search.includes(item.path.split('?')[1] || 'XYZ'));
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-blue-300" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* EXECUTION SECTION */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300/70 px-3 mb-1.5">EXECUTION</p>
                <div className="space-y-1">
                  {[
                    { name: 'Evidence', path: '/dashboard/implementing-agency?tab=evidence', icon: Upload, badge: 'Pending' },
                    { name: 'Documents', path: '/dashboard/implementing-agency?tab=documents', icon: FileText },
                    { name: 'Verification Responses', path: '/dashboard/implementing-agency?tab=verification', icon: MessageSquare, badge: '2' },
                    { name: 'Completion', path: '/dashboard/implementing-agency?tab=completion', icon: CheckCircle2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-emerald-400" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badge === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-red-500 text-white'}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* AUDIT & SUPPORT SECTION */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300/70 px-3 mb-1.5">AUDIT & SUPPORT</p>
                <div className="space-y-1">
                  {[
                    { name: 'Digital Audit Room', path: '/dashboard/district-authority/audit-room', icon: FileCheck2 },
                    { name: 'Notifications', path: '/dashboard/implementing-agency?tab=notifications', icon: Bell, badge: '4' },
                    { name: 'Settings', path: '/dashboard/implementing-agency?tab=settings', icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          ) : pathname.startsWith('/dashboard/monitoring-officer') ? (
            <>
              {/* MAIN SECTION */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300/70 px-3 mb-1.5">MAIN</p>
                <div className="space-y-1">
                  {[
                    { name: 'Dashboard', path: '/dashboard/monitoring-officer', icon: LayoutDashboard },
                    { name: 'Verification Queue', path: '/dashboard/monitoring-officer?tab=queue', icon: CheckSquare, badge: 'High Priority' },
                    { name: 'My Inspections', path: '/dashboard/monitoring-officer?tab=inspections', icon: ClipboardCheck },
                    { name: 'Project Map', path: '/dashboard/monitoring-officer?tab=map', icon: Map },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-blue-300" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* VERIFICATION SECTION */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300/70 px-3 mb-1.5">VERIFICATION</p>
                <div className="space-y-1">
                  {[
                    { name: 'Evidence Review', path: '/dashboard/monitoring-officer?tab=evidence', icon: Upload, badge: 'Review' },
                    { name: 'Inspection Reports', path: '/dashboard/monitoring-officer?tab=reports', icon: FileText },
                    { name: 'Verification Responses', path: '/dashboard/monitoring-officer?tab=responses', icon: MessageSquare, badge: '2' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-emerald-400" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* AUDIT & SUPPORT SECTION */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300/70 px-3 mb-1.5">AUDIT & SUPPORT</p>
                <div className="space-y-1">
                  {[
                    { name: 'Digital Audit Room', path: '/dashboard/district-authority/audit-room', icon: FileCheck2 },
                    { name: 'Notifications', path: '/dashboard/monitoring-officer?tab=notifications', icon: Bell, badge: '3' },
                    { name: 'Settings', path: '/dashboard/monitoring-officer?tab=settings', icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          ) : pathname.startsWith('/dashboard/district-authority') ? (

            <>
              {[
                { name: 'Dashboard', path: '/dashboard/district-authority', icon: LayoutDashboard },
                { name: 'Projects', path: '/dashboard/district-authority/projects', icon: FolderKanban },
                { name: 'Project Map', path: '/dashboard/district-authority/map', icon: Map },
                { name: 'Verification Queue', path: '/dashboard/district-authority/verification', icon: CheckSquare, badge: '3' },
                { name: 'Trust & Risk Center', path: '/dashboard/district-authority/trust-risk', icon: ShieldAlert },
                { name: 'Financial Monitoring', path: '/dashboard/district-authority/financials', icon: PieChart },
                { name: 'Progress Monitoring', path: '/dashboard/district-authority/progress', icon: BarChart3 },
                { name: 'Evidence Center', path: '/dashboard/district-authority/evidence', icon: FileCheck2 },
                { name: 'Peer Benchmarking', path: '/dashboard/district-authority/benchmarking', icon: BarChart3 },
                { name: 'Digital Audit Room', path: '/dashboard/district-authority/audit-room', icon: FileCheck2 },
                { name: 'Governance Actions', path: '/dashboard/district-authority/actions', icon: PlusCircle },
                { name: 'Governance Copilot', path: '/dashboard/district-authority/copilot', icon: Bot, isCopilot: true },
                { name: 'Reports & Analytics', path: '/dashboard/district-authority/reports', icon: BarChart3 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${item.isCopilot ? 'text-emerald-400' : ''}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </>
          ) : (
            <>
              {/* Default Navigation Links */}
              <Link
                href={dashboardPath}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes('/dashboard') 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </div>
              </Link>

              <Link
                href="/projects"
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isLinkActive('/projects') 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="w-4 h-4" />
                  <span>My Projects</span>
                </div>
              </Link>

              <Link
                href="/projects/new"
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isLinkActive('/projects/new') 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-4 h-4 text-blue-300" />
                  <span>Recommend New Work</span>
                </div>
              </Link>

              <Link
                href="/analytics"
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isLinkActive('/analytics') 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PieChart className="w-4 h-4" />
                  <span>Utilization</span>
                </div>
              </Link>

              <Link
                href="/verification-queue"
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isLinkActive('/verification-queue') 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>Alerts</span>
                </div>
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  3
                </span>
              </Link>

              <Link
                href="/map"
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isLinkActive('/map') 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Map className="w-4 h-4" />
                  <span>Project Map</span>
                </div>
              </Link>

              <Link
                href="/copilot"
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isLinkActive('/copilot') 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Governance Copilot</span>
                </div>
              </Link>

              <Link
                href="/audit-room"
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isLinkActive('/audit-room') 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Digital Audit Room</span>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Bottom Sidebar Footer -> Quick MP / District Dashboard Access */}
        <div className="p-3 border-t border-white/10 bg-black/20 space-y-1">
          <Link
            href="/dashboard/district-authority"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>District Dashboard</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </Link>
          <Link
            href="/dashboard/mp"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              <span>MP Dashboard</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </aside>
    </>
  );
};
