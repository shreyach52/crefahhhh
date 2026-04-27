import { z } from 'genkit';
import { gemini20Flash } from '@genkit-ai/googleai';
import { ai } from '../../genkit';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8000';
const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8001';

export const runFullAudit = ai.defineFlow(
  {
    name: 'runFullAudit',
    inputSchema: z.object({
      fullName: z.string(),
      income: z.any(),
      employmentType: z.string(),
      loanType: z.string(),
      loanAmount: z.any(),
      pinCode: z.string(),
      creditScore: z.number(),
      coApplicant: z.boolean(),
    }),
  },
  async (input) => {
    try {
      // Step 1: Call Cloud Run /predict endpoint
      const predictData = await ai.run('ml-predict', async () => {
        const res = await fetch(`${ML_SERVICE_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error('ML Predict Service Unreachable');
        return res.json();
      });

      const { approval_prob, shap_breakdown, twins } = predictData;

      // Step 2: Call Python ADK agents (Simulated via Agent Service)
      const agentsOutput = await ai.run('agent-orchestration', async () => {
        const [biasRes, communityRes, strategyRes] = await Promise.all([
          fetch(`${AGENT_SERVICE_URL}/agents/adversarial-audit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shap_breakdown, twins }),
          }).then((r) => r.json()),
          fetch(`${AGENT_SERVICE_URL}/agents/bias-intelligence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city: input.pinCode, job_type: input.employmentType, loan_type: input.loanType }),
          }).then((r) => r.json()),
          fetch(`${AGENT_SERVICE_URL}/agents/strategy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shap_breakdown, approval_prob }),
          }).then((r) => r.json()),
        ]);

        const letterRes = await fetch(`${AGENT_SERVICE_URL}/agents/legal-synthesis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bias_dimension: biasRes.bias_dimension,
            bias_confidence: biasRes.bias_confidence,
            user_name: input.fullName,
            bank_name: "CREFAH Partner Bank",
            loan_amount: input.loanAmount,
          }),
        }).then((r) => r.json());

        return { biasRes, communityRes, strategyRes, letterRes };
      });

      const { biasRes, communityRes, strategyRes, letterRes } = agentsOutput;

      // Step 3: Compute fairness_score
      const fairness_score = Math.round((1 - (biasRes.bias_confidence || 0)) * 100);

      const report = {
        ...input,
        approval_prob,
        shap_breakdown,
        twins,
        fairness_score,
        bias_detected: biasRes.bias_detected,
        bias_dimension: biasRes.bias_dimension,
        community_pattern: communityRes.community_pattern,
        strategy: strategyRes.strategies || [],
        letter: letterRes.letter || "",
        timestamp: new Date().toISOString(),
      };

      // Step 4: Save complete FairnessReport to Firestore
      const docRef = await addDoc(collection(db, 'audits'), report);

      // Step 5: Return FairnessReport
      return { ...report, auditId: docRef.id };

    } catch (error: any) {
      // Graceful fallback using Gemini
      const fallback = await ai.generate({
        model: gemini20Flash,
        prompt: `The CREFAH audit system encountered an error: ${error.message}. 
        Provide a professional and encouraging message to the user (${input.fullName}) explaining that we are still finalizing their bias audit but have received their application. 
        Mention that their data is secured via Firebase and suggest they review their credit score in the meantime.`,
      });

      return {
        error: true,
        message: fallback.text,
        fairness_score: 0,
        status: "Processing"
      };
    }
  }
);
