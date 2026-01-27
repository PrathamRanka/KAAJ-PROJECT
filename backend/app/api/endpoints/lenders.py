from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.db.models import Lender, Program, Policy, Rule
from app.schemas import schemas

router = APIRouter()

@router.post("/lenders/", response_model=schemas.LenderRead)
def create_lender(lender: schemas.LenderCreate, db: Session = Depends(get_db)):
    db_lender = Lender(**lender.dict())
    db.add(db_lender)
    db.commit()
    db.refresh(db_lender)
    return db_lender

@router.get("/lenders/", response_model=List[schemas.LenderRead])
def read_lenders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    lenders = db.query(Lender).offset(skip).limit(limit).all()
    return lenders

@router.post("/programs/", response_model=schemas.ProgramRead)
def create_program(program: schemas.ProgramCreate, db: Session = Depends(get_db)):
    db_program = Program(**program.dict())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program

@router.post("/policies/", response_model=schemas.PolicyRead)
def create_policy(policy: schemas.PolicyCreate, db: Session = Depends(get_db)):
    # 1. Create Policy
    db_policy = Policy(program_id=policy.program_id, version=policy.version, is_active=policy.is_active)
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    
    # 2. Create Rules
    for rule_data in policy.rules:
        db_rule = Rule(policy_id=db_policy.id, **rule_data.dict())
        db.add(db_rule)
    
    db.commit()
    db.refresh(db_policy)
    return db_policy

@router.put("/rules/{rule_id}", response_model=schemas.RuleRead)
def update_rule(rule_id: int, rule_in: schemas.RuleCreate, db: Session = Depends(get_db)):
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    # Update fields
    rule.field = rule_in.field
    rule.operator = rule_in.operator
    rule.value_json = rule_in.value_json
    rule.description = rule_in.description
    
    db.commit()
    db.refresh(rule)
    return rule

@router.post("/policies/{policy_id}/rules", response_model=schemas.RuleRead)
def create_rule(policy_id: int, rule_in: schemas.RuleCreate, db: Session = Depends(get_db)):
    # Verify policy exists
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    db_rule = Rule(policy_id=policy_id, **rule_in.dict())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

@router.delete("/rules/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    db.delete(rule)
    db.commit()
    return {"message": "Rule deleted"}

@router.post("/policies/{policy_id}/clone", response_model=schemas.PolicyRead)
def clone_policy(policy_id: int, db: Session = Depends(get_db)):
    # 1. Get original policy
    original_policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not original_policy:
         raise HTTPException(status_code=404, detail="Policy not found")

    # 2. Archive original (Optional: or just keep multiple actives? Let's archive for single-active-head)
    original_policy.is_active = False
    
    # 3. Create new policy
    new_version = (original_policy.version or 1) + 1
    new_policy = Policy(
        program_id=original_policy.program_id,
        version=new_version,
        is_active=True
    )
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)
    
    # 4. Copy Rules
    for rule in original_policy.rules:
        new_rule = Rule(
            policy_id=new_policy.id,
            rule_type=rule.rule_type,
            field=rule.field,
            operator=rule.operator,
            value_json=rule.value_json,
            weight=rule.weight,
            description=rule.description
        )
        db.add(new_rule)
    
    db.commit()
    return new_policy
