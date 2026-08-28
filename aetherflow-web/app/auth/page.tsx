'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const endpoint =
      view === 'login'
        ? '/api/v1/auth/login'
        : view === 'register'
        ? '/api/v1/auth/register'
        : '/api/v1/auth/forgot-password';

    const payload =
      view === 'forgot'
        ? { email }
        : view === 'register'
        ? { name, email, password }
        : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Authentication failed.');
      }

      if (view === 'forgot') {
        setSuccessMsg(data.message || 'Reset instructions have been sent.');
      } else {
        // Save the authenticated user state locally
        localStorage.setItem('aether_user', JSON.stringify(data.data.user));
        localStorage.setItem('aether_api_key', data.data.apiKey);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="h-3 w-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
            <span className="font-black tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AETHERFLOW
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">
            {view === 'login' && 'Welcome back'}
            {view === 'register' && 'Create your account'}
            {view === 'forgot' && 'Reset your password'}
          </h2>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {view === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Your Name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="developer@aetherflow.ai"
              />
            </div>
          </div>

          {view !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-400">Password</label>
                {view === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Processing...
              </span>
            ) : view === 'login' ? (
              <>Sign In <ArrowRight size={16} /></>
            ) : view === 'register' ? (
              <>Create Account <ArrowRight size={16} /></>
            ) : (
              <>Send Reset Link <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          {view === 'login' ? (
            <p>Don't have an account? <button onClick={() => { setView('register'); setErrorMsg(''); setSuccessMsg(''); }} className="text-indigo-400 hover:text-indigo-300 font-medium">Sign up</button></p>
          ) : view === 'register' ? (
            <p>Already have an account? <button onClick={() => { setView('login'); setErrorMsg(''); setSuccessMsg(''); }} className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</button></p>
          ) : (
            <p>Remember your credentials? <button onClick={() => { setView('login'); setErrorMsg(''); setSuccessMsg(''); }} className="text-indigo-400 hover:text-indigo-300 font-medium">Back to login</button></p>
          )}
        </div>
      </div>
    </div>
  );
}