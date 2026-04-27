"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Loader2, CheckCircle2, ArrowRight, UserPlus, FileText } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AnalyzePage() {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [twinResults, setTwinResults] = useState<any>(null);
  const [showTwin, setShowTwin] = useState(false);
  
  const [formData, setFormData] = useState({
    income: 50000,
    employment_type: 'Full-time',
    credit_score: 700,
    loan_type: 'Personal',
    location: 'Rural',
    gender: 'Male'
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Primary Analysis
      const mlRes = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const mlData = await mlRes.json();

      // 2. Twin Simulation (Urban comparison)
      const twinRes = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, location: 'Urban' })
      });
      const twinData = await twinRes.json();

      // 3. AI Explanation via Genkit
      const aiRes = await fetch('/api/explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: formData,
          mlResults: mlData
        })
      });
      const aiData = await aiRes.json();

      const finalResults = {
        ml: mlData,
        ai: aiData,
        strategies: [
          "Maintain your current credit utilization below 30%.",
          "Ensure no new credit inquiries in the next 3 months.",
          "Consider a co-applicant from an Urban zone to further offset location-based variance."
        ]
      };

      setResults(finalResults);
      setTwinResults(twinData);

      // 4. Save to History
      if (user) {
        await addDoc(collection(db, 'history'), {
          userId: user.uid,
          timestamp: serverTimestamp(),
          profile: formData,
          results: mlData,
          aiExplanation: aiData.explanation
        });
      }

    } catch (err) {
      console.error(err);
      alert("Error connecting to services.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Shield className="w-16 h-16 text-indigo-600 mb-6" />
        <h1 className="text-2xl font-bold mb-4">Secure Analysis Access</h1>
        <p className="text-slate-600 mb-8 text-center max-w-md">
          To protect your financial data and provide personalized insights, please sign in with Google.
        </p>
        <button 
          onClick={signInWithGoogle}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-all"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fairness Analysis</h1>
          <a href="/dashboard" className="text-indigo-600 font-semibold hover:underline">View History →</a>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form - Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-slate-800">Your Profile</h2>
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Annual Income ($)</label>
                  <input 
                    type="number" 
                    value={formData.income}
                    onChange={e => setFormData({...formData, income: Number(e.target.value)})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employment</label>
                  <select 
                    value={formData.employment_type}
                    onChange={e => setFormData({...formData, employment_type: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Freelance</option>
                    <option>Self-employed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Credit Score</label>
                  <input 
                    type="number" 
                    value={formData.credit_score}
                    onChange={e => setFormData({...formData, credit_score: Number(e.target.value)})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
                  <select 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option>Urban</option>
                    <option>Suburban</option>
                    <option>Rural</option>
                    <option>Zone-C</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Fairness"}
                </button>
              </form>
            </div>
          </div>

          {/* Results - Right Column */}
          <div className="lg:col-span-8 space-y-6">
            {!results ? (
              <div className="h-full min-h-[400px] bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-indigo-50 p-4 rounded-full mb-4">
                  <Shield className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready for Verification</h3>
                <p className="text-slate-500 max-w-xs">Submit your details to run the AI fairness audit and simulation.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Main Score Card */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${results.ml.recommendation === 'High' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {results.ml.recommendation} Approval Chance
                      </span>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-end gap-3 mb-2">
                      <span className="text-7xl font-black text-slate-900 leading-none">{results.ml.fairness_score}</span>
                      <span className="text-slate-400 font-bold text-lg mb-2">/ 100</span>
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fairness Guardian Score</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">AI Analysis</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {results.ai.explanation}
                    </p>
                  </div>
                </div>

                {/* Twin Simulation Toggle */}
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-indigo-400" />
                        Twin Simulation
                      </h3>
                      <p className="text-slate-400 text-sm max-w-sm">
                        Comparing your profile against a "Privileged Twin" in an Urban zone.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowTwin(!showTwin)}
                      className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 border border-white/10"
                    >
                      {showTwin ? "Hide Comparison" : "Show Comparison"}
                      <ArrowRight className={`w-4 h-4 transition-transform ${showTwin ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {showTwin && (
                    <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-8 animate-in zoom-in-95 duration-300">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Your Profile (Rural)</p>
                        <div className="text-4xl font-bold">{results.ml.fairness_score}<span className="text-lg opacity-40 ml-1">/100</span></div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase mb-4 tracking-widest">Privileged Twin (Urban)</p>
                        <div className="text-4xl font-bold">{twinResults.fairness_score}<span className="text-lg opacity-40 ml-1">/100</span></div>
                      </div>
                      <div className="col-span-2 bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-sm text-slate-300">
                          <span className="text-indigo-400 font-bold">Insight:</span> Moving to an Urban location increases the fairness score by {twinResults.fairness_score - results.ml.fairness_score} points, indicating geographic bias in the underlying model.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Complaint Letter Card */}
                {results.ai.complaintLetter && (
                  <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100">
                    <div className="flex items-center gap-3 mb-4 text-rose-700">
                      <FileText className="w-6 h-6" />
                      <h3 className="text-xl font-bold">RBI Complaint Letter Generated</h3>
                    </div>
                    <p className="text-rose-600/80 text-sm mb-6">
                      Since your fairness score is below threshold, we've prepared a formal letter you can send to the bank's Nodal Officer.
                    </p>
                    <button className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-700 transition-all">
                      Download PDF Letter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
