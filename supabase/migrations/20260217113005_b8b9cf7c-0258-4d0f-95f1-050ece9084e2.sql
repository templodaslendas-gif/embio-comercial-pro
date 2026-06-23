
-- Add status column to quotes table
ALTER TABLE public.quotes ADD COLUMN status text NOT NULL DEFAULT 'em_aberto';

-- Add UPDATE policy for quotes (missing)
CREATE POLICY "Users can update own quotes"
ON public.quotes FOR UPDATE
USING (auth.uid() = user_id);
