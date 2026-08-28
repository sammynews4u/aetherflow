'use client';

import { useState, useEffect } from 'react';
import { Activity, Database, Key, LayoutDashboard, ShieldCheck, ShieldAlert, XCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // User Session State
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // Data States
  const [isGenerating, setIsGenerating] = useState(false);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [newSchemaName, setNewSchemaName] = useState('');
  const [newSchemaDef, setNewSchemaDef] = useState('{\n  "transactionId": "string",\n  "amount": "number"\n}');
  const [isSavingSchema, setIsSavingSchema] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Initialize Session on Load
  useEffect(() => {
    const storedUser = localStorage.getItem('aether_user');
    const storedKey = localStorage.getItem('aether_api_key');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setApiKey(storedKey);
    } else {
      router.push('/auth'); // Redirect to login if not authenticated
    }
  }, [router]);

  // Fetch Data Scoped to User
  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      setIsLoadingData(true);
      try {
        const [schemasRes, logsRes] = await Promise.all([
          fetch(`/api/v1/schemas?userId=${user.id}`),
          fetch(`/api/v1/logs?userId=${user.id}`)
        ]);

        const schemasData = await schemasRes.json();
        const logsData = await logsRes.json();

        if (schemasData.status === 'success') setSchemas(schemasData.data);
        if (logsData.status === 'success') setLogs(logsData.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const generateApiKey = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyName: "Production Webhook Key", userId: user.id })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setApiKey(result.data.key);
        localStorage.setItem('aether_api_key', result.data.key);
      }
    } catch (error) {
      console.error("Failed to generate key", error);
    }
    setIsGenerating(false);
  };

  const saveSchema = async () => {
    if (!user) return;
    setIsSavingSchema(true);
    try {
      const response = await fetch('/api/v1/schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSchemaName || "Untitled Schema", schemaDef: newSchemaDef, userId: user.id })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setSchemas([result.data, ...schemas]);
        setNewSchemaName('');
      }
    } catch (error) {
      console.error("Failed to save schema", error);
    }
    setIsSavingSchema(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('aether_user');
    localStorage.removeItem('aether_api_key');
    router.push('/auth');
  };

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading Session...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col">
        <Link href="/" className="h-16 flex items-center px-6 border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors cursor-pointer">
          <div className="h-3 w-3 bg-indigo-500 rounded-full animate-pulse mr-3 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
          <span className="font-black tracking-wider text-lg bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            AETHERFLOW
          </span>
        </Link>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
             <LayoutDashboard size={18} /> Overview
          </button>
          <button onClick={() => setActiveTab('traffic')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'traffic' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
             <Activity size={18} /> Live Traffic
          </button>
          <button onClick={() => setActiveTab('schemas')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'schemas' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
             <Database size={18} /> Target Schemas
          </button>
          <button onClick={() => setActiveTab('apikeys')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'apikeys' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
             <Key size={18} /> API Keys
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800/80">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/20 flex items-center justify-between px-8">
          <h1 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Welcome back, {user.name}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 shadow-sm">
            Gateway Active <span className="relative flex h-2 w-2 ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Total Webhooks</h3>
                <p className="text-4xl font-black text-slate-100">{logs.length}</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Schemas Healed</h3>
                <p className="text-4xl font-black text-amber-400">{logs.filter(l => l.status === 'SUCCESS_HEALED').length}</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Avg AI Latency</h3>
                <p className="text-4xl font-black text-slate-100">
                  {logs.length > 0 ? `${Math.round(logs.reduce((acc, curr) => acc + curr.computeTimeMs, 0) / logs.length)}ms` : '0ms'}
                </p>
              </div>
            </div>
          )}

          {/* TAB: LIVE TRAFFIC */}
          {activeTab === 'traffic' && (
            <div className="max-w-6xl">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950 border-b border-slate-800/80">
                      <tr>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Compute Time</th>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Payload</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingData ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500 animate-pulse">Loading traffic...</td></tr>
                      ) : logs.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 border-dashed border-2 border-slate-800 mx-4 my-4 rounded-xl">Listening for incoming webhooks on port 4000...</td></tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                              {log.status === 'SUCCESS_NATIVE' && <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full w-max"><ShieldCheck size={14} /> Native Pass</span>}
                              {log.status === 'SUCCESS_HEALED' && <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-400 bg-amber-400/10 rounded-full w-max"><ShieldAlert size={14} /> AI Healed</span>}
                              {log.status === 'FAILED' && <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-400 bg-red-400/10 rounded-full w-max"><XCircle size={14} /> Failed</span>}
                            </td>
                            <td className="px-6 py-4 text-slate-300 font-mono">{log.computeTimeMs}ms</td>
                            <td className="px-6 py-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="px-6 py-4 font-mono text-[11px] text-slate-400 max-w-[300px] truncate">
                              {JSON.stringify(log.healedPayload || log.originalPayload)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SCHEMAS */}
          {activeTab === 'schemas' && (
            <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">Create Target Schema</h2>
                <p className="text-sm text-slate-400 mb-6">Define the strict rules your incoming webhooks must follow.</p>
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
                  <input 
                    type="text" 
                    placeholder="Schema Name (e.g., Stripe Payments)"
                    value={newSchemaName}
                    onChange={(e) => setNewSchemaName(e.target.value)}
                    className="w-full bg-black border border-slate-700 rounded-lg px-4 py-2 text-sm text-white mb-4 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <div className="relative">
                    <textarea 
                      value={newSchemaDef}
                      onChange={(e) => setNewSchemaDef(e.target.value)}
                      className="w-full h-48 bg-black border border-slate-700 rounded-lg p-4 text-sm text-emerald-400 font-mono mb-4 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    ></textarea>
                  </div>
                  <button 
                    onClick={saveSchema}
                    disabled={isSavingSchema}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-semibold transition text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                  >
                    {isSavingSchema ? 'Deploying...' : 'Deploy Target Schema'}
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">Active Schemas</h2>
                <p className="text-sm text-slate-400 mb-6">Your deployed routing rules.</p>
                <div className="space-y-4">
                  {schemas.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center"><p className="text-sm text-slate-500">No schemas deployed yet.</p></div>
                  ) : (
                    schemas.map((schema) => (
                      <div key={schema.id} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors"></div>
                        <h3 className="font-bold text-slate-200 mb-1">{schema.name}</h3>
                        <p className="text-[10px] text-slate-500 mb-3 font-mono">ID: {schema.id}</p>
                        <pre className="text-[11px] font-mono text-slate-400 bg-black p-3 rounded-lg border border-slate-800 overflow-x-auto">{schema.schemaDef}</pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: API KEYS */}
          {activeTab === 'apikeys' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-2">Project API Keys</h2>
              <p className="text-sm text-slate-400 mb-8">These keys authenticate your incoming webhooks from external providers.</p>
              
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-200">Production Webhook Key</h3>
                  </div>
                  <button 
                    onClick={generateApiKey}
                    disabled={isGenerating}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  >
                    {isGenerating ? 'Generating...' : '+ Generate New Key'}
                  </button>
                </div>

                {apiKey ? (
                  <div className="p-4 bg-black border border-emerald-500/30 rounded-xl flex justify-between items-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <code className="text-emerald-400 font-mono text-sm">{apiKey}</code>
                    <span className="text-xs text-slate-500 group-hover:text-emerald-400 transition-colors cursor-default">Active</span>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center text-sm text-slate-500">
                    No active keys for this project.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}