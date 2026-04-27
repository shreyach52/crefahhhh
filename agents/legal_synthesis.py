import os
import google.generativeai as genai
from google.adk.agents import Agent
from .state import CrefahState

# Module-level load of the regulatory context (NotebookLM export)
try:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, "rbi_clauses.txt")
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            RAG_CONTEXT = f.read()
    else:
        RAG_CONTEXT = "General RBI guidelines on fair lending and non-discrimination."
except Exception:
    RAG_CONTEXT = "General RBI guidelines on fair lending and non-discrimination."

@Agent(
    name="legal_synthesis",
    description="Generates a formal RBI Banking Ombudsman complaint letter using regulatory context and detected bias evidence."
)
def legal_synthesis(state: CrefahState) -> CrefahState:
    """
    Synthesizes a legal complaint letter grounded in RBI regulations.
    Uses Gemini 1.5 Flash to map detected bias to specific regulatory clauses.
    """
    if not state.bias_detected:
        state.audit_log.append("Legal Synthesis: No bias detected. Skipping letter generation.")
        return state

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        state.error = "GEMINI_API_KEY missing for Legal Synthesis."
        return state

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    # Prepare inputs from state
    user_name = state.profile.get("fullName", "Applicant")
    bank_name = state.profile.get("bankName", "The Lending Institution")
    bias_dimension = state.bias_dimension
    bias_confidence = state.bias_confidence

    prompt = f"""
You are an RBI legal expert. Using ONLY these regulations:

{RAG_CONTEXT}

Write a formal Banking Ombudsman complaint letter for a borrower whose 
loan was rejected due to {bias_dimension} bias with {bias_confidence*100:.0f}% 
statistical confidence. Cite the most relevant clause numbers. 
Applicant name: {user_name}. Bank: {bank_name}.
"""

    try:
        response = model.generate_content(prompt)
        state.rbi_complaint_letter = response.text.strip()
        state.audit_log.append("Legal Synthesis: Formal RBI complaint letter generated successfully.")
    except Exception as e:
        state.error = f"Legal Synthesis: Failed to generate letter ({str(e)})"

    return state
