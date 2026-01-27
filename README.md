# Lender Matching Platform

A full-stack underwriting and matching system connecting business loan applicants with equipment finance lenders based on configurable credit policies.

## 🚀 Features

- **Dynamic Policy Engine**: Configure lender rules (FICO, Time in Business, Industry, etc.) without code changes.
- **Matching Engine**: Scored ranking of eligible lenders with "Explainable AI" rejection reasons.
- **Workflow**: Automated evaluation of applications against thousands of policy permutations.
- **Modern UI**: React-based dashboard for application tracking and policy management.

## 🛠 Tech Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Database**: PostgreSQL (Relational Data + JSON Rules)

## 📦 Local Development Setup

### Prerequisites

- Python 3.10 or higher
- Node.js 18+
- PostgreSQL running on port 5432 (default user/pass: `postgres/postgres` or update `.env`)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt

# Start Database & Seed Data
# Ensure Postgres is running and creating 'lender_platform' db if needed
python scripts/seed_data.py

# Run Server
uvicorn app.main:app --reload
```

API runs at: `http://localhost:8000`  
Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

UI runs at: `http://localhost:5173`

### 3. Login

- **Email**: `admin@kaaj.com`
- **Password**: `admin123`

## 🧪 Testing

Run the backend unit tests:

```bash
cd backend
pytest tests/test_logic.py
```

## 📐 Architecture

See [DECISIONS.md](./DECISIONS.md) for detailed design decisions and trade-offs.

- `backend/app/services/policy_engine.py`: Core logic for evaluating JSON-based rules.
- `backend/app/services/matching_engine.py`: Scoring algorithm for ranking eligible lenders.
