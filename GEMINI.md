# CREFAH (FairCredit Guardian) - Project Mandates

CREFAH is an AI-powered web application designed to detect and explain bias in loan approval decisions.

## Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend/AI Orchestration:** Genkit, Google Gemini API
- **ML Service:** Python (FastAPI), Pandas, Scikit-Learn, SHAP, Fairlearn
- **Database/Hosting:** Firebase (Firestore, Hosting, Cloud Run for ML Service)

## Architecture
- **Monorepo Structure:**
  - `/frontend`: Next.js application.
  - `/ml-service`: Python FastAPI service for complex ML metrics and SHAP explanations.
  - `/firebase`: Configuration for Firestore, Storage, and Security Rules.

## Core Rules
- **Bias First:** Every feature must prioritize detecting or explaining bias using established fairness metrics (Demographic Parity, Equalized Odds).
- **Explainability:** AI-generated strategies must be backed by ML-derived SHAP values.
- **Privacy:** User data must be handled securely via Firebase Authentication and Firestore Security Rules.
- **Compliance:** AI-generated letters must adhere to RBI (Reserve Bank of India) guidelines.

## Development Workflow
- **Frontend:** `npm run dev` in `/frontend`
- **ML Service:** `python main.py` in `/ml-service` (within venv)
