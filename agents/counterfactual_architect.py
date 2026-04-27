import os
import time
import requests
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from google.adk.agents import Agent
from .state import CrefahState

@Agent(
    name="counterfactual_architect",
    description="Agent responsible for generating and scoring counterfactual twins by calling the ML service."
)
def counterfactual_architect(state: CrefahState) -> CrefahState:
    """
    Calls the Cloud Run ML service /predict endpoint to get twin simulations.
    Implements retry logic with exponential backoff for robustness.
    """
    # Configuration - Default to local if not provided in env
    ml_service_url = os.getenv("ML_SERVICE_URL", "http://localhost:8000")
    predict_endpoint = f"{ml_service_url}/predict"
    
    max_retries = 3
    retry_delay = 5  # seconds
    
    for attempt in range(max_retries):
        try:
            # Call the ML service
            response = requests.post(
                predict_endpoint, 
                json=state.profile, 
                timeout=25  # Timeout slightly less than backoff for cleaner retries
            )
            
            # Check for success
            if response.status_code == 200:
                data = response.json()
                # Format the twins list into state
                state.twin_profiles = data.get("twins", [])
                return state
            
            # Handle specific slow service or 5xx errors
            if response.status_code >= 500:
                print(f"Service error ({response.status_code}), retrying in {retry_delay}s... (Attempt {attempt + 1}/{max_retries})")
            else:
                state.error = f"ML Service returned error {response.status_code}: {response.text}"
                return state

        except requests.exceptions.RequestException as e:
            print(f"Connection error: {str(e)}, retrying in {retry_delay}s... (Attempt {attempt + 1}/{max_retries})")
        
        # Backoff before next attempt
        if attempt < max_retries - 1:
            time.sleep(retry_delay)
    
    # Final error if all retries fail
    state.error = "Cloud Run ML service unavailable or slow after 3 retries."
    return state
