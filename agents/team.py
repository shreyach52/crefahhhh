import os
from google.adk.teams import Team
from .state import CrefahState
from .counterfactual_architect import counterfactual_architect
from .adversarial_auditor import adversarial_auditor
from .bias_intelligence import bias_intelligence
from .legal_synthesis import legal_synthesis
from .strategy_generator import strategy_generator

# Define the CREFAH Audit Team
# Sequence: Context -> Simulation -> Auditing -> Strategy -> Synthesis
crefah_team = Team(
    name="crefah_audit_team",
    agents=[
        bias_intelligence,
        counterfactual_architect,
        adversarial_auditor,
        strategy_generator,
        legal_synthesis
    ]
)

def run_audit(profile_data: dict):
    """
    Runner function to execute the full audit pipeline for a given user profile.
    """
    initial_state = CrefahState(profile=profile_data)
    
    print(f"🚀 Starting AI Audit for {profile_data.get('fullName', 'Applicant')}...")
    
    final_state = crefah_team.run(initial_state)
    
    if final_state.error:
        print(f"❌ Audit failed: {final_state.error}")
    else:
        print(f"✅ Audit complete!")
        print(f"Bias Detected: {final_state.bias_detected}")
        if final_state.bias_detected:
            print(f"Dimension: {final_state.bias_dimension}")
            print(f"Confidence: {final_state.bias_confidence:.2f}")
    
    return final_state

if __name__ == "__main__":
    # Test profile
    test_profile = {
        "fullName": "Ravi Kumar",
        "income": 80000,
        "employmentType": "Freelancer",
        "loanType": "Personal",
        "loanAmount": 500000,
        "pinCode": "560034",
        "creditScore": 740,
        "coApplicant": False
    }
    
    run_audit(test_profile)
