# Architecture & Design Decisions

## 1. Tech Stack Selection

- **FastAPI**: Chosen for high performance, type safety (Pydantic), and automatic API documentation (Swagger UI), which speeds up development and client integration.
- **React + Tailwind**: Efficient component-based UI development with utility-first styling for rapid prototyping of the "premium" feel.
- **PostgreSQL**: Robust relational database for structured financial data (Applications, Policies).
- **Python-based Matching**: Matching logic is implemented in Python for flexibility and ease of integration with data science libraries in the future, rather than inside SQL stored procedures.

## 2. Policy Modeling

**Decision**: Use a JSON-based rule engine (`Rule` table with `field`, `operator`, `value_json`).

- **Why**: Lender policies vary significantly (min FICO, max amount, banned industries). A rigid schema column for each metric (e.g., `min_fico` column) would require database migrations for every new criteria type.
- **Trade-off**: Querying for "all programs allowing FICO < 600" is harder with JSON blobs than structured columns. However, the requirement for _extensibility_ prioritized the flexible schema.
- **Simplification**: Currently, rules compare flat values. Complex logic (e.g., "Max LTV depends on Asset Age") would require a more advanced expression language or Python evaluation, which was out of scope for the 48h MVP.

## 3. Workflow Implementation

**Decision**: Synchronous `run_underwriting` endpoint.

- **Why**: For the MVP demo, immediate feedback in the UI is valuable.
- **Future**: The architecture allows moving the `UnderwritingService.run_underwriting` call to a background worker (Celery or Hatchet) trivially. The API would then return a `job_id` and the frontend would poll for status.

## 4. Matching Logic (Scoring)

**Decision**: Weighted Linear Scoring Model.

- **Why**: Clear, explainable method to rank lenders.
  - Credit Score: 40%
  - Business Stability: 30%
  - Loan Fit: 20%
  - Risk Tier: 10%
- **Simplification**: The weights are hardcoded. A real production system would allow these weights to be configured per-lender or per-program.

## 5. Frontend "App-Only" Focus

**Decision**: The application form collects a specific set of "App-Only" data points (FICO, TIB, Revenue).

- **Why**: Most equipment finance lenders use these core metrics for automated screening (the "Credit Box"). Full financial statement spreading was deemed too complex for this initial scope.

## Missing / Future work

- **Authentication**: While JWT auth is implemented, the frontend currently allows self-registration or uses a seeded admin. Granular permissions (Broker vs Lender view) are needed.
- **Validation**: Stronger input validation for Policy Rule creation (e.g. preventing strings for numeric fields, as encountered during testing).
- **Dashboards**: Analytics for brokers to see approval rates across different lenders.
