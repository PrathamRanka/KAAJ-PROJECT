# Backend Documentation - Lender Matching Platform

This directory contains the backend source code for the Lender Matching and Loan Underwriting Platform. It is built using **FastAPI**, a modern, fast (high-performance) web framework for building APIs with Python 3.10+.

## 🛠 Technology Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Chosen for its speed, automatic interactive documentation, and standard Python type hints.
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Robust relational database.
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) - The Python SQL toolkit and Object Relational Mapper.
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/) - Lightweight database migration tool for usage with SQLAlchemy.
- **Authentication**: JWT (JSON Web Tokens) with `python-jose` and `passlib`.
- **Validation**: [Pydantic](https://docs.pydantic.dev/) - Data validation using Python type hints.

## 📂 Project Structure & File Explanations

Here is a detailed breakdown of the codebase organization:

### `app/` (Main Application Logic)

- **`main.py`**
  - **Purpose**: The entry point of the application.
  - **What it does**: Initializes the FastAPI app (`app = FastAPI()`), configures CORS (Cross-Origin Resource Sharing) to allow the frontend to communicate with it, and includes the API routers.

### `app/core/` (Core Configuration)

- **`config.py`**
  - **Purpose**: Centralized configuration using `pydantic-settings`.
  - **What it does**: Reads environment variables (from `.env`), sets database connection strings (`SQLALCHEMY_DATABASE_URI`), and defines constants like `SECRET_KEY` and `ALGORITHM`.
- **`database.py`**
  - **Purpose**: Database session management.
  - **What it does**: Creates the SQLAlchemy `engine` and `SessionLocal` class. It provides the `get_db` dependency used in API endpoints to get a database session for a single request.

### `app/api/` (API Routes)

- **`endpoints/lenders.py`**
  - **Purpose**: Endpoints related to Lenders.
  - **What it does**: Handles creating, reading, updating, and deleting lenders. Also includes logic for managing lender policies (rules).
- **`endpoints/applications.py`**
  - **Purpose**: Endpoints for Loan Applications.
  - **What it does**: Accepts new applications, triggers the core _Matching Engine_ to evaluate them, and returns the results (match score, risk tier, etc.).
- **`endpoints/auth.py`**
  - **Purpose**: Authentication endpoints.
  - **What it does**: Handles user login (OAuth2 password flow) and returns access tokens.

### `app/services/` (Business Logic)

- **`policy_engine.py`**
  - **Purpose**: The brain of the underwriting process.
  - **What it does**: Evaluates a loan application against a set of specific rules (e.g., "Credit Score > 700"). It returns match results and rejection reasons.
- **`matching_engine.py`**
  - **Purpose**: Orchestrates the matching process.
  - **What it does**: Iterates through compatible lenders, calls the `policy_engine` for each, scores the application, and determines the best fit or "Risk Tier".
- **`workflow.py`** (if present)
  - **Purpose**: Workflow state management.
  - **What it does**: Manages status transitions for applications (e.g., Pending -> Approved -> Rejected).

### `app/db/` (Database Models)

- **`base.py` / `__init__.py`**
  - **Purpose**: SQLAlchemy model definitions.
  - **What it does**: Defines the database schema as Python classes (e.g., `User`, `Lender`, `Application`, `Rule`). These map directly to SQL tables.

### `scripts/` (Utilities)

- **`seed.py`**
  - **Purpose**: Database population.
  - **What it does**: Clears existing data and populates the database with initial required data:
    - Admin User (`admin@example.com`)
    - Sample Lenders (Prime Bank, Fast Fintech)
    - Default Underwriting Rules

---

## 🚀 Getting Started

### 1. Prerequisites

- Python 3.10+
- PostgreSQL running locally on port 5432.

### 2. Environment Setup

Copy the example environment settings (or rely on defaults):
The `app/core/config.py` defaults to:

- **DB**: `postgresql://postgres:postgres@localhost:5432/lender_platform`

### 3. Installation

Install dependencies from `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 4. Database Setup

We have provided a script to seed the database.
**Note**: We use `python -m` to ensure module paths are resolved correctly.

```bash
# Initialize and seed database
python -m scripts.seed
```

### 5. Running the Server

Start the development server with live reload enabled:

```bash
uvicorn app.main:app --reload
```

The API will be available at: `http://127.0.0.1:8000`

### 6. Interactive Documentation

FastAPI provides automatic interactive documentation. Once the server is running, visit:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) - Test endpoints directly in your browser.
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) - Alternative documentation format.
