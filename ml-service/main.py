from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="CREFAH ML Service - Lightweight")

class CreditProfile(BaseModel):
    income: float
    employment_type: str
    credit_score: int
    loan_type: str
    location: str
    gender: str

@app.get("/")
async def root():
    return {"message": "CREFAH ML Service is running (Lightweight Mode)"}

@app.post("/analyze")
async def analyze_profile(profile: CreditProfile):
    try:
        # Simulate scoring logic
        score = 50
        score += (profile.credit_score - 300) / 10
        score += min(profile.income / 10000, 20)
        
        # Simulated Bias
        bias_gap = 0.0
        if profile.location.lower() in ["rural", "zone-c"]:
            score -= 12
            bias_gap = 0.22
        
        if profile.employment_type.lower() == "freelance":
            score -= 5

        fairness_score = int(max(0, min(100, 100 - (bias_gap * 200))))

        return {
            "approval_probability": float(max(0.0, min(1.0, score / 100))),
            "fairness_score": fairness_score,
            "bias_gap": bias_gap,
            "recommendation": "High" if score > 75 else "Medium" if score > 50 else "Low"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze_batch")
async def analyze_batch(profiles: list[CreditProfile]):
    results = []
    for profile in profiles:
        res = await analyze_profile(profile)
        results.append(res)
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
