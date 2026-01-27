from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

# --- Rule Schemas ---
class RuleTypeEnum(str, Enum):
    FILTER = "filter"
    SCORING = "scoring"

class RuleBase(BaseModel):
    rule_type: RuleTypeEnum
    field: str
    operator: str
    value_json: Any
    weight: float = 0.0
    description: Optional[str] = None

class RuleCreate(RuleBase):
    pass

class RuleRead(RuleBase):
    id: int
    policy_id: int
    class Config:
        from_attributes = True

# --- Policy Schemas ---
class PolicyBase(BaseModel):
    version: int = 1
    is_active: bool = True

class PolicyCreate(PolicyBase):
    program_id: int
    rules: List[RuleCreate]

class PolicyRead(PolicyBase):
    id: int
    program_id: int
    rules: List[RuleRead]
    class Config:
        from_attributes = True

# --- Program Schemas ---
class ProgramBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProgramCreate(ProgramBase):
    lender_id: int

class ProgramRead(ProgramBase):
    id: int
    lender_id: int
    policies: List[PolicyRead] = [] 
    class Config:
        from_attributes = True

# --- Lender Schemas ---
class LenderBase(BaseModel):
    name: str
    slug: str
    is_active: bool = True

class LenderCreate(LenderBase):
    pass

class LenderRead(LenderBase):
    id: int
    programs: List[ProgramRead] = []
    class Config:
        from_attributes = True

# --- Application Schemas ---
class ApplicationBase(BaseModel):
    business_name: str
    requested_amount: float
    data: Dict[str, Any]

class ApplicationCreate(ApplicationBase):
    pass

class DecisionRead(BaseModel):
    id: int
    application_id: int
    program_id: int
    status: str
    fit_score: float
    reasons: Dict[str, Any]
    
    # We will inject program name via validator or just use nested ProgramRead
    # Simple way: Pre-loading in query or Pydantic getter
    program: Optional[ProgramRead] = None
    
    class Config:
        from_attributes = True

# --- Application Schemas (Updated) ---
class ApplicationRead(ApplicationBase):
    id: int
    status: str
    decisions: List[DecisionRead] = []
    class Config:
        orm_mode = True
