import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-800/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 text-center max-w-4xl px-4 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
          CREFAH
        </h1>
        <h2 className="text-2xl md:text-4xl font-semibold mb-8 text-slate-200">
          Detect Loan Bias Before You Apply
        </h2>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl">
          FairCredit Guardian empowers you to analyze your loan application for hidden bias, providing AI-powered insights and actionable strategies to improve your approval odds.
        </p>

        <Link 
          href="/audit"
          className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-xl py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(20,184,166,0.4)]"
        >
          Audit My Application
        </Link>
      </div>

      <div className="mt-24 z-10 w-full max-w-5xl px-4">
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row justify-around items-center gap-6 shadow-xl">
          <div className="text-center">
            <p className="text-3xl font-bold text-teal-400 mb-1">450M+</p>
            <p className="text-sm text-slate-300 uppercase tracking-wider">Workers Affected</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-slate-600"></div>
          <div className="text-center">
            <p className="text-3xl font-bold text-rose-400 mb-1">72%</p>
            <p className="text-sm text-slate-300 uppercase tracking-wider">Higher Rejection for Gig Workers</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-slate-600"></div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-400 mb-1">0</p>
            <p className="text-sm text-slate-300 uppercase tracking-wider">Tools Existed (Until Now)</p>
          </div>
        </div>
      </div>
    </main>
  );
}
