# Features

This document outlines features that are currently implemented in the codebase.

## Multi-Channel Inbox & Conversations
- Aggregates messages and interactions.
- Schema supports WhatsApp, Instagram, and Facebook.
- Real-time chat interfaces for ongoing citizen conversations.
- Supports file attachments inside messages.

## Ticket Management
- **Creation**: Tickets are created from conversations after admin verification.
- **Classification**: Tickets are assigned a category, urgency, and type (`COMPLAINT`, `FEEDBACK`, `QUESTION`).
- **Routing**: Tickets are assigned to a specific OPD (`assignedOpdId`).
- **Auto-Reply**: Creating a ticket automatically sends a confirmation message to the citizen.
- **Progress Tracking**: OPDs can track and update ticket progress with sequence numbers, from `TO_DO` to `DONE` or `CANCELLED`.

## LLM Integration
- Automated text classification using Groq (`llama-3.1-8b-instant`).
- Extracts structured JSON (title, description, category, urgency, type, location) from unstructured citizen text.

## Dashboards
- **Admin**: Full oversight of system tickets, classifications, and system configurations.
- **OPD**: Focused view on assigned tickets and communication for a specific organization.

## Social Media Interaction
- Webhook endpoint designed to receive Instagram updates.
- Ability to dispatch outbound Instagram DMs directly during ticket auto-reply.
