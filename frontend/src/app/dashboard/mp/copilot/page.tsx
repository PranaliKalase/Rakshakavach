"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MPSelector } from '@/components/ui/MPSelector';
import { queryCopilot } from '@/lib/api';
import { DEMO_USERS } from '@/lib/constants';
import { Bot, Send, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function MPCopilotPage() {
  const [activeMpName, setActiveMpName] = useState<string>("Demo MP 013");
  const [activeConstituency, setActiveConstituency] = useState<string>("Maharashtra Demo Parliamentary Constituency 13");
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; sources?: string[] }>>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rakshakavach_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.mpName) {
          setActiveMpName(u.mpName);
          if (u.constituencyName) setActiveConstituency(u.constituencyName);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: `Namaste ${activeMpName}. I am your RAKSHKAVACH Governance Copilot, grounded exclusively in your portfolio for ${activeConstituency}. Ask me about delayed projects, utilization %, priority verification alerts, or average trust scores.`,
        sources: [`Canonical Dataset: ${activeMpName}`, "MOSPI Database Join"]
      }
    ]);
  }, [activeMpName, activeConstituency]);

  const handleMPChange = (newMpName: string, newConstName: string) => {
    setActiveMpName(newMpName);
    setActiveConstituency(newConstName);
    try {
      const updatedUser = {
        ...DEMO_USERS.MP,
        fullName: newMpName,
        mpName: newMpName,
        constituencyName: newConstName
      };
      localStorage.setItem('rakshakavach_user', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query) return;

    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await queryCopilot({
        prompt: query,
        role: 'MP',
        mp_name: activeMpName
      });

      if (res && res.answer) {
        setMessages(prev => [...prev, { sender: 'bot', text: res.answer, sources: res.sources }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: `Governance Copilot active for ${activeMpName}. Could not resolve query.` }]);
      }
    } catch (err) {
      console.error("Copilot error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              <span>Governance Copilot — {activeMpName}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Permission-aware AI decision support grounded in {activeConstituency}
            </p>
          </div>

          <MPSelector currentMpName={activeMpName} onMPChange={handleMPChange} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {[
            "How many projects are delayed?",
            "What is my utilization?",
            "Which projects need verification?",
            "What is my average trust score?"
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-3.5 py-2 bg-white hover:bg-blue-50 text-slate-800 rounded-xl border border-slate-200 hover:border-blue-300 font-bold transition-colors shadow-sm"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Window Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
          {/* Messages list */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white shadow-sm' : 'bg-emerald-600 text-white shadow-sm'
                }`}>
                  {msg.sender === 'user' ? 'MP' : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-xs max-w-xl font-medium leading-relaxed ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-200'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-semibold flex flex-wrap gap-1.5">
                      <span>Citations:</span>
                      {msg.sources.map((src, sidx) => (
                        <span key={sidx} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold p-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Copilot querying live portfolio database records for {activeMpName}...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2 rounded-b-2xl">
            <input
              type="text"
              placeholder={`Ask Copilot about ${activeMpName}'s portfolio, delayed works, utilization % or risk alerts...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
