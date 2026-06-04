# Database Schema

The system uses PostgreSQL, managed by Prisma ORM.

## Implemented Models

### Core System
- **Opd**: Regional Apparatus Organizations (`name`). Related to Categories, Tickets, and Users.
- **User**: System users (`email`, `password`, `name`, `phone`, `role`, `opdId`). Roles are `ADMIN` or `OPD`.

### Citizens & Communication
- **Citizen**: The public user (`displayName`, `nik`, `region`).
- **CitizenContact**: Maps a citizen to a social platform handle (`platform`, `handle`, `username`).
- **Channel**: Configured social media endpoints (`platform`, `accountHandle`, `accessToken`).
- **Conversation**: An active chat thread between a `Citizen` and a `Channel`.
- **Message**: Individual chats within a `Conversation`. Supports inbound/outbound directions and internal notes.
- **Attachment**: Files tied to a `Ticket` or `Message`.
- **SocialInteraction**: Raw social events (e.g., comments, mentions) before potential ticket conversion.

### Ticketing Workflow
- **Ticket**: The core entity (`ticketNumber`, `status`, `urgency`, `type`, `assignedOpdId`, `categoryId`, etc.).
- **Category**: Available classifications (e.g., "Kesehatan", "Pendidikan").
- **TicketProgress**: Sequential tracking of ticket status changes (`fromStatus`, `toStatus`, `note`).
- **TicketVerification**: Admin verifications mapping verdicts (`VALID`, `INVALID`, `NEEDS_REROUTE`).
- **Approval**: Workflow approvals for outbound messages.
- **ActivityLog**: General audit trail for user actions.

## Key Enums
- `Role`: ADMIN, OPD
- `TicketStatus`: TO_DO, IN_PROGRESS, ON_HOLD, DONE, CANCELLED
- `TicketType`: COMPLAINT, FEEDBACK, QUESTION
- `TicketUrgency`: LOW, MEDIUM, HIGH, CRITICAL
- `ChannelPlatform`: WHATSAPP, INSTAGRAM, FACEBOOK
