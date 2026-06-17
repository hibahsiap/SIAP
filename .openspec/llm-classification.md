# LLM Classification Flow

The LLM classification is used to automate the categorization and assessment of citizen messages. 

## Implemented Flow
Currently, the LLM classification occurs synchronously within the Next.js API route `app/api/ai/classify/route.ts`.

1. **Trigger**: An Admin triggers classification for a message.
2. **Request**: The API receives the raw message `content`.
3. **Database Fetch**: It queries Prisma for all available `Category` names to enforce category matching.
4. **Prompt Construction**: A system prompt is built containing rules for `TYPE` (Complaint, Question, Feedback) and `URGENCY` (Low to Critical), along with the dynamic list of categories.
5. **Execution**: The Groq SDK calls the `llama-3.1-8b-instant` model with a low temperature (0.2) for deterministic output.
6. **Parsing**: The API strips potential markdown formatting (`json`) and parses the raw text into a JSON object.
7. **Response**: Returns a structured object containing `title`, `description`, `type`, `urgency`, `location`, and `category`.

## AGENTS.md Discrepancies
- `AGENTS.md` defines a two-step LLM process: 
  1. *LLM validasi kelengkapan*
  2. *LLM klasifikasi aduan*
- **Current Implementation**: The system currently performs only a **single-step** classification. Validation of completeness as a distinct LLM step is not implemented in the current API route.
