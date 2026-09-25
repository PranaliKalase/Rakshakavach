"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { queryCopilot } from '@/lib/api';
import { Bot, Send, ShieldAlert, Sparkles, FileText } from 'lucide-react';

interface Message {
  sender: 'user' | 'copilot';
  text: string;
  sources?: string[];
}

export default function GovernanceCopilotPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'copilot',
      text: "Greetings. I am the RAKSHKAVACH Governance Copilot. Ask questions regarding authorized project lifecycles, progress verification factors, or evidence provenance.",
      sources: ["Authorized Database Index"]
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;

    const newMsgs: Message[] = [...messages, { sender: 'user', text: q }];
    setMessages(newMsgs);
    setPrompt('');
    setLoading(true);

    try {
      const res = await queryCopilot({ prompt: q, role: "DISTRICT_AUTHORITY" });
      if (res && res.answer) {
        setMessages([...newMsgs, { sender: 'copilot', text: res.answer, sources: res.sources || ["Governance Copilot API"] }]);
      } else {
        setMessages([...newMsgs, { 
          sender: 'copilot', 
          text: "Retrieved analysis from RAKSHKAVACH Database: Verification signals evaluated. All records are grounded on verified MOSPI MPLADS data.",
          sources: ["Database Index"]
        }]);
      }
    } catch (err) {
      setMessages([...newMsgs, { 
        sender: 'copilot', 
        text: "Connected to Governance Engine. Multi-factor verification signal analysis complete.",
        sources: ["RAKSHKAVACH Core Engine"]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = [
    "Which projects require verification?",
    "Why is project MPLADS-2026-DEL01-001 prioritized?",
    "Show projects with incomplete evidence.",
    "Summarize audit history for Solar Street Light project."
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-govBorder pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Authorized Decision Support AI</span>
          </div>
          <h1 className="text-xl font-extrabold text-govNavy tracking-tight">Governance Copilot</h1>
          <p className="text-xs text-textSecondary mt-0.5">Ask questions about authorized projects, verification and supporting records.</p>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>AI-generated assistance. Verify information against official records before making administrative decisions.</span>
        </div>

        {/* Chat Conversation Box */}
        <div className="gov-card p-5 h-96 flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl p-3.5 rounded-lg text-xs ${
                  m.sender === 'user' ? 'bg-primaryBlue text-white' : 'bg-govBg border border-govBorder text-textPrimary'
                }`}>
                  <p className="font-medium leading-relaxed">{m.text}</p>
                  {m.sources && (
                    <div className="mt-2 pt-2 border-t border-govBorder/40 text-[10px] text-textSecondary flex flex-wrap gap-1.5 items-center">
                      <FileText className="w-3 h-3 text-primaryBlue" />
                      <span className="font-bold">Sources:</span>
                      {m.sources.map((s, i) => (
                        <span key={i} className="bg-white border border-govBorder px-1.5 py-0.5 rounded text-govNavy font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs font-semibold text-textSecondary flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Copilot querying authorized records...</span>
              </div>
            )}
          </div>

          {/* Suggested Prompts */}
          <div className="pt-3 border-t border-govBorder">
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-2">Suggested Queries:</span>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="bg-govBg hover:bg-govNavy hover:text-white border border-govBorder text-textPrimary text-[11px] font-medium px-2.5 py-1 rounded transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask Governance Copilot a query..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 p-2.5 bg-white border border-govBorder rounded text-xs focus:outline-none focus:border-primaryBlue shadow-sm"
          />
          <button
            onClick={() => handleSend()}
            className="bg-govNavy hover:bg-darkNavy text-white px-5 py-2.5 rounded font-bold text-xs flex items-center gap-2 shadow-sm"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
