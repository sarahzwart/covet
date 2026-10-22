# Project Instructions

## Project Overview

Build a fashion price-tracking web application that allows users to track clothing products, select their size, set a target price, and receive an SMS notification when the product's price falls to or below their target while their selected size is in stock.

The initial retailer target is Abercrombie. Design the application so additional retailers can be supported through a modular retailer integration architecture.

The project should demonstrate strong full-stack engineering, API integration, data modeling, and practical AI engineering skills. Prioritize a reliable, functional product over unnecessary complexity.

## Technology Stack

### Frontend
- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Server Components by default; use Client Components when interactivity or browser APIs require them

### Backend
- Python
- FastAPI
- Pydantic for validation and API schemas
- SQLAlchemy for database access
- Alembic for database migrations

### Database and Integrations
- PostgreSQL
- Twilio for SMS notifications
- An approved product-data provider or permitted retailer data source
- An LLM API and agent framework only when an AI feature requires them

## Project Structure

```text
/
├── frontend/
│   ├── app/
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── types/
│   └── public/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── retailers/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── jobs/
│   │   ├── agents/             # Add when an AI agent is implemented
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
├── database/
│   └── migrations/
├── docker-compose.yml
├── .gitignore
└── README.md
```

Keep the frontend and backend independently organized while maintaining a single repository.

## Core Product Requirements

1. Accept a product URL and retrieve product details.
2. Display the product title, image, current price, and available sizes when the data source supports them.
3. Allow users to select a specific size and set an optional target price/percentage off. If no target price is set, it will notify when there is any drop.
4. Persist tracking configurations in PostgreSQL.
5. Periodically check the product's current price and selected-size availability.
6. Record price observations to support price history.
7. Send an SMS when the current price is at or below the target and the selected size is confirmed in stock.
8. Prevent duplicate notifications for the same price-drop event.
9. Clearly communicate unavailable, stale, or unverified product data.
10. Allow user to toggle whether they want to receive notifications about the specific product
11. Products can be deleted from their list.
12. Products can be categorized by company or by type of item.


## Architecture Guidelines

- Keep HTTP route handlers thin. Put business logic in service modules.
- Use Pydantic schemas for request validation and response serialization.
- Separate retailer-specific integrations from shared tracking logic.
- Define a common retailer interface so new retailers can be added without rewriting the tracking service.
- Keep scheduled jobs separate from API request handling.
- Use database migrations for schema changes.
- Make external integrations replaceable and easy to test.
- Use environment variables for configuration and secrets.
- Keep demo data explicitly labeled. Never present mock prices or inventory as live data.
- Do not assume a retailer has a public API or that a provider supports a particular retailer. Verify availability, data freshness, size-level inventory, and usage terms before relying on an integration.

## AI Engineering Guidelines

- Do not introduce an AI agent unless it solves a clearly defined product problem.
- Potential future capabilities include natural-language product search, similar-item discovery, and shopping recommendations.
- Give agents narrowly scoped tools with validated inputs and outputs.
- Use deterministic code for price comparisons, inventory checks, notification eligibility, and other business-critical rules.
- Do not allow an LLM to invent product prices, availability, or retailer capabilities.
- Keep prompts, agent orchestration, and tools modular if an agent is added.
- Prefer the simplest solution that reliably meets the requirement.

## Frontend Guidelines

- Use TypeScript throughout the frontend.
- Use shadcn/ui for reusable interface primitives and Tailwind CSS for styling.
- Keep app-specific components separate from `components/ui/`.
- Prefer small, reusable components with clear responsibilities.
- Keep API request logic in `lib/api.ts` or appropriately separated service modules.
- Handle loading, empty, success, and error states.
- Build accessible, responsive interfaces with clear form validation.
- Avoid unnecessary dependencies and excessive abstraction.

## Backend Guidelines

- Use type hints throughout Python code.
- Validate all external input.
- Keep configuration in a centralized settings module.
- Use structured logging and meaningful error responses.
- Add automated tests for price thresholds, size availability, retailer adapters, and notification behavior.
- Never send a price-drop notification based on stale or unverified data.
- Do not fetch arbitrary user-provided URLs directly from the backend. Validate retailer domains and use approved data integrations to reduce SSRF and related security risks.

## Security and Reliability

- Never commit API keys, passwords, access tokens, or `.env` files.
- Maintain `.env.example` files with placeholder values only.
- Keep database credentials and Twilio secrets on the backend.
- Do not expose server secrets through `NEXT_PUBLIC_` environment variables.
- Use parameterized database operations and validate user input.
- Add appropriate timeouts, retries, and error handling for external API calls.
- Do not claim an item is in stock unless the data source supports that conclusion.
- Request confirmation before introducing paid services or infrastructure that could incur unexpected costs.

## Feature Development Workflow

When I request a new feature or modification, follow this workflow.

### 1. Understand the Requirement
- Understand the purpose of the feature and the problem it should solve.
- Inspect the existing codebase and read the relevant documentation before proposing an implementation.
- Research current documentation, APIs, libraries, and established implementation patterns when necessary. Verify important technical assumptions rather than guessing.
- Identify how the feature fits into the existing architecture and whether it requires frontend, backend, database, or external service changes.

### 2. Clarify Requirements Before Implementation
- Do not begin implementing a new feature until the requirements are sufficiently clear.
- Ask focused, detailed questions about the expected behavior, user experience, edge cases, and acceptance criteria.
- For UI features, discuss the design before coding, including:
  - Page layout, hierarchy, and component placement.
  - Visual style, colors, typography, spacing, and responsive behavior.
  - Interactions, animations, transitions, and hover states.
  - Loading, empty, success, error, and disabled states.
  - Form validation, accessibility, and mobile behavior.
  - How the feature should integrate with existing pages and components.
- Ask questions in manageable groups rather than overwhelming me with a long questionnaire.
- Offer concrete design options and recommendations when I am unsure.
- For backend-only features, focus on business logic, API contracts, data models, integrations, validation, and failure scenarios.
- Avoid asking questions that are already answered by this file, the existing code, or earlier decisions.

### 3. Research and Plan
- Research implementation approaches when the feature requires external APIs, unfamiliar libraries, complex architecture, or current technical information.
- Prefer official documentation and reliable primary sources.
- Present the recommended approach and explain significant trade-offs.
- Identify the files to create or modify, dependencies, API contracts, data flow, and testing requirements.
- Flag costs, access restrictions, security concerns, and unverified assumptions.
- Wait for my approval of the proposed plan before making significant changes.

### 4. Implement Cleanly
- Follow the existing project architecture and coding conventions.
- Use small, focused, reusable components and clearly separated responsibilities.
- Avoid unnecessary abstractions, dependencies, duplicated logic, and unrelated changes.
- Use the existing stack: Next.js, TypeScript, Tailwind CSS, shadcn/ui, FastAPI, Python, and PostgreSQL.
- Reuse existing components and utilities whenever appropriate.
- Keep frontend and backend contracts consistent.
- Never invent API capabilities, product data, or successful integration results.

### 5. Verify the Feature
- Run appropriate linting, type checks, and tests.
- Add or update tests for new functionality and important edge cases.
- Check error handling, accessibility, responsive behavior, and security where relevant.
- Report any checks that could not be completed.
- Do not claim that code or functionality works unless it has been appropriately verified.

### 6. Explain the Result
After implementation, summarize:
- What was implemented.
- Which files were created or modified.
- How the implementation works.
- How to run and test it.
- Any limitations, assumptions, or remaining tasks.

Prioritize maintainable, production-minded code while explaining important decisions so I can learn from the implementation.

## Definition of Done

A feature is complete when:
- It meets the requested behavior.
- Inputs and errors are handled appropriately.
- Relevant tests pass.
- Types and validation are correct.
- No secrets or misleading demo data are exposed.
- Documentation is updated when necessary.
