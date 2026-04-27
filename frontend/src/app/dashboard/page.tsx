"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Shield, Clock, ArrowLeft, BarChart, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        // Query the 'audits' collection instead of 'history'
        const q = query(
          collection(db, 'audits'),
          where('fullName', '==', user.displayName || 'Ravi Kumar'), // Fallback for demo
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Shield className="w-16 h-16 text-teal-500 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">Secure Dashboard Access</h1>
        <p className="text-slate-400 mb-8 text-center max-w-md">Please sign in to view your fairness audit history.</p>
        <Link href="/" className="bg-teal-500 text-slate-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-teal-400 transition-all">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link href="/audit" className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 hover:text-teal-400 hover:border-teal-500/50 transition-all shadow-xl">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Audit History</h1>
              <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Fairness Tracking for {user.displayName}</p>
            </div>
          </div>
          <Link href="/audit" className="hidden sm:flex items-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-bold py-3 px-6 rounded-2xl border border-teal-500/30 transition-all">
            <BarChart className="w-5 h-5" />
            New Audit
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-slate-900/50 p-16 rounded-3xl border border-slate-800 text-center backdrop-blur-md shadow-2xl">
            <Shield className="w-20 h-20 text-slate-800 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white mb-2">No Audits Found</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't run any bias detection audits yet. Start now to protect your financial rights.</p>
            <Link href="/audit" className="inline-block bg-teal-500 text-slate-900 px-10 py-4 rounded-2xl font-black shadow-[0_10px_20px_rgba(20,184,166,0.3)] hover:bg-teal-400 transition-all">
              Run First Audit
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Link 
                href={`/results/${item.id}`} 
                key={item.id} 
                className="block group bg-slate-900/50 hover:bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-teal-500/50 transition-all shadow-xl backdrop-blur-md"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-xl shadow-lg ${item.fairness_score >= 70 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                        {item.fairness_score}
                        <span className="text-[8px] uppercase tracking-tighter opacity-60">Score</span>
                      </div>
                      {item.bias_detected && (
                        <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 group-hover:text-teal-400 transition-colors">
                        {item.loanType} Loan
                        {item.fairness_score >= 70 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 uppercase tracking-wider text-teal-500/70">
                          {item.employmentType}
                        </span>
                        <span className="text-slate-700">|</span>
                        <span className="font-mono">{item.pinCode}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Loan Amount</p>
                      <p className="font-black text-white text-lg">₹{Number(item.loanAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Credit Score</p>
                      <p className="font-black text-teal-500 text-lg">{item.creditScore}</p>
                    </div>
                    <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-teal-500 group-hover:text-slate-900 transition-all">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
