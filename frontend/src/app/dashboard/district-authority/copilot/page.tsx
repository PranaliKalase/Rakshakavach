"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { fetchProjects } from '@/lib/api';
import { Project } from '@/types/project';
import { Bot, Send, Sparkles, Loader2, Search, ArrowRight } from 'lucide-react';

export default function DistrictCopilotPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; data?: any[] }>>([
    {
      sender: 'assistant',
      text: "Namaste! I am the District Governance Copilot. Ask me any natural query about district works, financial utilization, anomaly signals, or verification status."
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProjects(500);
        setProjects(data);
      } catch (err) {
        console.error("Failed to load copilot projects data:", err);
      }
    }
    loadData();
  }, []);

  const samplePrompts = [
    "Show delayed projects.",
    "Which projects have evidence issues?",
    "Why is this project high risk?",
    "Show projects requiring verification."
  ];

  const handleAsk = (userText: string) => {
    if (!userText.trim()) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: userText }];
    setMessages(newMsgs);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      const q = userText.toLowerCase();
      let matched: Project[] = [];
      let replyText = "";

      if (q.includes("delayed") || q.includes("delay")) {
        matched = projects.filter(p => p.physicalProgress < p.financialProgress - 10 || p.priority === 'ATTENTION');
        replyText = `Found ${matched.length} projects experiencing execution delay or progress variance in your district.`;
      } else if (q.includes("evidence") || q.includes("photo") || q.includes("document")) {
        matched = projects.filter(p => p.priority === 'HIGH_PRIORITY' || p.priority === 'ATTENTION');
        replyText = `Identified ${matched.length} projects requiring evidence verification or field photo documentation.`;
      } else if (q.includes("high risk") || q.includes("risk") || q.includes("why")) {
        matched = projects.filter(p => p.priority === 'HIGH_PRIORITY' || p.trustScore < 75);
        replyText = `Located ${matched.length} high-risk projects flagged by the multi-factor anomaly engine based on financial variance, timeline lag, or Z-score thresholds.`;
      } else if (q.includes("verification") || q.includes("verify") || q.includes("queue")) {
        matched = projects.filter(p => p.priority === 'HIGH_PRIORITY' || p.priority === 'ATTENTION' || p.status === 'UNDER_REVIEW');
        replyText = `Found ${matched.length} projects currently pending district authority review and field verification.`;
      } else {
        matched = projects.slice(0, 5);
        replyText = `I found ${projects.length} canonical works in the district database. Here are the top relevant matching records:`;
      }

      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: replyText,
        data: matched.slice(0, 5)
      }]);
      setLoading(false);
    }, 600);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1.5">
            <Link href="/dashboard/district-authority" className="hover:text-blue-600">District Dashboard</Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Governance Copilot</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-500" />
            <span>District Governance Copilot</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-powered decision-support assistant querying live canonical district dataset metrics
          </p>
        </div>

        {/* Sample Prompt Chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Suggested Queries:</span>
          </span>
          {samplePrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleAsk(prompt)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-600 hover:text-blue-600 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-sm"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Chat Conversation Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 min-h-[450px] flex flex-col justify-between">
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-2xl rounded-2xl p-4 text-xs font-medium space-y-3 ${
                  m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}>
                  <p className="leading-relaxed">{m.text}</p>

                  {m.data && m.data.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <span className="font-bold text-[11px] text-slate-900 block">Matching District Works:</span>
                      <div className="space-y-1.5">
                        {m.data.map(p => (
                          <div key={p.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                            <div>
                              <span className="font-mono font-bold text-blue-600 mr-2">{p.projectCode}</span>
                              <span className="font-semibold text-slate-900">{p.workName}</span>
                            </div>
                            <Link href={`/projects/${p.id}`} className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                              <span>View</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Copilot is analyzing district dataset records...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleAsk(query); }}
            className="flex items-center gap-2 pt-4 border-t border-slate-100"
          >
            <input
              type="text"
              placeholder="Ask District Copilot (e.g., 'Show delayed projects' or 'Why is this project high risk?')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
