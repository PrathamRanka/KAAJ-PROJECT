import sys
import os
import json

# Ensure app is in path
sys.path.append(os.getcwd())

from app.core.database import SessionLocal, engine
from app.db.models import User, Lender, Program, Policy, Rule, Base
from app.core.security import get_password_hash

def seed():
    # Re-create tables to clear old data 
    print("Dropping all tables to ensure clean slate...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding database with Real Lender Guidelines (Fresh)...")

        # 1. Admin User
        user = User(
            email="admin@kaaj.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(user)

        # Helper to create Lender (no need to check for existing since we dropped all)
        def create_lender(name, slug):
            l = Lender(name=name, slug=slug)
            db.add(l)
            db.flush()
            return l

        # --- Lender 1: Stearns Bank ---
        lender_stearns = create_lender("Stearns Bank", "stearns-bank")
        
        prog_stearns = Program(lender_id=lender_stearns.id, name="Equipment Finance Credit Box")
        db.add(prog_stearns)
        db.flush()

        # Tier 1 Policy
        p_stearns_t1 = Policy(program_id=prog_stearns.id, version=1)
        db.add(p_stearns_t1)
        db.flush()
        
        db.add(Rule(policy_id=p_stearns_t1.id, field="fico", operator=">=", value_json=725, description="Tier 1 FICO"))
        db.add(Rule(policy_id=p_stearns_t1.id, field="years_in_business", operator=">=", value_json=3, description="Tier 1 TIB"))
        db.add(Rule(policy_id=p_stearns_t1.id, field="industry", operator="not in", value_json=["Gaming", "Hazmat", "Oil & Gas", "Adult"], description="Excluded Industries"))

        # --- Lender 2: Apex Commercial Capital ---
        lender_apex = create_lender("Apex Commercial Capital", "apex-capital")
        prog_apex = Program(lender_id=lender_apex.id, name="Standard Pricing (App-only)")
        db.add(prog_apex)
        db.flush()

        p_apex_a = Policy(program_id=prog_apex.id, version=1)
        db.add(p_apex_a)
        db.flush()
        db.add(Rule(policy_id=p_apex_a.id, field="fico", operator=">=", value_json=700, description="A Rate FICO"))
        db.add(Rule(policy_id=p_apex_a.id, field="years_in_business", operator=">=", value_json=5, description="A Rate TIB"))
        db.add(Rule(policy_id=p_apex_a.id, field="requested_amount", operator="<=", value_json=200000, description="Max Amount $200k"))

        # --- Lender 3: Advantage+ Financing ---
        lender_adv = create_lender("Advantage+ Financing", "advantage-plus")
        prog_adv = Program(lender_id=lender_adv.id, name="Broker ICP (Non-Trucking)")
        db.add(prog_adv)
        db.flush()

        p_adv = Policy(program_id=prog_adv.id, version=1)
        db.add(p_adv)
        db.flush()
        db.add(Rule(policy_id=p_adv.id, field="fico", operator=">=", value_json=680, description="Min FICO"))
        db.add(Rule(policy_id=p_adv.id, field="years_in_business", operator=">=", value_json=3, description="Min TIB"))
        db.add(Rule(policy_id=p_adv.id, field="requested_amount", operator="<=", value_json=75000, description="Max Amount $75k"))

        # --- Lender 4: Falcon Equipment Finance ---
        lender_falcon = create_lender("Falcon Equipment Finance", "falcon-finance")
        prog_falcon = Program(lender_id=lender_falcon.id, name="Rates & Programs")
        db.add(prog_falcon)
        db.flush()

        p_falcon = Policy(program_id=prog_falcon.id, version=1)
        db.add(p_falcon)
        db.flush()
        db.add(Rule(policy_id=p_falcon.id, field="fico", operator=">=", value_json=680, description="Min FICO"))
        db.add(Rule(policy_id=p_falcon.id, field="years_in_business", operator=">=", value_json=3, description="Min TIB"))

        # --- Lender 5: Citizens Bank ---
        lender_citizens = create_lender("Citizens Bank", "citizens-bank")
        prog_citizens = Program(lender_id=lender_citizens.id, name="Equipment Finance Program 2025")
        db.add(prog_citizens)
        db.flush()

        p_citizens = Policy(program_id=prog_citizens.id, version=1)
        db.add(p_citizens)
        db.flush()
        db.add(Rule(policy_id=p_citizens.id, field="fico", operator=">=", value_json=700, description="Tier 1 FICO"))
        db.add(Rule(policy_id=p_citizens.id, field="years_in_business", operator=">=", value_json=2, description="Tier 1 TIB"))

        db.commit()
        print("Seed complete. DB refreshed.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
