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

        # 3. Loan Fit (20% weight) - Capacity to Repay
        # Ratio of Amount to Annual Revenue
        revenue = application_data.get('annual_revenue', 1) or 1
        amount = application_data.get('requested_amount', 0)
        
        # If accessing > 50% of revenue, score drops.
        # Ideal: Amount is < 10% of revenue.
        ratio = amount / revenue if revenue > 0 else 1.0
        
        if ratio <= 0.10:
             loan_score = 20 # Excellent capacity
        elif ratio <= 0.25:
             loan_score = 15 # Good
        elif ratio <= 0.50:
             loan_score = 10 # Moderate risk
        else:
             loan_score = 5  # High leverage
             
        score += loan_score
        breakdown['loan_fit'] = loan_score

        # 4. Risk Factors (10% weight)
        # Industry alignment preference (Mock logic)
        industry = application_data.get('industry', 'General')
        risk_score = 10
        if industry in ["Retail", "Restaurant"]:
            risk_score = 5 # Higher volatility
            
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
