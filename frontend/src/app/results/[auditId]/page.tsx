'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, FileText, Loader2, ArrowRight, Volume2 } from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [complaintLetter, setComplaintLetter] = useState('');

  const [displayScore, setDisplayScore] = useState(0);
  const confettiFired = useRef(false);

  useEffect(() => {
    const fetchAudit = async () => {
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

  const handleGenerateLetter = async () => {
    setGeneratingLetter(true);
    try {
      const topBias = data.shap_breakdown?.[0];
      const res = await fetch('/api/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId: params.auditId,
          user_name: data.fullName,
          bias_dimension: topBias ? topBias.factor : 'Unknown',
          bias_confidence: topBias ? topBias.impact : 50
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setComplaintLetter(result.letter);
    } catch (err: any) {
      alert('Error generating letter: ' + err.message);
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleReadResults = () => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }
    
    window.speechSynthesis.cancel();
    
    const topBias = data?.shap_breakdown?.[0]?.factor || 'Unknown';
    const score = data?.fairness_score || 0;
    
    const englishText = `Your fairness score is ${score} out of 100. The top bias factor identified is ${topBias}.`;
    const hindiText = `आपका निष्पक्षता स्कोर ${score} है। पहचाना गया शीर्ष पूर्वाग्रह कारक ${topBias} है।`;
    
    const utteranceEn = new SpeechSynthesisUtterance(englishText);
    utteranceEn.lang = 'en-US';
    
    const utteranceHi = new SpeechSynthesisUtterance(hindiText);
    utteranceHi.lang = 'hi-IN';
    
    window.speechSynthesis.speak(utteranceEn);
    window.speechSynthesis.speak(utteranceHi);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-500">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Audit Not Found</h2>
        <p className="text-slate-400">{error}</p>
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
    <div className="min-h-screen bg-slate-900 text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Bias Alert */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Audit Results</h1>
              <p className="text-slate-400">ID: {params.auditId}</p>
            </div>
            <button
              onClick={handleReadResults}
              className="ml-4 flex items-center gap-2 bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 font-medium py-2 px-4 rounded-xl transition-all border border-teal-500/50"
            >
              <Volume2 className="w-5 h-5" />
              Read Results
            </button>
          </div>
          {score < 40 && (
            <div className="bg-rose-500/20 border border-rose-500 text-rose-200 p-4 rounded-xl flex items-start gap-3 max-w-md">
              <AlertTriangle className="shrink-0 w-6 h-6 text-rose-500" />
              <div>
                <h3 className="font-bold text-rose-400 mb-1">High Bias Detected</h3>
                <p className="text-sm">Your application has a high probability of unfair rejection based on demographic or employment data.</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Gauge & Explanation */}
          <div className="space-y-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center h-80">
              <h3 className="text-lg font-medium text-slate-300 mb-6">Fairness Score</h3>
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="stroke-slate-700"
                    strokeWidth="10"
                    fill="transparent"
                    r={radius}
                    cx="50%"
                    cy="50%"
                  />
                  <circle
                    className={`${gaugeColor} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
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
                  <span className={`text-5xl font-black ${scoreColor}`}>{score}</span>
                  <span className="text-slate-400 text-sm mt-1">/ 100</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl">
              <h3 className="text-lg font-medium text-slate-300 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-400" />
                AI Analysis
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                {data.explanation}
              </p>
            </div>
          </div>

          {/* Right Col: SHAP Chart & Twins & Strategies */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* SHAP Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl h-80 flex flex-col">
              <h3 className="text-lg font-medium text-slate-300 mb-4">Key Factors Driving Decision (SHAP Breakdown)</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.shap_breakdown?.map((item: any) => ({ factor: item.factor, [item.factor]: item.impact })) || []}
                    margin={{ top: 0, right: 30, left: 60, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis dataKey="factor" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      formatter={(val) => [`${val}% Impact`, '']}
                    />
                    {data.shap_breakdown?.map((item: any, index: number) => (
                      <Bar 
                        key={item.factor}
                        dataKey={item.factor} 
                        stackId="a"
                        radius={[0, 4, 4, 0]}
                        fill={index === 0 ? '#f43f5e' : '#14b8a6'} 
                        animationBegin={index * 150} 
                        isAnimationActive={true}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Twins & Strategies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Twin Simulation */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl">
                <h3 className="text-lg font-medium text-slate-300 mb-4">Twin Simulations</h3>
                <div className="space-y-4">
                  {data.twins?.map((twin: any, i: number) => (
                    <div key={i} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2">If you:</p>
                      <p className="font-medium text-white mb-3">{twin.changed}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-rose-400">{twin.original}</span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <span className="text-teal-400 font-bold">{twin.outcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategies */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl flex flex-col">
                <h3 className="text-lg font-medium text-slate-300 mb-4">Action Plan</h3>
                <div className="space-y-3 flex-1">
                  {data.strategy?.map((strat: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                      <span className="text-sm text-slate-200">{strat.title}</span>
                      <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-1 rounded">
                        {strat.probabilityGain}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Complaint Letter Gen */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <button
                    onClick={handleGenerateLetter}
                    disabled={generatingLetter}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all"
                  >
                    {generatingLetter ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                    Generate RBI Complaint
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Complaint Letter Modal/Display */}
        {complaintLetter && (
          <div className="bg-slate-800/80 border border-indigo-500/50 p-8 rounded-2xl relative mt-8 shadow-2xl">
            <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
              <FileText /> Generated RBI Complaint Letter
            </h3>
            <button 
              onClick={() => setComplaintLetter('')}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
            >
              &times;
            </button>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
              {complaintLetter}
            </div>
            <button 
              className="mt-4 border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 px-6 py-2 rounded-lg transition-colors"
              onClick={() => navigator.clipboard.writeText(complaintLetter)}
            >
              Copy to Clipboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
