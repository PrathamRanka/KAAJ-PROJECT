from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.db.models import Lender, Program, Policy, Rule, RuleType, User
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    
    # 1. Create Admin User
    if not db.query(User).filter(User.email == "admin@example.com").first():
        admin_user = User(
            email="admin@example.com",
            hashed_password=get_password_hash("password123"),
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print("Created admin user: admin@example.com / password123")

    # Check if data exists
    if db.query(Lender).first():
        print("Data already exists. Skipping seed.")
        return

    print("Seeding data...")

    # --- Lender A: Prime Bank (Strict) ---
    lender_a = Lender(name="Prime Bank", slug="prime-bank")
    db.add(lender_a)
    db.commit()

    prog_a = Program(lender_id=lender_a.id, name="Prime Term Loan")
    db.add(prog_a)
    db.commit()

    policy_a = Policy(program_id=prog_a.id)
    db.add(policy_a)
    db.commit()

    # Rules for Prime Bank
    rules_a = [
        Rule(policy_id=policy_a.id, field="fico", operator=">=", value_json=680, description="Min FICO 680"),
        Rule(policy_id=policy_a.id, field="annual_revenue", operator=">=", value_json=150000, description="Min Rev $150k"),
        Rule(policy_id=policy_a.id, field="years_in_business", operator=">=", value_json=2, description="Min 2 Years Biz"),
    ]
    for r in rules_a:
        db.add(r)

    # --- Lender B: Fast Fintech (Looser) ---
    lender_b = Lender(name="Fast Fintech", slug="fast-fintech")
    db.add(lender_b)
    db.commit()

    prog_b = Program(lender_id=lender_b.id, name="Fast Cash Advance")
    db.add(prog_b)
    db.commit()

    policy_b = Policy(program_id=prog_b.id)
    db.add(policy_b)
    db.commit()

    # Rules for Fintech
    rules_b = [
        Rule(policy_id=policy_b.id, field="fico", operator=">=", value_json=600, description="Min FICO 600"),
        Rule(policy_id=policy_b.id, field="annual_revenue", operator=">=", value_json=50000, description="Min Rev $50k"),
    ]
    for r in rules_b:
        db.add(r)
    
    db.commit()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_db()
