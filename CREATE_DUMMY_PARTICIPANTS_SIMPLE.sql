-- SIMPLIFIED SQL Script: Create Dummy Participants (Bypasses auth.users requirement)
-- This script creates participants directly without requiring auth.users entries
-- WARNING: This requires temporarily modifying the foreign key constraint or using a workaround

-- Option 1: Temporarily disable the foreign key constraint (USE WITH CAUTION)
-- Only use this if you have admin access and understand the implications

-- Step 1: Get your event IDs
-- Run this first to get your event IDs:
-- SELECT id, title, status FROM public.events ORDER BY created_at DESC LIMIT 2;

DO $$
DECLARE
    event1_id UUID;
    event2_id UUID;
    user_id UUID;
    i INTEGER;
    participant_id UUID;
BEGIN
    -- Get the two most recent events
    SELECT id INTO event1_id
    FROM public.events
    ORDER BY created_at DESC
    LIMIT 1
    OFFSET 0;

    SELECT id INTO event2_id
    FROM public.events
    ORDER BY created_at DESC
    LIMIT 1
    OFFSET 1;

    IF event1_id IS NULL OR event2_id IS NULL THEN
        RAISE EXCEPTION 'Need at least 2 events. Found: event1=%, event2=%', event1_id, event2_id;
    END IF;

    RAISE NOTICE 'Event 1 ID: % (will get 1590 participants)', event1_id;
    RAISE NOTICE 'Event 2 ID: % (will get 1430 participants)', event2_id;

    -- Create 1590 dummy participants for Event 1
    RAISE NOTICE 'Creating 1590 dummy participants for Event 1...';
    FOR i IN 1..1590 LOOP
        user_id := gen_random_uuid();
        participant_id := gen_random_uuid();
        
        -- Create auth user first (this might fail without proper permissions)
        BEGIN
            PERFORM auth.uid(); -- Check if auth functions are available
            
            -- Try to create auth user using Supabase's auth schema
            INSERT INTO auth.users (
                id,
                instance_id,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at
            )
            VALUES (
                user_id,
                (SELECT id FROM auth.instances LIMIT 1),
                'dummy.user' || i || '.event1@dummytest.com',
                crypt('dummy_pass_' || i, gen_salt('bf')),
                NOW(),
                '{"provider":"email","providers":["email"]}',
                jsonb_build_object('name', 'Dummy User ' || i || ' Event1'),
                NOW() - (random() * INTERVAL '30 days'),
                NOW() - (random() * INTERVAL '30 days')
            )
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipping auth.users creation for user %: %', i, SQLERRM;
            -- Continue anyway - we'll try to create the participant
        END;

        -- Create public user
        BEGIN
            INSERT INTO public.users (id, name, email, facebook_id, profile_pic, created_at, updated_at)
            VALUES (
                user_id,
                'Dummy User ' || i || ' Event1',
                'dummy.user' || i || '.event1@dummytest.com',
                'dummy_facebook_' || i || '_event1',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
                NOW() - (random() * INTERVAL '30 days'),
                NOW() - (random() * INTERVAL '30 days')
            )
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create public user %: %', i, SQLERRM;
            CONTINUE;
        END;

        -- Create participant
        BEGIN
            INSERT INTO public.participants (id, event_id, user_id, joined_at)
            VALUES (
                participant_id,
                event1_id,
                user_id,
                NOW() - (random() * INTERVAL '30 days')
            )
            ON CONFLICT (event_id, user_id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create participant %: %', i, SQLERRM;
        END;

        IF i % 200 = 0 THEN
            RAISE NOTICE 'Event 1: % / 1590 participants created', i;
        END IF;
    END LOOP;

    -- Create 1430 dummy participants for Event 2
    RAISE NOTICE 'Creating 1430 dummy participants for Event 2...';
    FOR i IN 1..1430 LOOP
        user_id := gen_random_uuid();
        participant_id := gen_random_uuid();
        
        -- Create auth user
        BEGIN
            INSERT INTO auth.users (
                id,
                instance_id,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at
            )
            VALUES (
                user_id,
                (SELECT id FROM auth.instances LIMIT 1),
                'dummy.user' || i || '.event2@dummytest.com',
                crypt('dummy_pass_' || i, gen_salt('bf')),
                NOW(),
                '{"provider":"email","providers":["email"]}',
                jsonb_build_object('name', 'Dummy User ' || i || ' Event2'),
                NOW() - (random() * INTERVAL '30 days'),
                NOW() - (random() * INTERVAL '30 days')
            )
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipping auth.users creation for user %: %', i, SQLERRM;
        END;

        -- Create public user
        BEGIN
            INSERT INTO public.users (id, name, email, facebook_id, profile_pic, created_at, updated_at)
            VALUES (
                user_id,
                'Dummy User ' || i || ' Event2',
                'dummy.user' || i || '.event2@dummytest.com',
                'dummy_facebook_' || i || '_event2',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
                NOW() - (random() * INTERVAL '30 days'),
                NOW() - (random() * INTERVAL '30 days')
            )
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create public user %: %', i, SQLERRM;
            CONTINUE;
        END;

        -- Create participant
        BEGIN
            INSERT INTO public.participants (id, event_id, user_id, joined_at)
            VALUES (
                participant_id,
                event2_id,
                user_id,
                NOW() - (random() * INTERVAL '30 days')
            )
            ON CONFLICT (event_id, user_id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create participant %: %', i, SQLERRM;
        END;

        IF i % 200 = 0 THEN
            RAISE NOTICE 'Event 2: % / 1430 participants created', i;
        END IF;
    END LOOP;

    RAISE NOTICE 'Script completed!';
END $$;

-- Verification
SELECT 
    e.id,
    e.title,
    e.status,
    COUNT(p.id) as participant_count
FROM public.events e
LEFT JOIN public.participants p ON e.id = p.event_id
WHERE e.id IN (
    SELECT id FROM public.events ORDER BY created_at DESC LIMIT 2
)
GROUP BY e.id, e.title, e.status
ORDER BY e.created_at DESC;

