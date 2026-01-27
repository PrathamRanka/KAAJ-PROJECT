from typing import Dict, Any
from pydantic import BaseModel

class MatchResult(BaseModel):
    program_id: int
    score: float
    breakdown: Dict[str, float]
    risk_tier: str # "A", "B", "C"

class MatchingEngine:
    def calculate_score(self, application_data: Dict[str, Any], program) -> MatchResult:
        """
        Calculates a 0-100 fit score for an application against a specific program.
        """
        score = 0.0
        breakdown = {}

        # 1. Credit Score (40% weight) 
        # Normalize FICO (300-850) to 0-40 points.
        # Let's say baseline 600 = 0 points, 800+ = 40 points.
        fico = application_data.get('fico', 0)
        fico_score = min(40, max(0, (fico - 600) * 0.2))
        score += fico_score
        breakdown['credit_score'] = fico_score

        # 2. Business Profile (30% weight)
        # Years in business. 1 year = 5 points, capping at 6 years = 30 points.
        years = application_data.get('years_in_business', 0)
        age_score = min(30, years * 5)
        score += age_score
        breakdown['business_profile'] = age_score

        # 3. Loan Fit (20% weight)
        # Close to max amount is riskier? Or just purely based on range? 
        # Let's simple simplistic: 20 points flat if eligible (since we filtered before).
        loan_score = 20
        score += loan_score
        breakdown['loan_fit'] = loan_score

        # 4. Risk Factors (10% weight)
        # Placeholder
        risk_score = 10
        score += risk_score
        breakdown['risk'] = risk_score
        
        final_score = round(score, 1)
        
        # Risk Tier Calculation
        risk_tier = "C" # High Risk
        if final_score >= 80:
            risk_tier = "A" # Low Risk
        elif final_score >= 50:
            risk_tier = "B" # Medium Risk

        return MatchResult(
            program_id=program.id,
            score=final_score,
            breakdown=breakdown,
            risk_tier=risk_tier
        )
