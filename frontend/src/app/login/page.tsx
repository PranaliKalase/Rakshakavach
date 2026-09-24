"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert, UserCheck } from 'lucide-react';
import { PROTOTYPE_DISCLAIMER, DEMO_USERS } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('DISTRICT_AUTHORITY');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userProfile = DEMO_USERS[selectedRole] || DEMO_USERS.DISTRICT_AUTHORITY;
    localStorage.setItem('rakshakavach_user', JSON.stringify(userProfile));

    setTimeout(() => {
      setLoading(false);
      router.push(`/dashboard/${userProfile.role.toLowerCase().replace('_', '-')}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-govBg flex flex-col justify-between text-textPrimary">
      {/* Top Disclosure Banner */}
      <div className="bg-darkNavy text-white py-2 px-4 text-center text-xs flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        <span>{PROTOTYPE_DISCLAIMER}</span>
      </div>

      {/* Main Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-govBorder rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex bg-primaryBlue p-3 rounded-lg mb-3 shadow-md">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">RAKSHKAVACH</h1>
            <p className="text-xs text-textSecondary font-semibold">MOSPI Official MPLADS Verification & Trust Platform</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Select Official User Profile *</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-primaryBlue absolute left-3 top-3" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-govBg border border-govBorder rounded font-semibold text-govNavy focus:outline-none focus:border-primaryBlue cursor-pointer"
                >
                  <option value="DISTRICT_AUTHORITY">District Collector — Badaun, Uttar Pradesh</option>
                  <option value="MP">Shri Aditya Yadav (Hon'ble MP — Badaun, UP)</option>
                  <option value="IMPLEMENTING_AGENCY">Public Works Dept (PWD) — Uttar Pradesh</option>
                  <option value="MONITORING_OFFICER">Field Monitoring Officer — UP State Scope</option>
                  <option value="MINISTRY">MOSPI Ministry Oversight Officer — New Delhi</option>
                  <option value="ADMIN">System Administrator — MOSPI Technical Cell</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-textPrimary mb-1">Official Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-textSecondary absolute left-3 top-3" />
                <input
                  type="email"
                  value={DEMO_USERS[selectedRole]?.email || ''}
                  disabled
                  className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-govBorder rounded text-textSecondary font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-textPrimary mb-1">Passkey / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-textSecondary absolute left-3 top-3" />
                <input
                  type="password"
                  value="••••••••••••••••"
                  disabled
                  className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-govBorder rounded text-textSecondary"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-govNavy hover:bg-darkNavy text-white text-xs font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? (
                  <span>Authenticating Role & Jurisdiction...</span>
                ) : (
                  <>
                    <span>Authenticate & Access Authorized Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-textSecondary border-t border-govBorder bg-white">
        RAKSHKAVACH • Powered by Official MOSPI MPLADS Dataset (543 Lok Sabha Constituencies)
      </footer>
    </div>
  );
}
