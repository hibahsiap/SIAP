# Roadmap

*Note: This roadmap highlights necessary steps to align the current implemented codebase with the business and architectural rules defined in `AGENTS.md`.*

## 1. Architectural Migration (High Priority)
- **Current State**: Monolithic Next.js application containing all business logic.
- **Target State**: Extract business logic, Prisma connections, and routing into a dedicated **NestJS Backend**, operating on port 3001. The Next.js frontend should only act as a presentation layer consuming NestJS REST/GraphQL APIs.

## 2. LLM Flow Enhancement
- **Current State**: Single-pass classification (`api/ai/classify`).
- **Target State**: Implement the two-step flow:
  1. *Validasi kelengkapan*: An LLM pass to ensure the aduan has sufficient context before proceeding.
  2. *Klasifikasi*: The current categorization pass.

## 3. Social Media Webhooks Completion
- **Current State**: Instagram webhooks and dispatch are implemented.
- **Target State**: Fully implement WhatsApp webhook ingestions and reply dispatches, which `AGENTS.md` states is currently supported but lacks explicit implementation files in the Next.js API directory.

## 4. Distinct Service Flows (Aspirasi vs. Pertanyaan)
- **Current State**: `TicketType` handles general differences.
- **Target State**: Enforce strict UI and logic boundaries:
  - *Aspirasi*: No room chat, displayed purely in a monitoring table.
  - *Pertanyaan*: Must utilize a room chat for OPD answers and Admin reviews before sending to the public.
