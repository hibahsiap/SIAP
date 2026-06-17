# API Endpoints

The API is currently implemented entirely via Next.js API Routes within the `app/api/` directory. 

*Note: According to `AGENTS.md`, this routing should belong in a NestJS backend. The list below represents the current implemented reality.*

## Implemented Routes

- **`api/ai/classify`**: 
  - **POST**: Receives citizen text content and calls the Groq SDK to return a structured JSON classification (title, description, category, type, urgency, location).

- **`api/tickets`**: 
  - **POST**: Creates a new ticket from a conversation, sets up the Prisma transaction, stores attachments, updates message references, and sends auto-reply notifications (including Instagram DM dispatch).

- **`api/webhook/instagram`**:
  - Webhook listener designed to ingest updates and messages from Instagram.

- **Other Scaffolded Endpoints**:
  - `api/auth`: Handles login and token issuance.
  - `api/category`: Category management.
  - `api/comments`: Raw comment handling.
  - `api/inbox`: Fetching conversation lists.
  - `api/messages`: Handling internal and external conversation messages.
  - `api/opd`: OPD management.
  - `api/profile`: User profile actions.
  - `api/social-interactions`: Fetching and processing raw mentions/comments.
  - `api/upload`: Handles file and attachment uploads.
  - `api/users`: Admin operations for User management.
