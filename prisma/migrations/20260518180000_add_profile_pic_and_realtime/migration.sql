-- Add profile picture URL to citizen contact
ALTER TABLE "CitizenContact" ADD COLUMN IF NOT EXISTS "profilePicUrl" TEXT;

-- Ensure API roles can read tables involved in chat (needed by Realtime + browser client)
GRANT SELECT ON TABLE public."Message"      TO anon, authenticated;
GRANT SELECT ON TABLE public."Conversation" TO anon, authenticated;
GRANT SELECT ON TABLE public."Ticket"       TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public."Message"      TO service_role;
GRANT ALL PRIVILEGES ON TABLE public."Conversation" TO service_role;
GRANT ALL PRIVILEGES ON TABLE public."Ticket"       TO service_role;

-- Add tables to the Realtime publication so the browser subscription receives INSERT/UPDATE events.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'Message'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public."Message"';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'Conversation'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public."Conversation"';
    END IF;
END$$;
