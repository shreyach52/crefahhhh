import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateBiasExplanation } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Mock Fairness Score (e.g., 0-100)
    // We'll generate a random score but bias it lower for certain employment types for demo
    let fairness_score = Math.floor(Math.random() * 40) + 50; // 50-90
    if (['Gig Worker', 'Unemployed', 'Farmer'].includes(data.employmentType)) {
      fairness_score = Math.floor(Math.random() * 30) + 20; // 20-50
    }

    // Mock SHAP breakdown
    const shap_breakdown = [
      { factor: 'Income Level', impact: Math.floor(Math.random() * 30) + 10 },
      { factor: 'Employment Type', impact: Math.floor(Math.random() * 40) + 15 },
      { factor: 'Credit Score', impact: Math.floor(Math.random() * 20) + 5 },
      { factor: 'PIN Code (Location)', impact: Math.floor(Math.random() * 15) + 5 },
      { factor: 'Loan Type', impact: Math.floor(Math.random() * 10) + 2 },
    ];

    // Mock Twin Simulation
    const twins = [
      { changed: 'Changed Employment to Salaried', outcome: 'Approved', original: 'Rejected' },
      { changed: 'Increased Income by 20%', outcome: 'Approved', original: 'Rejected' },
    ];

    // Mock Strategy
    const strategy = [
      { title: 'Add a Co-applicant', probabilityGain: '+25%' },
      { title: 'Provide Income Proof Alternative', probabilityGain: '+15%' },
      { title: 'Apply for MSME Loan Instead', probabilityGain: '+10%' }
    ];

    // Gemini Explanation
    const explanation = await generateBiasExplanation({ ...data, fairness_score });

    const auditDoc = {
      ...data,
      fairness_score,
      shap_breakdown,
      twins,
      strategy,
      explanation,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'audits'), auditDoc);

    return NextResponse.json({
      auditId: docRef.id,
      ...auditDoc,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Audit API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
