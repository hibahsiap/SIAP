# Architecture Decision Records (ADRs)

## ADR-001: Backend Architecture (Next.js vs NestJS)

**Status**: Pending Decision  
**Date**: 2026-06-04  

### 1. Context
Currently, the SIAP repository has a severe architectural discrepancy that needs resolution before significant new features are developed:
- **AGENTS.md Guideline**: Explicitly mandates a strict separation of concerns: the Frontend (Next.js) must not contain core business logic, and the Backend (NestJS) must handle all routing, LLM classification, and business rules.
- **Current Implementation**: The codebase is built as a monolithic Next.js App Router application. All business logic, Prisma database queries, ticket creation, and Groq LLM integrations are housed directly within Next.js API Routes (`app/api/*`). 

This creates technical debt. A strategic decision must be made whether to invest in refactoring the backend layer into NestJS, or to amend the `AGENTS.md` guidelines to officially adopt Next.js as a fullstack framework.

### 2. Options

#### Option A: Adopt Next.js Fullstack (Amend AGENTS.md)
- **Description**: Accept the current implementation. Next.js App Router officially serves as both the frontend UI and the backend API.
- **Pros**: 
  - Zero immediate refactoring cost; feature development can continue uninterrupted.
  - Unified codebase and deployment pipeline.
  - End-to-end type safety is easier to maintain within a single repository.
- **Cons**: 
  - Monolithic architecture may become difficult to scale for complex, long-running background jobs (e.g., processing heavy social media webhook queues).
  - Tighter coupling between UI components and database logic.

#### Option B: Migrate to NestJS (Enforce AGENTS.md)
- **Description**: Halt feature development to extract all `app/api/*` routes, Prisma configurations, and LLM integrations into a dedicated NestJS repository.
- **Pros**: 
  - Strict separation of concerns (Frontend vs Backend).
  - NestJS provides robust enterprise patterns out-of-the-box (Dependency Injection, decorators, message queues like BullMQ for webhooks).
  - Aligns with the original project vision and governance.
- **Cons**: 
  - High immediate refactoring cost and development freeze.
  - Overhead of managing API contracts, CORS, and dual deployment pipelines.

### 3. Decision
*Pending... (Team / Admin to record the final decision here)*

### 4. Consequences
*To be filled based on the chosen decision. If Option A, `AGENTS.md` must be updated. If Option B, a migration plan and API contract definition must be created.*
