# Lender Matching and Loan Underwriting Platform

## Project Overview

This project is a production-grade lender matching and loan underwriting platform designed to connect business loan applicants with suitable lenders. It features a comprehensive backend engine that evaluates applications against dynamic lender policies, calculates fit scores, assesses risk, and provides transparent, actionable feedback for rejected applications.

The system is built to be modular, scalable, and secure, featuring role-based authentication, a dynamic rule engine, and an interactive frontend dashboard.

## Technology Stack

### Backend

- **Language**: Python 3.10+
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens) with Passlib
- **Task Execution**: Async/Await architecture

### Frontend

- **Framework**: React.js (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM

## Prerequisites

Before running the application, ensure you have the following installed:

- Python 3.10 or higher
- Node.js 16 or higher (includes npm)
- PostgreSQL 13 or higher

## Backend Setup

For detailed backend documentation, including file structure, architecture explainers, and in-depth setup, please refer to the **[Backend README](backend/README.md)**.

### Quick Start

1.  **Navigate to backend:** `cd backend`
2.  **Install dependencies:** `pip install -r requirements.txt`
3.  **Seed Database:** `python -m scripts.seed`
4.  **Run Server:** `uvicorn app.main:app --reload`

## Frontend Setup

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

## Usage Guide

### Authentication

- Access the application at `http://localhost:5173`.
- You will be redirected to the Login page.
- **Credentials**:
  - Email: `admin@example.com`
  - Password: `password123`

### Dashboard

- **Lender Dashboard**: View a list of all active lenders. Click on a lender to view their detailed programs, policies, and underwriting rules.
- **Rule Management**: In the Lender Detail view, you can:
  - **Add Rules**: Click the "+ Add Rule" button to define new criteria (e.g., Min FICO > 700).
  - **Edit Rules**: Click on any rule value (highlighted in purple) to modify it.
  - **Delete Rules**: Use the delete icon to remove a rule.
- **Policy Versioning**: Active policies show a "Copy/Version" button. Clicking this creates a snapshot of the current policy (archiving it) and creates a new active version for editing.

### Submitting Applications

- Navigate to "New Application".
- Fill in the business details (Business Name, Requested Amount, FICO Score, Revenue, Years in Business).
- Submit the application.

### Understanding Results

- The "Application Status" page shows the results of the underwriting process.
- **Match Score**: A 0-100 score indicating how well the application fits the lender's criteria.
- **Risk Tier**:
  - **Tier A (Green)**: Low Risk (Score 80+)
  - **Tier B (Yellow)**: Medium Risk (Score 50-79)
  - **Tier C (Red)**: High Risk (Score < 50)
- **Recommendations**: If an application is rejected, the system provides specific, actionable advice (e.g., "Increase FICO score to at least 680") based on the failed rules.

## Project Structure

### Backend (`/backend`)

- `app/api/`: Contains API route definitions (endpoints).
- `app/core/`: Application configuration, database connection, and security utilities.
- `app/db/`: SQLAlchemy database models.
- `app/schemas/`: Pydantic models for data validation and serialization.
- `app/services/`: Business logic engines (Policy Engine, Matching Engine, Workflow).
- `scripts/`: Utility scripts, such as database seeding.

### Frontend (`/frontend`)

- `src/components/`: Reusable UI components.
- `src/pages/`: Main views (Dashboard, Login, Application Form).
- `src/hooks/`: Custom React hooks (e.g., AuthContext).
- `src/lib/`: API client configuration.
