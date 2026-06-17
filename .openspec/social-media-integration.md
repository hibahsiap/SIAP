# Social Media Integration

The system supports connecting to external social platforms to aggregate citizen communications into a unified inbox.

## Supported Platforms (Implemented)

### Instagram
- **Webhook Endpoint**: Implemented at `app/api/webhook/instagram`. Handles incoming events from the Instagram graph API.
- **Direct Messaging**: The ticket creation API (`app/api/tickets/route.ts`) imports `sendInstagramDM` from `lib/instagram`. When a ticket is created originating from an Instagram conversation, an auto-reply is actively dispatched back to the citizen via Instagram DM using their `accessToken` and `recipientPsid`.

## Scaffolded / Pending Platforms
The Prisma database schema defines enums and structures for other platforms, but specific webhook API routes and dispatch logic are not fully implemented in the current codebase.
- **WhatsApp**: Defined in `ChannelPlatform` enum. (Mentioned as "Saat ini sistem menerima data dari" in `AGENTS.md`, but explicit webhook routes are absent in `app/api/webhook/`).
- **Facebook**: Defined in `ChannelPlatform` enum.
- **X (Twitter)**: Not present in the Prisma schema (marked as Planned/Hold in `AGENTS.md`).
