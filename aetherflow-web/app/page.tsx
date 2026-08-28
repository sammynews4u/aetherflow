'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert, ShieldCheck, MessageSquare, X, Send, Sparkles, Loader2 } from "lucide-react";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: "Hello! I am AetherBot. Ask me anything about zero-latency webhook healing, custom schema definitions, or gateway architecture.",
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const faqs = [
    { q: "What is AetherFlow?", a: "AetherFlow is a zero-latency middleware that sits between your webhook providers and your database. It automatically intercepts, validates, and heals broken JSON payloads before they can crash your system." },
    { q: "How fast is the AI healing?", a: "Because we utilize Groq's high-speed LPU architecture, payload inference and healing typically take less than 300ms, making it completely invisible to your end users." },
    { q: "Do I need to change my database?", a: "Not at all. You define your expected Target Schema in our dashboard, point your webhooks to your AetherFlow Gateway URL, and we ensure only perfect data hits your existing database." },
    { q: "What happens if the AI fails?", a: "In the rare event of unrecoverable schema drift, AetherFlow securely logs the raw payload and flags it in your dashboard so your engineering team can review it manually without losing the data." },
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const userMessage = inputMessage.trim();
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      if (data.status === 'success' && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting to the AetherFlow gateway. Please ensure the backend is active." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
          <span className="text-xl font-black tracking-widest bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AETHERFLOW
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/auth" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-24 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Live Demo Environment
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
          Autonomous Webhook <br />
          <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Self-Healing Gateway
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop writing custom parsers for third-party API updates. AetherFlow intercepts broken payloads and uses zero-latency AI to dynamically map them to your database schemas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-0.5"
          >
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-bold transition-all"
          >
            Open Live Gateway
          </Link>
        </div>

        {/* Mockup */}
        <div className="mt-20 max-w-5xl mx-auto bg-slate-900/50 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm text-left">
          <div className="flex border-b border-slate-800 bg-slate-950/50">
            <div className="px-6 py-3 border-r border-slate-800 text-xs font-mono text-red-400 flex items-center gap-2">
              <ShieldAlert size={14} /> Broken Webhook Payload
            </div>
            <div className="px-6 py-3 text-xs font-mono text-emerald-400 flex items-center gap-2">
              <ShieldCheck size={14} /> AI Healed Target Schema
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="p-6 font-mono text-sm text-slate-400 overflow-x-auto">
              <pre>{`{\n  "stripe_customer_id": "cus_9x8z",\n  "amount_paid": "450.99",\n  "is_active_sub": "yes"\n}`}</pre>
            </div>
            <div className="p-6 font-mono text-sm text-slate-300 overflow-x-auto bg-emerald-500/5">
              <pre>{`{\n  "customerId": "cus_9x8z",\n  "amount": 450.99,\n  "isActive": true\n}`}</pre>
            </div>
          </div>
        </div>
      </main>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-24 border-t border-slate-800/50 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[480px]">
            <div className="bg-indigo-600 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-200" />
                <span className="font-semibold text-sm text-white">AetherBot AI Guide</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-indigo-200 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-950/60 space-y-3 text-sm">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 p-3 rounded-xl rounded-tl-none border border-slate-700 flex items-center gap-2 text-xs">
                    <Loader2 size={14} className="animate-spin text-indigo-400" /> AetherBot is typing...
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800">
              <form className="flex gap-2" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about schemas, latency, setup..."
                  className="flex-1 bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !inputMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-transform hover:scale-105 flex items-center gap-2"
          >
            <MessageSquare size={22} />
          </button>
        )}
      </div>
    </div>
  );
}