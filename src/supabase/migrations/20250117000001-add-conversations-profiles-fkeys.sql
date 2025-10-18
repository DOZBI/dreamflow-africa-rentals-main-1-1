-- Add foreign key constraints from conversations to profiles if they don't exist

DO $$ 
BEGIN
    -- Add buyer_id foreign key
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_buyer_id_fkey' 
        AND table_name = 'conversations'
    ) THEN
        ALTER TABLE public.conversations
        ADD CONSTRAINT conversations_buyer_id_fkey 
        FOREIGN KEY (buyer_id) 
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint conversations_buyer_id_fkey added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint conversations_buyer_id_fkey already exists';
    END IF;

    -- Add seller_id foreign key
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_seller_id_fkey' 
        AND table_name = 'conversations'
    ) THEN
        ALTER TABLE public.conversations
        ADD CONSTRAINT conversations_seller_id_fkey 
        FOREIGN KEY (seller_id) 
        REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint conversations_seller_id_fkey added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint conversations_seller_id_fkey already exists';
    END IF;

    -- Add listing_id foreign key
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_listing_id_fkey' 
        AND table_name = 'conversations'
    ) THEN
        ALTER TABLE public.conversations
        ADD CONSTRAINT conversations_listing_id_fkey 
        FOREIGN KEY (listing_id) 
        REFERENCES public.listings(id)
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint conversations_listing_id_fkey added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint conversations_listing_id_fkey already exists';
    END IF;
END $$;