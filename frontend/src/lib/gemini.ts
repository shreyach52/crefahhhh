import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

export const generateBiasExplanation = async (data: any) => {
  if (!process.env.GEMINI_API_KEY) {
    return "This is a mock explanation of bias because no Gemini API key was provided.";
  }
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `You are a financial fairness expert. Analyze this loan application data and generate a maximum 2-sentence explanation of potential bias or fairness: ${JSON.stringify(data)}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generateComplaintLetter = async (data: any) => {
  if (!process.env.GEMINI_API_KEY) {
    return "This is a mock RBI complaint letter. Please add GEMINI_API_KEY to your environment.";
  }
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `You are an expert consumer rights advocate in India. Generate a formal complaint letter to the Reserve Bank of India (RBI) regarding an unfair loan rejection. 
Applicant Name: ${data.user_name}
Audit ID: ${data.auditId}
Identified Bias Dimension: ${data.bias_dimension}
Confidence Level: ${data.bias_confidence}%
The letter should be professional, cite relevant RBI fair lending guidelines if applicable, and request an investigation. Keep it concise but complete.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};
