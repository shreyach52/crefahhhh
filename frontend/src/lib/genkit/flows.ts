import { ai } from "../genkit";
import { z } from "genkit";

export const explanationFlow = ai.defineFlow(
  {
    name: "explanationFlow",
    inputSchema: z.object({
      profile: z.any(),
      mlResults: z.object({
        fairness_score: z.number(),
        feature_importance: z.record(z.number()),
        recommendation: z.string(),
      }),
    }),
    outputSchema: z.object({
      explanation: z.string(),
      strategy: z.string(),
      complaintLetter: z.string().optional(),
    }),
  },
  async (input) => {
    const prompt = `
      You are an expert financial advisor and credit fairness advocate.
      Analyze the following credit profile and ML-based fairness results:
      
      Profile: ${JSON.stringify(input.profile)}
      Fairness Score: ${input.mlResults.fairness_score}/100
      Top Factors: ${JSON.stringify(input.mlResults.feature_importance)}
      
      Tasks:
      1. Provide a clear, empathetic explanation of why the user's loan might be at risk or influenced by bias.
      2. Offer 3 actionable strategies to improve their approval chances.
      3. If the fairness score is below 70, generate a formal, RBI-compliant complaint letter the user can send to a bank's Nodal Officer.
      
      Format the output as JSON with keys: explanation, strategy, complaintLetter.
    `;

    const response = await ai.generate({
      model: "googleai/gemini-2.0-flash",
      prompt: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return response.output();
  }
);
