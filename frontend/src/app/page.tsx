import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  FileCheck2, 
  Lock, 
  BarChart3, 
  Bot, 
  ShieldAlert 
} from 'lucide-react';
import { PROTOTYPE_DISCLAIMER } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-govBg text-textPrimary font-sans">
      {/* Top Disclosure Header */}
      <div className="bg-darkNavy text-white py-2 px-4 text-center text-xs flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        <span>{PROTOTYPE_DISCLAIMER}</span>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-govBorder bg-white py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primaryBlue p-2 rounded-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-govNavy tracking-tight">RAKSHKAVACH</h1>
            <p className="text-xs text-textSecondary font-semibold">Verification & Trust Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-semibold text-govNavy hover:text-primaryBlue">
            Sign In
          </Link>
          <Link 
            href="/dashboard/district-authority" 
            className="bg-primaryBlue hover:bg-govNavy text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
          >
            Explore Platform
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <span className="inline-block bg-blue-100 text-primaryBlue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-blue-200">
          MPLADS Governance & Transparency
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-govNavy tracking-tight leading-tight">
          RAKSHKAVACH
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-primaryBlue mt-2">
          AI-Powered MPLADS Verification & Trust Platform
        </h2>
        <p className="text-base text-textSecondary max-w-2xl mx-auto mt-4 leading-relaxed">
          “Detect anomalies, verify evidence, explain risk signals and preserve an auditable project history.”
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/login"
            className="bg-govNavy hover:bg-darkNavy text-white font-semibold text-sm px-6 py-3 rounded-md flex items-center gap-2 shadow-md transition-colors"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/district-authority"
            className="bg-white hover:bg-govBg text-govNavy font-semibold text-sm px-6 py-3 rounded-md border border-govBorder shadow-sm transition-colors"
          >
            View Live Prototype
          </Link>
        </div>

        {/* Philosophy Badge */}
        <div className="mt-12 p-4 bg-white rounded-lg border border-govBorder max-w-3xl mx-auto flex flex-col md:flex-row justify-around items-center gap-4 text-xs font-bold text-govNavy">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>AI ASSISTS.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>HUMANS VERIFY.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>AUTHORIZED OFFICERS DECIDE.</span>
          </div>
        </div>
      </section>

      {/* Product Journey Steps */}
      <section className="bg-white py-12 border-y border-govBorder">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-center text-xs font-bold text-textSecondary uppercase tracking-widest mb-8">
            Core Product Journey Workflow
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-bold">
            {['RECOMMEND', 'SANCTION', 'EXECUTE', 'DETECT', 'VERIFY', 'EXPLAIN', 'INSPECT', 'DECIDE', 'PRESERVE', 'AUDIT'].map((step, idx) => (
              <React.Fragment key={step}>
                <span className="bg-govBg text-govNavy border border-govBorder px-3 py-1.5 rounded">
                  {step}
                </span>
                {idx < 9 && <span className="text-gray-400">➔</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h3 className="text-2xl font-bold text-govNavy text-center mb-10">Key Platform Capability Modules</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="gov-card p-6">
            <BarChart3 className="w-8 h-8 text-primaryBlue mb-3" />
            <h4 className="font-bold text-base text-govNavy mb-2">Trust Assessment</h4>
            <p className="text-xs text-textSecondary leading-relaxed">
              Multi-factor 0-100 scoring evaluating financial, timeline, evidence, document, and peer metrics.
            </p>
          </div>

          <div className="gov-card p-6">
            <Search className="w-8 h-8 text-statusAmber mb-3" />
            <h4 className="font-bold text-base text-govNavy mb-2">Anomaly Radar</h4>
            <p className="text-xs text-textSecondary leading-relaxed">
              Deterministic rule engine combined with unsupervised Isolation Forest model identifying statistical outliers.
            </p>
          </div>

          <div className="gov-card p-6">
            <Lock className="w-8 h-8 text-emerald-600 mb-3" />
            <h4 className="font-bold text-base text-govNavy mb-2">Tamper-Evident Ledger</h4>
            <p className="text-xs text-textSecondary leading-relaxed">
              Cryptographic SHA-256 evidence hashing guaranteeing record immutability and provenance.
            </p>
          </div>

          <div className="gov-card p-6">
            <FileCheck2 className="w-8 h-8 text-sky-600 mb-3" />
            <h4 className="font-bold text-base text-govNavy mb-2">Digital Audit Room</h4>
            <p className="text-xs text-textSecondary leading-relaxed">
              Comprehensive digital case file output for complete project lifecycle transparency and auditing.
            </p>
          </div>

          <div className="gov-card p-6">
            <Bot className="w-8 h-8 text-emerald-600 mb-3" />
            <h4 className="font-bold text-base text-govNavy mb-2">Governance Copilot</h4>
            <p className="text-xs text-textSecondary leading-relaxed">
              Permission-aware decision support assistant answering officer queries with explicit source record citations.
            </p>
          </div>

          <div className="gov-card p-6">
            <ShieldCheck className="w-8 h-8 text-govNavy mb-3" />
            <h4 className="font-bold text-base text-govNavy mb-2">Role-Based Governance</h4>
            <p className="text-xs text-textSecondary leading-relaxed">
              Strict jurisdiction scoping for MP, District Authority, Implementing Agency, and Field Monitoring Officers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-govBorder bg-white py-8 text-center text-xs text-textSecondary">
        <p className="font-semibold text-govNavy">RAKSHKAVACH — AI-Powered MPLADS Verification & Trust Platform</p>
        <p className="mt-1">{PROTOTYPE_DISCLAIMER}</p>
      </footer>
    </div>
  );
}
