import Link from 'next/link';
import { ShieldCheck, BarChart3, Scale, Gavel } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse pointer-events-none delay-1000" />

      {/* Navigation Bar */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-teal-500 p-1.5 rounded-lg">
            <ShieldCheck className="text-slate-950 w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter">CREFAH</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-white font-bold transition-colors">Dashboard</Link>
          <Link href="/audit" className="bg-white text-slate-950 px-6 py-2 rounded-xl font-bold hover:bg-teal-400 transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full mb-8">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-ping" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Powered by Gemini 1.5 Flash & ADK</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[1.1]">
          Erase Bias. <br />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">Empower Borrowers.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
          CREFAH (FairCredit Guardian) uses 5 specialized AI agents to audit your loan application, detect systemic bias, and generate formal RBI legal complaints—instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/audit"
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xl py-5 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-[0_20px_40px_rgba(20,184,166,0.3)] flex items-center gap-3"
          >
            Audit My Application
            <BarChart3 className="w-6 h-6" />
          </Link>
          <Link 
            href="/community"
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold text-xl py-5 px-12 rounded-2xl transition-all"
          >
            Explore Map
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl hover:border-teal-500/30 transition-all group">
            <Scale className="w-12 h-12 text-teal-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-3 text-white">Bias Detection</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Advanced SHAP attribution and counterfactual twins to prove if geography or job type affected your score.</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/30 transition-all group">
            <Gavel className="w-12 h-12 text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-3 text-white">Legal Synthesis</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Automatically draft Banking Ombudsman complaints citing specific RBI Master Circular clauses.</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/30 transition-all group">
            <BarChart3 className="w-12 h-12 text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-3 text-white">Strategy Cards</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Get 4 ranked actionable steps to improve your approval probability by neutralizing identified bias factors.</p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="relative z-10 border-t border-slate-900 py-12 text-center">
        <p className="text-slate-700 font-mono text-xs uppercase tracking-[0.3em]">Built for the RBI Fair Lending Mandate 2024</p>
      </footer>
    </main>
  );
}
