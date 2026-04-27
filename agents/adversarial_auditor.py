import os
import json
import pandas as pd
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from google.adk.agents import Agent
from fairlearn.metrics import demographic_parity_difference
from .state import CrefahState

@Agent(
    name="adversarial_auditor",
    description="Implements a ReAct loop to detect and validate bias dimensions in loan applications."
)
def adversarial_auditor(state: CrefahState) -> CrefahState:
    """
    Adversarial Auditor: Uses Gemini 1.5 Flash for reasoning (THINK) and Fairlearn for validation (ACT).
    """
    # Configure Gemini
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        state.error = "GEMINI_API_KEY env var is missing."
        return state

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    max_iterations = 3
    current_iteration = 0
    
    while current_iteration < max_iterations:
        current_iteration += 1
        state.audit_log.append(f"--- ReAct Iteration {current_iteration} ---")

        # --- THINK ---
        # Identify highest SHAP feature with outcome flip
        prompt = f"""
        Role: AI Fairness Auditor
        Task: Identify the primary bias dimension.
        
        SHAP Impact Data: {json.dumps(state.shap_breakdown)}
        Counterfactual Twins: {json.dumps(state.twin_profiles)}
        
        Reasoning Goal: Identify which feature has the highest SHAP impact AND shows an outcome flip in twins.
        
        Return ONLY a JSON object:
        {{
            "thought": "brief explanation of reasoning",
            "target_feature": "exact name of the feature to test"
        }}
        """
        
        try:
            response = model.generate_content(prompt)
            result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            thought = result.get("thought")
            target_feature = result.get("target_feature")
            
            state.audit_log.append(f"THINK: {thought}")
            
            if not target_feature:
                state.audit_log.append("ACT: No feature identified. Retrying...")
                continue

            # --- ACT ---
            # Compute demographic parity for the identified feature
            # We construct a temporary dataset from original + twins
            all_data = [state.profile] + state.twin_profiles
            df = pd.DataFrame(all_data)
            
            if target_feature not in df.columns:
                state.audit_log.append(f"ACT: Feature '{target_feature}' not found in profile keys.")
                continue

            # Binary outcomes based on approval probability
            y_pred = [1 if p.get('approval_probability', 0) > 0.5 else 0 for p in all_data]
            sensitive_features = df[target_feature]
            
            gap = demographic_parity_difference(
                y_true=y_pred,
                y_pred=y_pred,
                sensitive_features=sensitive_features
            )
            
            state.audit_log.append(f"ACT: Fairlearn computed Demographic Parity Gap for '{target_feature}': {gap:.4f}")

            # --- OBSERVE ---
            if gap > 0.10:
                state.bias_detected = True
                state.bias_dimension = target_feature
                state.bias_confidence = min(1.0, gap * 2)
                state.audit_log.append(f"OBSERVE: Gap {gap:.4f} > 0.10 threshold. Bias confirmed.")
                return state
            else:
                state.audit_log.append(f"OBSERVE: Gap {gap:.4f} is within acceptable bounds.")

        except Exception as e:
            state.audit_log.append(f"Error in ReAct loop: {str(e)}")
            break

    # Final Fallback
    if not state.bias_detected and state.shap_breakdown:
        # Use highest SHAP feature as default if inconclusive
        highest_shap = max(state.shap_breakdown, key=lambda x: x.get('impact', 0))
        state.bias_detected = True
        state.bias_dimension = highest_shap.get('factor')
        state.bias_confidence = 0.5
        state.audit_log.append(f"FINAL: Inconclusive after 3 iterations. Defaulting to highest SHAP factor: {state.bias_dimension}")

    return state
