-- Add foreign key constraint from listings.user_id to profiles.id if it doesn't exist
DO $$ 
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'listings_user_id_fkey' 
        AND table_name = 'listings'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.listings
        ADD CONSTRAINT listings_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint listings_user_id_fkey added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint listings_user_id_fkey already exists';
    END IF;
END $$;