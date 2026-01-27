from sqlalchemy.orm import Session
from app.db.models import Application, Policy, Decision
from app.services.policy_engine import PolicyEngine
from app.services.matching_engine import MatchingEngine
from typing import List, Dict, Any
import json

class UnderwritingService:
    def __init__(self, db: Session):
        self.db = db
        self.policy_engine = PolicyEngine()
        self.matching_engine = MatchingEngine()

    def run_underwriting(self, application_id: int):
        # 1. Fetch Application
        application = self.db.query(Application).filter(Application.id == application_id).first()
        if not application:
            return {"error": "Application not found"}

        # 2. Fetch Active Policies
        # In a real app, we might filter policies by some initial criteria
        policies = self.db.query(Policy).filter(Policy.is_active == True).all()

        results = []

        # 3. Evaluate each Policy
        for policy in policies:
            # Policy Engine Check
            policy_result = self.policy_engine.evaluate_application(application.data, policy)
            
            fit_score = 0.0
            status = "REJECTED"
            
            if policy_result.eligible:
                status = "ELIGIBLE"
                # Matching Engine Score
                match_result = self.matching_engine.calculate_score(application.data, policy.program)
                fit_score = match_result.score
                risk_tier = match_result.risk_tier
            else:
                risk_tier = "N/A"
            
            # 4. Save Decision/Result
            reasons = {
                "passed": [r.dict() for r in policy_result.passed_rules],
                "failed": [r.dict() for r in policy_result.failed_rules],
                "suggestions": policy_result.suggestions,
                "risk_tier": risk_tier
            }
            
            decision = Decision(
                application_id=application.id,
                program_id=policy.program_id,
                status=status,
                fit_score=fit_score,
                reasons=reasons
            )
            self.db.add(decision)
            
            results.append({
                "program": policy.program.name,
                "status": status,
                "score": fit_score,
                "reasons": reasons
            })

        self.db.commit()
        return results
