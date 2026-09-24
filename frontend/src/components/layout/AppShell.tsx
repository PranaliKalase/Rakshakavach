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

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.DISTRICT_AUTHORITY);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Auto-sync active user persona when navigating directly to role dashboards
    if (pathname.includes('/dashboard/mp')) {
      setCurrentUser(DEMO_USERS.MP);
      try { localStorage.setItem('rakshakavach_user', JSON.stringify(DEMO_USERS.MP)); } catch(e){}
    } else if (pathname.includes('/dashboard/district-authority')) {
      setCurrentUser(DEMO_USERS.DISTRICT_AUTHORITY);
      try { localStorage.setItem('rakshakavach_user', JSON.stringify(DEMO_USERS.DISTRICT_AUTHORITY)); } catch(e){}
    } else if (pathname.includes('/dashboard/monitoring-officer')) {
      setCurrentUser(DEMO_USERS.MONITORING_OFFICER);
      try { localStorage.setItem('rakshakavach_user', JSON.stringify(DEMO_USERS.MONITORING_OFFICER)); } catch(e){}
    } else if (pathname.includes('/dashboard/implementing-agency')) {
      setCurrentUser(DEMO_USERS.IMPLEMENTING_AGENCY);
      try { localStorage.setItem('rakshakavach_user', JSON.stringify(DEMO_USERS.IMPLEMENTING_AGENCY)); } catch(e){}
    } else if (pathname.includes('/dashboard/ministry')) {
      setCurrentUser(DEMO_USERS.MINISTRY);
      try { localStorage.setItem('rakshakavach_user', JSON.stringify(DEMO_USERS.MINISTRY)); } catch(e){}
    } else if (pathname.startsWith('/admin') || pathname.includes('/dashboard/admin')) {
      setCurrentUser(DEMO_USERS.ADMIN);
      try { localStorage.setItem('rakshakavach_user', JSON.stringify(DEMO_USERS.ADMIN)); } catch(e){}
    } else {
      try {
        const stored = localStorage.getItem('rakshakavach_user');
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch (e) {}
    }
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
