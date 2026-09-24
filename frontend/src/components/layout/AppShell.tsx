"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PermissionDenied } from '../ui/PermissionDenied';
import { DEMO_USERS } from '@/lib/constants';
import { UserProfile } from '@/types/user';

interface AppShellProps {
  children: React.ReactNode;
}

function getInitialUser(path: string): UserProfile {
  if (path.includes('/dashboard/mp')) return DEMO_USERS.MP;
  if (path.includes('/dashboard/district-authority')) return DEMO_USERS.DISTRICT_AUTHORITY;
  if (path.includes('/dashboard/monitoring-officer')) return DEMO_USERS.MONITORING_OFFICER;
  if (path.includes('/dashboard/implementing-agency')) return DEMO_USERS.IMPLEMENTING_AGENCY;
  if (path.includes('/dashboard/ministry')) return DEMO_USERS.MINISTRY;
  if (path.startsWith('/admin') || path.includes('/dashboard/admin')) return DEMO_USERS.ADMIN;
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('rakshakavach_user') : null;
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return DEMO_USERS.DISTRICT_AUTHORITY;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getInitialUser(pathname));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const user = getInitialUser(pathname);
    setCurrentUser(user);
    try {
      localStorage.setItem('rakshakavach_user', JSON.stringify(user));
    } catch (e) {}
  }, [pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('rakshakavach_user');
    } catch (e) {}
  };

  // Route Authorization Check
  const isAuthorizedRoute = (): boolean => {
    const role = currentUser.role;

    if ((pathname.startsWith('/admin') || pathname.includes('/dashboard/admin')) && role !== 'ADMIN') {
      return false;
    }
    if (pathname.includes('/dashboard/ministry') && role !== 'MINISTRY' && role !== 'ADMIN') {
      return false;
    }
    if (pathname.includes('/dashboard/mp') && role !== 'MP' && role !== 'ADMIN') {
      return false;
    }
    if (pathname.includes('/dashboard/district-authority') && role !== 'DISTRICT_AUTHORITY' && role !== 'ADMIN' && role !== 'MINISTRY') {
      return false;
    }
    if (pathname.includes('/dashboard/implementing-agency') && role !== 'IMPLEMENTING_AGENCY' && role !== 'ADMIN') {
      return false;
    }
    if (pathname.includes('/dashboard/monitoring-officer') && role !== 'MONITORING_OFFICER' && role !== 'ADMIN') {
      return false;
    }

    return true;
  };

  return (
    <div className="min-h-screen bg-govBg flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentUser={currentUser} 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header 
          currentUser={currentUser} 
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {!isAuthorizedRoute() ? (
            <PermissionDenied userRole={currentUser.role} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
