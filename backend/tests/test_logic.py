import pytest
from app.services.policy_engine import PolicyEngine
from app.services.matching_engine import MatchingEngine
from app.db.models import Rule, Policy, Program

# --- Mocks ---
class MockRule:
    def __init__(self, field, operator, value_json, rule_type="filter"):
        self.id = 1
        self.field = field
        self.operator = operator
        self.value_json = value_json
        self.rule_type = rule_type
        self.description = "Mock Rule"

class MockPolicy:
    def __init__(self, rules):
        self.program_id = 1
        self.program = MockProgram()
        self.rules = rules

class MockProgram:
    def __init__(self):
        self.id = 1
        self.name = "Test Program"

# --- Tests ---

def test_policy_engine_filters():
    engine = PolicyEngine()
    
    # Rule: FICO >= 700
    rule1 = MockRule("fico", ">=", 700)
    policy = MockPolicy([rule1])
    
    # Case 1: Pass
    app_data_pass = {"fico": 720}
    result_pass = engine.evaluate_application(app_data_pass, policy)
    assert result_pass.eligible is True
    assert len(result_pass.passed_rules) == 1
    
    # Case 2: Fail
    app_data_fail = {"fico": 650}
    result_fail = engine.evaluate_application(app_data_fail, policy)
    assert result_fail.eligible is False
    assert len(result_fail.failed_rules) == 1
    assert "too low" in result_fail.failed_rules[0].reason

def test_policy_engine_industry_exclusion():
    engine = PolicyEngine()
    
    # Rule: Industry NOT IN ["Gambling", "Adult"]
    rule = MockRule("industry", "not in", ["Gambling", "Adult"])
    policy = MockPolicy([rule])
    
    # Case 1: Allowed Industry
    res1 = engine.evaluate_application({"industry": "Construction"}, policy)
    assert res1.eligible is True
    
    # Case 2: Restricted Industry
    res2 = engine.evaluate_application({"industry": "Gambling"}, policy)
    assert res2.eligible is False

def test_matching_engine_scoring():
    engine = MatchingEngine()
    program = MockProgram()
    
    # 700 FICO (Expect (700-600)*0.2 = 20 pts)
    # 5 Years TIB (Expect 5*5 = 25 pts)
    # Loan Fit (Fixed 20 pts)
    # Risk (Fixed 10 pts)
    # Total Expect: 20 + 25 + 20 + 10 = 75
    
    data = {
        "fico": 700,
        "years_in_business": 5
    }
    
    result = engine.calculate_score(data, program)
    assert result.score == 75.0
    assert result.risk_tier == "B" # 50-79 is B

def test_matching_engine_caps():
    engine = MatchingEngine()
    program = MockProgram()
    
    # Max FICO 850 -> (850-600)*0.2 = 50, but capped at 40
    # Max TIB 10 -> 50, but capped at 30
    
    data = {
        "fico": 850,
        "years_in_business": 10
    }
    
    result = engine.calculate_score(data, program)
    # FICO=40, TIB=30, Loan=20, Risk=10 -> Total 100
    assert result.score == 100.0
    assert result.risk_tier == "A"
