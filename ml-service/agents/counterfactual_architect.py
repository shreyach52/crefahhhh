import requests
from google.adk.agents.llm_agent import Agent
from pydantic import BaseModel

# 1. Define the Tool to call our ML Service
def analyze_twin_profiles(profile_data: dict):
    """
    Calls the ML Service to analyze a profile and its counterfactual twin.
    Expects a dictionary with keys: income, employment_type, credit_score, loan_type, location, gender.
    """
    url = "http://localhost:8000/analyze_batch"
    
    # Create the 'Twin' (Urban counterpart)
    twin_profile = profile_data.copy()
    twin_profile["location"] = "Urban"
    
    payload = [profile_data, twin_profile]
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

# 2. Define the Counterfactual Architect Agent
counterfactual_architect = Agent(
    model='gemini-2.0-flash',
    name='counterfactual_architect',
    description="An agent that identifies and extracts twin profiles to reveal credit bias.",
    instruction=(
        "You are a credit fairness expert. When given a user's credit profile, "
        "use the 'analyze_twin_profiles' tool to compare their current situation "
        "with an Urban counterpart. Extract and explain the 'twin_profiles' results "
        "to show the impact of geographic location on their approval odds."
    ),
    tools=[analyze_twin_profiles],
)

if __name__ == "__main__":
    # Example usage
    sample_profile = {
        "income": 45000,
        "employment_type": "Freelance",
        "credit_score": 720,
        "loan_type": "Personal",
        "location": "Rural",
        "gender": "Female"
    }
    print("Running Agent Analysis...")
    # In a real ADK flow, you'd use counterfactual_architect.run()
