import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
            <span className="font-black tracking-widest text-xl text-white">AETHERFLOW</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-purple-400 transition">Features</a>
            <a href="#how-it-works" className="hover:text-purple-400 transition">How it Works</a>
            <a href="#pricing" className="hover:text-purple-400 transition">Pricing</a>
          </div>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="px-5 py-2.5 text-sm font-bold rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition">
              Sign In
            </Link>
            <Link href="/dashboard" className="px-5 py-2.5 text-sm font-bold rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 transition text-white shadow-lg shadow-purple-500/25">
              Get API Key
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center mt-12 md:mt-20">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-wide">
            ✨ Powered by Groq Llama-3 & Vercel
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
            Stop losing data to <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              broken webhooks.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AetherFlow is an autonomous middleware gateway that intercepts malformed API payloads and uses AI to heal schema drift in real-time. Zero latency. Zero lost transactions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-full bg-white text-black hover:bg-slate-200 transition shadow-xl">
              Start Building for Free
            </Link>
            <a href="#documentation" className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-full border border-white/20 hover:bg-white/5 transition flex items-center justify-center">
              Read the Docs
            </a>
          </div>
        </div>

        {/* Code Comparison Visual */}
        <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-2 gap-4">
          <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-pink-500/20 text-pink-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Incoming: Schema Drift</div>
            <pre className="font-mono text-xs text-slate-400 mt-4 leading-relaxed">
{`{
  "tx_identifer": "ERR-99281-BAD",
  "amt_paid": "1500.50 USD",
  "client_mail": "samuel@example.com",
  "state": "completed"
}`}
            </pre>
          </div>
          <div className="bg-[#0D0D12] border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <div className="absolute top-0 right-0 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">AetherFlow: Healed Output</div>
            <pre className="font-mono text-xs text-emerald-400 mt-4 leading-relaxed">
{`{
  "transactionId": "ERR-99281-BAD",
  "totalAmount": 1500.5,
  "customerEmail": "samuel@example.com",
  "status": "active"
}`}
            </pre>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="border-t border-white/10 bg-white/[0.02] py-24 px-6" id="features">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-black border border-white/5 hover:border-blue-500/30 transition">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 text-xl">⚡</div>
            <h3 className="text-xl font-bold mb-3">Sub-50ms Latency</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Deterministic Zod validation processes perfect payloads instantly. The LLM only triggers when drift is detected.</p>
          </div>
          <div className="p-8 rounded-3xl bg-black border border-white/5 hover:border-purple-500/30 transition">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 text-xl">🧠</div>
            <h3 className="text-xl font-bold mb-3">Semantic Mapping</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Stop writing fragile data patches. Our Groq Llama-3 engine infers the intent of broken data and maps it autonomously.</p>
          </div>
          <div className="p-8 rounded-3xl bg-black border border-white/5 hover:border-pink-500/30 transition">
            <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-6 text-xl">🛡️</div>
            <h3 className="text-xl font-bold mb-3">Universal Support</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Configure target schemas for Stripe, Shopify, GitHub, or any custom internal microservice with zero code.</p>
          </div>
        </div>
      </section>

    </div>
  );
}