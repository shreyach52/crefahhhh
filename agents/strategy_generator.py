import os
import json
import google.generativeai as genai
from google.adk.agents import Agent
from .state import CrefahState

@Agent(
    name="strategy_generator",
    description="Generates ranked action plans to improve loan approval probability based on SHAP factor analysis."
)
def strategy_generator(state: CrefahState) -> CrefahState:
    """
    Analyzes SHAP factors and approval probability to generate 4 actionable strategies.
    Estimates probability gains for each recommendation.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        state.error = "GEMINI_API_KEY missing for Strategy Generator."
        return state

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    # Prepare inputs
    shap_data = json.dumps(state.shap_breakdown)
    # Get current approval probability (if not in profile, default to 0.5 for strategy calc)
    current_prob = state.profile.get("approval_probability", 0.5)
    loan_type = state.profile.get("loanType", "Personal")
    has_co_applicant = state.profile.get("coApplicant", False)

    prompt = f"""
    You are a Loan Strategy Specialist.
    Inputs:
    - Current Approval Probability: {current_prob:.2f}
    - SHAP Factors (Negative values mean they hurt approval): {shap_data}
    - Loan Type: {loan_type}
    - Has Co-applicant: {has_co_applicant}
    
    Task:
    Generate exactly 4 ranked actions the applicant can take to improve their approval probability.
    
    Rules for Action Generation:
    1. Focus on the negative SHAP factors (the ones decreasing the score).
    2. Estimate 'prob_gain' by calculating how much the approval probability would likely increase if that specific SHAP factor were neutralized or improved.
    3. Categorize 'effort' as: easy, medium, or hard.
    4. Rank them 1 to 4 (1 being highest priority).
    5. Be specific to the loan type ({loan_type}).
    
    Output Format (JSON List):
    [
      {{"action": "...", "prob_gain": "+X%", "effort": "...", "rank": 1, "explanation": "..."}},
      ...
    ]
    
    Keep the total response concise (under 800 tokens).
    """

    try:
        response = model.generate_content(prompt)
        clean_text = response.text.strip().replace('```json', '').replace('```', '')
        strategies = json.loads(clean_text)
        
        # Store in state
        state.strategy_cards = strategies
        state.audit_log.append("Strategy Generator: Personalized action plan created with 4 ranked strategies.")
        
    except Exception as e:
        state.error = f"Strategy Generator: Failed to generate strategies ({str(e)})"

    return state
