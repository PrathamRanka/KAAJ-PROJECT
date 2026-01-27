from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    BROKER = "broker"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.BROKER)
    is_active = Column(Boolean, default=True)

class Lender(Base):
    __tablename__ = "lenders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    
    programs = relationship("Program", back_populates="lender", cascade="all, delete-orphan")

class Program(Base):
    __tablename__ = "programs"
    
    id = Column(Integer, primary_key=True, index=True)
    lender_id = Column(Integer, ForeignKey("lenders.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    lender = relationship("Lender", back_populates="programs")
    policies = relationship("Policy", back_populates="program", cascade="all, delete-orphan")

class Policy(Base):
    __tablename__ = "policies"
    
    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    program = relationship("Program", back_populates="policies")
    rules = relationship("Rule", back_populates="policy", cascade="all, delete-orphan")

class RuleType(str, enum.Enum):
    FILTER = "filter"       # Hard Knockout (e.g. State != NY)
    SCORING = "scoring"     # Adds to score (e.g. FICO > 700 adds 10 points)

class Rule(Base):
    __tablename__ = "rules"
    
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    rule_type = Column(String, default=RuleType.FILTER)
    field = Column(String, nullable=False) # e.g. 'fico', 'revenue', 'state'
    operator = Column(String, nullable=False) # e.g. '>=', '==', 'in'
    value_json = Column(JSON, nullable=False) # e.g. 700, ["NY", "CA"]
    weight = Column(Float, default=0.0)
    description = Column(String, nullable=True)
    
    policy = relationship("Policy", back_populates="rules")

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String, nullable=False)
    requested_amount = Column(Float, nullable=False)
    status = Column(String, default="PENDING")
    
    # Stores flexible attributes: fico, revenue, years_in_business, etc.
    data = Column(JSON, nullable=False) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    decisions = relationship("Decision", back_populates="application", cascade="all, delete-orphan")

class Decision(Base):
    __tablename__ = "decisions"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    status = Column(String, default="REJECTED") # APPROVED, ELIGIBLE, REJECTED
    fit_score = Column(Float, default=0.0)
    reasons = Column(JSON, nullable=True) # { "passed": [], "failed": [] }
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    application = relationship("Application", back_populates="decisions")
    program = relationship("Program")

