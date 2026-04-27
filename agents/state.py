from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class CrefahState(BaseModel):
    """
    Central state for the CREFAH (FairCredit Guardian) AI orchestration.
    Tracks the user profile, SHAP values, twin simulations, and bias audit results.
    """
    # Input
    profile: Dict[str, Any]
    
    # Processed Data
    shap_breakdown: List[Dict[str, Any]] = []
    twin_profiles: List[Dict[str, Any]] = []
    rag_context: Optional[str] = None
    community_pattern: Optional[str] = None
    rejection_delta_pct: float = 0.0
    
    # Audit Results
    bias_detected: bool = False
    bias_dimension: Optional[str] = None
    bias_confidence: float = 0.0
    audit_log: List[str] = []
    
    # Final Output
    strategy_cards: List[Dict[str, Any]] = []
    rbi_complaint_letter: Optional[str] = None
    
    # Error Handling
    error: Optional[str] = None
    metadata: Dict[str, Any] = {}
