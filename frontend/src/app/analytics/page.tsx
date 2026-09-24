"use client";

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { BarChart3, PieChart, TrendingUp, ShieldCheck } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="border-b border-govBorder pb-4">
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">Governance Analytics & System Metrics</h1>
          <p className="text-xs text-textSecondary mt-0.5">Financial utilization, verification trends, and sector-wise distribution.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Total Allocation" value="₹90.00 Lakh" subtitle="FY 2026-2027" icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Disbursed Funds" value="₹45.50 Lakh" subtitle="50.5% Utilization" icon={<BarChart3 className="w-5 h-5 text-primaryBlue" />} />
          <KPICard title="Verification Accuracy" value="98.2%" subtitle="Audit Match Rate" icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Resolved Signals" value="12" subtitle="This Financial Year" icon={<PieChart className="w-5 h-5 text-statusBlue" />} />
        </div>

        {/* Analytics Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="gov-card p-5">
            <h3 className="text-sm font-bold text-govNavy mb-3">Expenditure by Sector</h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Rural Electrification</span>
                  <span>₹25.00 Lakh (27.8%)</span>
                </div>
                <div className="w-full h-2 bg-govBg rounded-full overflow-hidden">
                  <div className="h-full bg-primaryBlue w-[27.8%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Education & Skill</span>
                  <span>₹50.00 Lakh (55.5%)</span>
                </div>
                <div className="w-full h-2 bg-govBg rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 w-[55.5%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Water & Sanitation</span>
                  <span>₹15.00 Lakh (16.7%)</span>
                </div>
                <div className="w-full h-2 bg-govBg rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[16.7%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="gov-card p-5">
            <h3 className="text-sm font-bold text-govNavy mb-3">Verification Signal Outcomes</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 bg-govBg rounded border border-govBorder">
                <span className="font-semibold text-textPrimary">Verified On-Site by Monitoring Officer</span>
                <span className="font-bold text-emerald-700">8 Projects</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-govBg rounded border border-govBorder">
                <span className="font-semibold text-textPrimary">Clarification Provided by Implementing Agency</span>
                <span className="font-bold text-primaryBlue">3 Projects</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-govBg rounded border border-govBorder">
                <span className="font-semibold text-textPrimary">Escalated for Collector Review</span>
                <span className="font-bold text-statusRed">1 Project</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
