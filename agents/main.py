import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List

# Import our agents and state
from agents.state import CrefahState
from agents.adversarial_auditor import adversarial_auditor
from agents.bias_intelligence import bias_intelligence
from agents.legal_synthesis import legal_synthesis
from agents.strategy_generator import strategy_generator
from agents.counterfactual_architect import counterfactual_architect

app = FastAPI(title="CREFAH AI Agent Service")

@app.post("/agents/adversarial-audit")
async def run_adversarial_audit(data: Dict[str, Any]):
    state = CrefahState(
        profile={}, # Not strictly needed for this agent but required by state
        shap_breakdown=data.get("shap_breakdown", []),
        twin_profiles=data.get("twins", [])
    )
    result_state = adversarial_auditor(state)
    return {
        "bias_detected": result_state.bias_detected,
        "bias_dimension": result_state.bias_dimension,
        "bias_confidence": result_state.bias_confidence,
        "audit_log": result_state.audit_log
    }

@app.post("/agents/bias-intelligence")
async def run_bias_intelligence(data: Dict[str, Any]):
    state = CrefahState(
        profile={
            "pinCode": data.get("city"), # Mapping for consistency
            "employmentType": data.get("job_type"),
            "loanType": data.get("loan_type")
        }
    )
    result_state = bias_intelligence(state)
    return {
        "community_pattern": result_state.community_pattern,
        "rejection_delta_pct": result_state.rejection_delta_pct
    }

@app.post("/agents/legal-synthesis")
async def run_legal_synthesis(data: Dict[str, Any]):
    state = CrefahState(
        profile={
            "fullName": data.get("user_name"),
            "loanAmount": data.get("loan_amount")
        },
        bias_dimension=data.get("bias_dimension"),
        bias_confidence=data.get("bias_confidence", 0.0),
        bias_detected=True # Trigger letter generation
    )
    # Set the bank name in metadata or profile if needed
    state.profile["bankName"] = data.get("bank_name", "The Lending Institution")
    
    result_state = legal_synthesis(state)
    return {
        "letter": result_state.rbi_complaint_letter
    }

@app.post("/agents/strategy")
async def run_strategy(data: Dict[str, Any]):
    state = CrefahState(
        profile={},
        shap_breakdown=data.get("shap_breakdown", []),
        metadata={"approval_prob": data.get("approval_prob", 0.5)}
    )
    result_state = strategy_generator(state)
    return {
        "strategies": result_state.strategy_cards
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
