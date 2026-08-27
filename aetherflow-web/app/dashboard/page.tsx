'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // API Key State
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Schema State
  const [schemas, setSchemas] = useState<any[]>([]);
  const [newSchemaName, setNewSchemaName] = useState('');
  const [newSchemaDef, setNewSchemaDef] = useState('{\n  "transactionId": "string",\n  "amount": "number"\n}');
  const [isSavingSchema, setIsSavingSchema] = useState(false);

  // Fetch Schemas on load
  useEffect(() => {
    if (activeTab === 'schemas') {
      fetch('http://localhost:4000/api/v1/schemas')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') setSchemas(data.data);
        })
        .catch(err => console.error("Failed to load schemas", err));
    }
  }, [activeTab]);

  const generateApiKey = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyName: "Production Webhook Key" })
      });
      const result = await response.json();
      if (result.status === 'success') setApiKey(result.data.key);
    } catch (error) {
      console.error("Failed to generate key", error);
    }
    setIsGenerating(false);
  };

  const saveSchema = async () => {
    setIsSavingSchema(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSchemaName || "Untitled Schema", schemaDef: newSchemaDef })
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <div className="h-3 w-3 bg-indigo-500 rounded-full animate-pulse mr-3 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
          <span className="font-black tracking-wider text-lg bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            AETHERFLOW
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
             Overview
          </button>
          <button onClick={() => setActiveTab('schemas')} className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'schemas' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
             Target Schemas
          </button>
          <button onClick={() => setActiveTab('apikeys')} className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'apikeys' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
             API Keys
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/20 flex items-center justify-between px-8">
          <h1 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            {activeTab === 'overview' && 'Project Overview'}
            {activeTab === 'schemas' && 'Schema Registry'}
            {activeTab === 'apikeys' && 'Authentication'}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <h3 className="text-xs font-semibold text-slate-400 mb-1">Total Webhooks</h3>
                <p className="text-3xl font-black text-slate-100">12,492</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <h3 className="text-xs font-semibold text-slate-400 mb-1">Schemas Healed</h3>
                <p className="text-3xl font-black text-slate-100">843</p>
              </div>
            </div>
          )}

          {/* TAB: SCHEMAS */}
          {activeTab === 'schemas' && (
            <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create New Schema */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Create Target Schema</h2>
                <p className="text-sm text-slate-400 mb-6">Define the strict rules your incoming webhooks must follow.</p>
                
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
                  <input 
                    type="text" 
                    placeholder="Schema Name (e.g., Stripe Payments)"
                    value={newSchemaName}
                    onChange={(e) => setNewSchemaName(e.target.value)}
                    className="w-full bg-black border border-slate-700 rounded-lg px-4 py-2 text-sm text-white mb-4 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="relative">
                    <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded-bl-lg font-mono">JSON</div>
                    <textarea 
                      value={newSchemaDef}
                      onChange={(e) => setNewSchemaDef(e.target.value)}
                      className="w-full h-48 bg-black border border-slate-700 rounded-lg p-4 text-sm text-emerald-400 font-mono mb-4 focus:outline-none focus:border-indigo-500"
                    ></textarea>
                  </div>
                  <button 
                    onClick={saveSchema}
                    disabled={isSavingSchema}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                  >
                    {isSavingSchema ? 'Saving...' : 'Deploy Target Schema'}
                  </button>
                </div>
              </div>

              {/* Saved Schemas List */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Active Schemas</h2>
                <p className="text-sm text-slate-400 mb-6">Your deployed routing rules.</p>
                
                <div className="space-y-4">
                  {schemas.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center">
                      <p className="text-sm text-slate-500">No schemas deployed yet.</p>
                    </div>
                  ) : (
                    schemas.map((schema) => (
                      <div key={schema.id} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <h3 className="font-bold text-slate-200 mb-1">{schema.name}</h3>
                        <p className="text-xs text-slate-500 mb-3">ID: {schema.id}</p>
                        <pre className="text-[10px] font-mono text-slate-400 bg-black p-3 rounded-lg border border-slate-800">
                          {schema.schemaDef}
                        </pre>
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
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                  >
                    {isGenerating ? 'Generating...' : '+ Generate New Key'}
                  </button>
                </div>

                {apiKey ? (
                  <div className="p-4 bg-black border border-emerald-500/30 rounded-xl flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <code className="text-emerald-400 font-mono text-sm">{apiKey}</code>
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