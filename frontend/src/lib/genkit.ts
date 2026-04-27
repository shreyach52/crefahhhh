import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

export * from './genkit/flows/auditFlow';
export * from './genkit/flows/complaintFlow';
