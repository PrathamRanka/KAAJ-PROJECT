from typing import Any, Dict, List, Optional
from pydantic import BaseModel
import operator

class RuleResult(BaseModel):
    rule_id: int
    rule_description: str
    passed: bool
    reason: str

class PolicyResult(BaseModel):
    program_id: int
    program_name: str
    eligible: bool
    failed_rules: List[RuleResult]
    passed_rules: List[RuleResult]
    suggestions: List[str] = []

# Safe operator mapping
OPS = {
    ">": operator.gt,
    ">=": operator.ge,
    "<": operator.lt,
    "<=": operator.le,
    "==": operator.eq,
    "!=": operator.ne,
    "in": lambda x, y: x in y,
    "not in": lambda x, y: x not in y,
}

class PolicyEngine:
    def evaluate_application(self, application_data: Dict[str, Any], policy) -> PolicyResult:
        """
        Evaluates an application against a specific policy (set of rules).
        """
        passed_rules = []
        failed_rules = []
        is_eligible = True

        for rule in policy.rules:
            if rule.rule_type == "filter":
                field_value = application_data.get(rule.field)
                
                if field_value is None:
                    passed = False
                    reason = f"Missing data for '{rule.field}'."
                else:
                    passed = self._evaluate_condition(field_value, rule.operator, rule.value_json)
                    
                    # Generate "Explainable AI" Reason
                    if passed:
                        reason = f"Checked {rule.field}: {field_value} is {rule.operator} {rule.value_json}."
                    else:
                        # Template based explanation
                        reason = self._generate_explanation(rule.field, field_value, rule.operator, rule.value_json)

                result = RuleResult(
                    rule_id=rule.id,
                    rule_description=rule.description or str(rule.id),
                    passed=passed,
                    reason=reason
                )

                if passed:
                    passed_rules.append(result)
                else:
                    failed_rules.append(result)
                    is_eligible = False
                    
                    # Generate Suggestion
                    suggestion = self._generate_suggestion(rule.field, rule.operator, rule.value_json)
                    if suggestion:
                         # We'll attach it to the PolicyResult later, or maybe the RuleResult?
                         # For now, let's keep it simple and just pass it out.
                     # Compile suggestions
        suggestions = []
        for rule in policy.rules:
             if rule.rule_type == "filter":
                 val = application_data.get(rule.field)
                 if val is not None and not self._evaluate_condition(val, rule.operator, rule.value_json):
                     sugg = self._generate_suggestion(rule.field, rule.operator, rule.value_json)
                     if sugg:
                         suggestions.append(sugg)

        return PolicyResult(
            program_id=policy.program_id,
            program_name=policy.program.name if policy.program else "Unknown",
            eligible=is_eligible,
            failed_rules=failed_rules,
            passed_rules=passed_rules,
            suggestions=suggestions
        )

    def _generate_suggestion(self, field: str, operator: str, target: Any) -> str:
        # Simple heuristic
        if field == "fico":
            return f"Increase FICO score to at least {target}."
        if field == "annual_revenue":
            return f"Increase Annual Revenue to ${target}."
        if field == "years_in_business":
            return f"Wait until business is {target} years old."
        return ""


    def _evaluate_condition(self, actual_value: Any, op_str: str, target_value: Any) -> bool:
        op_func = OPS.get(op_str)
        if not op_func:
            return False
        
        try:
            return op_func(actual_value, target_value)
        except Exception:
            return False

    def _generate_explanation(self, field: str, actual: Any, operator: str, target: Any) -> str:
        """
        Generates a human-friendly rejection reason.
        """
        field_readable = field.replace("_", " ").title()
        
        if operator == ">":
            return f"The {field_readable} of {actual} is too low. It must be greater than {target}."
        elif operator == ">=":
            return f"The {field_readable} of {actual} is too low. A minimum of {target} is required."
        elif operator == "<":
            return f"The {field_readable} of {actual} is too high. It must be less than {target}."
        elif operator == "<=":
            return f"The {field_readable} of {actual} is too high. A maximum of {target} is allowed."
        elif operator == "==":
            return f"The {field_readable} must be exactly {target}, but was {actual}."
        elif operator == "in":
            return f"The {field_readable} '{actual}' is not in the allowed list: {target}."
        else:
            return f"{field_readable} ({actual}) failed condition {operator} {target}."
