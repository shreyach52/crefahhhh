import os
import json
import google.generativeai as genai
from typing import Optional
from google.adk.agents import Agent
from .state import CrefahState

# Import firestore - handle cases where library might not be installed or authenticated
try:
    from google.cloud import firestore
    FIRESTORE_AVAILABLE = True
except ImportError:
    FIRESTORE_AVAILABLE = False

@Agent(
    name="bias_intelligence",
    description="Queries Firestore for community patterns or synthesizes estimates using Gemini and RBI context."
)
def bias_intelligence(state: CrefahState) -> CrefahState:
    """
    Retrieves historical community bias patterns.
    Fallbacks to Gemini-driven synthesis using RBI regulatory context if data is missing.
    """
    # 1. Load RBI Context if not already present
    if not state.rag_context:
        try:
            # Look for rbi_clauses.txt in the root directory
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            file_path = os.path.join(base_dir, "rbi_clauses.txt")
            if os.path.exists(file_path):
                with open(file_path, "r") as f:
                    state.rag_context = f.read()
            else:
                state.rag_context = "RBI guidelines emphasize non-discrimination and fairness in digital lending."
        except Exception:
            state.rag_context = "RBI guidelines emphasize non-discrimination and fairness in digital lending."

    # 2. Extract query parameters
    city = state.profile.get("city") or state.profile.get("pinCode") # Use PIN if city missing
    job_type = state.profile.get("employmentType")
    loan_type = state.profile.get("loanType")
    
    found_pattern = False

    # 3. Query Firestore (if available)
    if FIRESTORE_AVAILABLE:
        try:
            # Note: Requires GOOGLE_APPLICATION_CREDENTIALS or environment-based auth
            db = firestore.Client()
            query = db.collection("community_patterns") \
                      .where("city", "==", city) \
                      .where("jobType", "==", job_type) \
                      .limit(1)
            
            docs = query.stream()
            for doc in docs:
                data = doc.to_dict()
                state.community_pattern = data.get("pattern", f"Historical bias detected for {job_type}s in {city}.")
                state.rejection_delta_pct = float(data.get("rejection_delta", 0.0))
                found_pattern = True
                state.audit_log.append(f"Bias Intelligence: Found matching community pattern in Firestore.")
                break
        except Exception as e:
            state.audit_log.append(f"Bias Intelligence: Firestore query failed ({str(e)}). Falling back to synthesis.")

    # 4. Fallback: Synthesize using Gemini
    if not found_pattern:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            state.error = "GEMINI_API_KEY missing for Bias Intelligence synthesis."
            return state
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""
        Context (RBI Guidelines): {state.rag_context}
        User Profile: {json.dumps(state.profile)}
        
        Task: No historical community data found for this specific profile (City: {city}, Job: {job_type}).
        Synthesize an estimated 'rejection delta' percentage (how much more likely this profile is to be rejected compared to a standard salaried applicant) based on the RBI context and known systemic biases.
        
        Return ONLY a JSON object:
        {{
            "community_pattern": "brief description of the synthesized bias pattern",
            "rejection_delta_pct": float
        }}
        """
        
        try:
            response = model.generate_content(prompt)
            clean_text = response.text.strip().replace('```json', '').replace('```', '')
            result = json.loads(clean_text)
            
            state.community_pattern = result.get("community_pattern", "Estimated bias pattern.")
            state.rejection_delta_pct = float(result.get("rejection_delta_pct", 0.0))
            state.audit_log.append(f"Bias Intelligence: Synthesized pattern using Gemini and RBI context.")
        except Exception as e:
            state.error = f"Bias Intelligence: Synthesis failed ({str(e)})"
            
    return state
