'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Loader2, 
  ArrowRight, 
  Volume2, 
  MapPin, 
  TrendingUp, 
  RefreshCcw,
  Download
} from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const confettiFired = useRef(false);

  const fetchAudit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/audit/${params.auditId}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to load audit');
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.auditId) fetchAudit();
  }, [params.auditId]);

  useEffect(() => {
    if (data?.fairness_score !== undefined) {
      const duration = 2000;
      const startValue = 0;
      const endValue = data.fairness_score;
      let startTime: number | null = null;
      let animationFrame: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentScore = Math.floor(easeProgress * (endValue - startValue) + startValue);
        
        setDisplayScore(currentScore);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setDisplayScore(endValue);
          if (endValue > 70 && !confettiFired.current) {
            confettiFired.current = true;
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [data?.fairness_score]);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch('/api/complaint/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId: params.auditId })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      // Download Base64 as PDF
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${result.pdfBase64}`;
      link.download = result.fileName;
      link.click();
    } catch (err: any) {
      alert('Error downloading PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleReadResults = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const topBias = data?.bias_dimension || 'Unknown';
    const score = data?.fairness_score || 0;
    
    const utteranceEn = new SpeechSynthesisUtterance(`Your fairness score is ${score} out of 100. The primary bias dimension identified is ${topBias}.`);
    utteranceEn.lang = 'en-US';
    
    const utteranceHi = new SpeechSynthesisUtterance(`आपका निष्पक्षता स्कोर ${score} है। मुख्य पूर्वाग्रह आयाम ${topBias} है।`);
    utteranceHi.lang = 'hi-IN';
    
    window.speechSynthesis.speak(utteranceEn);
    window.speechSynthesis.speak(utteranceHi);
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-8 animate-pulse">
          <div className="h-12 bg-slate-800 rounded-xl w-3/4 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-800 rounded-2xl" />
            <div className="h-64 bg-slate-800 rounded-2xl md:col-span-2" />
          </div>
          <div className="h-48 bg-slate-800 rounded-2xl" />
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin w-10 h-10 text-teal-500" />
            <p className="text-slate-400 font-medium">Orchestrating AI Agents & Fairness Audit...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error Boundary
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-rose-500/30 flex flex-col items-center text-center max-w-md shadow-2xl">
          <AlertTriangle className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">Analysis in Progress</h2>
          <p className="text-slate-400 mb-6">We encountered a temporary delay while analyzing your application across 5 specialized AI agents.</p>
          <button 
            onClick={fetchAudit}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  const score = displayScore;
  let scoreColor = 'text-emerald-500';
  let gaugeColor = 'stroke-emerald-500';
  if (score < 40) {
    scoreColor = 'text-rose-500';
    gaugeColor = 'stroke-rose-500';
  } else if (score <= 60) {
    scoreColor = 'text-amber-500';
    gaugeColor = 'stroke-amber-500';
  }

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-10 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-500/30">
              <CheckCircle className="w-8 h-8 text-teal-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Fairness Audit Report</h1>
              <p className="text-slate-400 font-mono text-sm">Reference: {params.auditId}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReadResults}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-2xl transition-all border border-slate-700 shadow-lg"
            >
              <Volume2 className="w-5 h-5" />
              Read Results
            </button>
          </div>
        </div>

        {/* Top Grid: Gauge & Community Pattern */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gauge */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-30" />
            <h3 className="text-lg font-bold text-slate-400 mb-8 uppercase tracking-widest">Bias Guard Score</h3>
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="stroke-slate-800" strokeWidth="12" fill="transparent" r={radius} cx="50%" cy="50%" />
                <circle
                  className={`${gaugeColor} transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(20,184,166,0.3)]`}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  r={radius}
                  cx="50%"
                  cy="50%"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-6xl font-black tracking-tighter ${scoreColor}`}>{score}</span>
                <span className="text-slate-500 text-sm font-bold mt-1">PERCENTILE</span>
              </div>
            </div>
            <p className="mt-8 text-center text-slate-400 text-sm italic">
              "Based on 5-agent cross-validation"
            </p>
          </div>

          {/* Community Pattern & SHAP */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <MapPin className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Community Bias Insight</h3>
                  <p className="text-slate-400 text-sm">Contextual patterns from Firestore community_patterns</p>
                </div>
              </div>
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-300 leading-relaxed italic">
                  "{data.community_pattern || "No significant community-level bias patterns found for this demographic."}"
                </p>
                {data.rejection_delta_pct > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-rose-400 font-bold">
                    <TrendingUp className="w-5 h-5" />
                    <span>+{data.rejection_delta_pct}% higher rejection delta in this region</span>
                  </div>
                )}
              </div>
            </div>

            {/* SHAP Factors */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl h-64 flex flex-col">
              <h3 className="text-lg font-bold text-slate-400 mb-6 uppercase tracking-widest">SHAP Factor Attribution</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.shap_breakdown || []}
                    margin={{ top: 0, right: 30, left: 100, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis dataKey="factor" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    />
                    <Bar dataKey="impact" radius={[0, 6, 6, 0]} barSize={20}>
                      {data.shap_breakdown?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#14b8a6' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Grid: Twins & Strategies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Twin Simulation */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <RefreshCcw className="w-6 h-6 text-indigo-400" />
              Counterfactual Twins
            </h3>
            <div className="space-y-4">
              {data.twins?.map((twin: any, i: number) => (
                <div key={i} className="group bg-slate-950/50 hover:bg-slate-950 p-5 rounded-2xl border border-slate-800 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Scenario {i+1}</span>
                    <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded uppercase">Probability Flip</span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium mb-4">{twin.changed}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-1/3" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-3/4" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500">
                    <span>{twin.original || 'REJECTED'}</span>
                    <span>{twin.outcome || 'APPROVED'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategies */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-teal-400" />
              Strategic Actions
            </h3>
            <div className="space-y-3 flex-1">
              {data.strategy?.map((strat: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-slate-800 hover:border-teal-500/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{strat.action}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{strat.effort} effort</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-teal-400">{strat.prob_gain}</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase">GAIN</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Complaint Display */}
            {data.bias_detected && (
              <div className="mt-8 pt-8 border-t border-slate-800">
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-6 rounded-2xl mb-6">
                  <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Legal Evidence Ready
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Systemic bias detected in <b>{data.bias_dimension}</b>. An RBI Banking Ombudsman complaint has been auto-synthesized based on regulatory clauses.
                  </p>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-[0_10px_20px_rgba(79,70,229,0.3)] disabled:opacity-50"
                >
                  {downloadingPdf ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
                  Download Legal Complaint (PDF)
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RBI Letter View */}
        {data.letter && (
          <div className="bg-slate-900/90 border border-slate-800 p-10 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <FileText className="text-indigo-500" />
              Complaint Draft
            </h3>
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-slate-400 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
              {data.letter}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
