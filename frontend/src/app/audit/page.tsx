'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mic } from 'lucide-react';

export default function AuditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    income: '',
    employmentType: 'Salaried',
    loanType: 'Personal',
    loanAmount: '',
    pinCode: '',
    creditScore: 700,
    coApplicant: false
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const startListening = (fieldName: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setRecordingField(fieldName);
    };
    
    recognition.onresult = (event: any) => {
      let transcript = event.results[0][0].transcript.trim();
      
      let parsedValue: any = transcript;
      
      if (fieldName === 'creditScore' || fieldName === 'income' || fieldName === 'loanAmount') {
        const num = transcript.replace(/[^0-9]/g, '');
        if (num) parsedValue = parseInt(num, 10);
      } else if (fieldName === 'pinCode') {
        parsedValue = transcript.replace(/[^0-9]/g, '').substring(0, 6);
      } else if (fieldName === 'coApplicant') {
        const lower = transcript.toLowerCase();
        parsedValue = lower.includes('yes') || lower.includes('true') || lower.includes('haan');
      } else if (fieldName === 'employmentType') {
        const lower = transcript.toLowerCase();
        if (lower.includes('freelance')) parsedValue = 'Freelancer';
        else if (lower.includes('gig')) parsedValue = 'Gig Worker';
        else if (lower.includes('self')) parsedValue = 'Self-Employed';
        else if (lower.includes('farm')) parsedValue = 'Farmer';
        else if (lower.includes('unemploy')) parsedValue = 'Unemployed';
        else parsedValue = 'Salaried';
      } else if (fieldName === 'loanType') {
        const lower = transcript.toLowerCase();
        if (lower.includes('home')) parsedValue = 'Home';
        else if (lower.includes('education')) parsedValue = 'Education';
        else if (lower.includes('msme') || lower.includes('business')) parsedValue = 'MSME';
        else if (lower.includes('vehicle') || lower.includes('car')) parsedValue = 'Vehicle';
        else if (lower.includes('gold')) parsedValue = 'Gold';
        else if (lower.includes('agri') || lower.includes('farm')) parsedValue = 'Agriculture';
        else if (lower.includes('micro')) parsedValue = 'Microfinance';
        else parsedValue = 'Personal';
      }
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: parsedValue
      }));
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setRecordingField(null);
    };
    
    recognition.onend = () => {
      setRecordingField(null);
    };
    
    recognition.start();
  };

  const submitForm = async (dataToSubmit: any) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to submit audit');
      
      router.push(`/results/${data.auditId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(formData);
  };

  useEffect(() => {
    if (demoMode) {
      const demoData = {
        fullName: 'Ravi Kumar',
        income: 80000,
        employmentType: 'Freelancer',
        loanType: 'Personal',
        loanAmount: 500000,
        pinCode: '560034',
        creditScore: 740,
        coApplicant: false
      };
      
      setFormData(demoData as any);
      
      const timer = setTimeout(() => {
        submitForm(demoData);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [demoMode]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-2xl mx-auto mb-6 bg-orange-500/10 border border-orange-500/50 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(249,115,22,0.15)]">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-slate-900 px-2 py-1 rounded font-black text-xs uppercase tracking-wider">Demo Mode</div>
          <p className="text-orange-200 text-sm hidden sm:block">Instantly run a live presentation with Ravi Kumar's profile.</p>
        </div>
        <button 
          onClick={() => setDemoMode(!demoMode)}
          type="button"
          className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${demoMode ? 'bg-orange-500' : 'bg-slate-700'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${demoMode ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Application Audit</h1>
        <p className="text-slate-400 text-center mb-8">Enter your details or use voice input to detect potential loan approval bias.</p>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <input
                  required
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  placeholder="John Doe"
                />
                <button type="button" onClick={() => startListening('fullName')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Mic className={`w-5 h-5 ${recordingField === 'fullName' ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-teal-400'}`} />
                </button>
              </div>
            </div>

            {/* Income */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Monthly Income (INR)</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  placeholder="50000"
                />
                <button type="button" onClick={() => startListening('income')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Mic className={`w-5 h-5 ${recordingField === 'income' ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-teal-400'}`} />
                </button>
              </div>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Employment Type</label>
              <div className="relative">
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors appearance-none"
                >
                  <option>Salaried</option>
                  <option>Freelancer</option>
                  <option>Gig Worker</option>
                  <option>Self-Employed</option>
                  <option>Farmer</option>
                  <option>Unemployed</option>
                </select>
                <button type="button" onClick={() => startListening('employmentType')} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-auto">
                  <Mic className={`w-5 h-5 ${recordingField === 'employmentType' ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-teal-400'}`} />
                </button>
              </div>
            </div>

            {/* Loan Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Loan Type</label>
              <div className="relative">
                <select
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors appearance-none"
                >
                  <option>Home</option>
                  <option>Education</option>
                  <option>Personal</option>
                  <option>MSME</option>
                  <option>Vehicle</option>
                  <option>Gold</option>
                  <option>Agriculture</option>
                  <option>Microfinance</option>
                </select>
                <button type="button" onClick={() => startListening('loanType')} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-auto">
                  <Mic className={`w-5 h-5 ${recordingField === 'loanType' ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-teal-400'}`} />
                </button>
              </div>
            </div>

            {/* Loan Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Loan Amount (INR)</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  placeholder="500000"
                />
                <button type="button" onClick={() => startListening('loanAmount')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Mic className={`w-5 h-5 ${recordingField === 'loanAmount' ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-teal-400'}`} />
                </button>
              </div>
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">PIN Code</label>
              <div className="relative">
                <input
                  required
                  type="text"
                  name="pinCode"
                  pattern="\d{6}"
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  placeholder="110001"
                />
                <button type="button" onClick={() => startListening('pinCode')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Mic className={`w-5 h-5 ${recordingField === 'pinCode' ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-teal-400'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Credit Score Slider */}
          <div className="pt-2">
            <label className="flex justify-between items-center text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                Credit Score
                <button type="button" onClick={() => startListening('creditScore')}>
                  <Mic className={`w-4 h-4 ${recordingField === 'creditScore' ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-teal-400'}`} />
                </button>
              </span>
              <span className="text-teal-400 font-bold">{formData.creditScore}</span>
            </label>
            <input
              type="range"
              name="creditScore"
              min="300"
              max="900"
              value={formData.creditScore}
              onChange={handleChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>300 (Poor)</span>
              <span>900 (Excellent)</span>
            </div>
          </div>

          {/* Co-applicant Toggle */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="coApplicant"
              name="coApplicant"
              checked={formData.coApplicant}
              onChange={handleChange}
              className="w-5 h-5 text-teal-500 bg-slate-900 border-slate-700 rounded focus:ring-teal-500 focus:ring-2"
            />
            <label htmlFor="coApplicant" className="flex items-center gap-2 text-sm font-medium text-slate-300 cursor-pointer">
              Include Co-applicant?
              <button type="button" onClick={() => startListening('coApplicant')}>
                <Mic className={`w-4 h-4 ${recordingField === 'coApplicant' ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-teal-400'}`} />
              </button>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-teal-800 disabled:text-teal-500 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all duration-200 flex justify-center items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Analyzing...
                </>
              ) : (
                'Run Bias Analysis'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
