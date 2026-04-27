import { appRoute } from "@genkit-ai/next";
import { explanationFlow } from "@/lib/genkit/flows";

export const POST = appRoute(explanationFlow);
