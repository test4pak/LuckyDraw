-- SQL Script to Create Dummy Participants for Two Events
-- This script creates 1590 participants for the first event and 1430 for the second event
-- All data contains "dummy" to identify it as test data

-- Step 1: Get the two most recent events (or you can modify to target specific events)
-- We'll use the two most recent events by created_at

DO $$
DECLARE
    event1_id UUID;
    event2_id UUID;
    user_id UUID;
    i INTEGER;
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

    -- Check if we have two events
    IF event1_id IS NULL OR event2_id IS NULL THEN
        RAISE EXCEPTION 'Need at least 2 events in the database. Found: event1=%, event2=%', event1_id, event2_id;
    END IF;

    RAISE NOTICE 'Event 1 ID: % (will get 1590 participants)', event1_id;
    RAISE NOTICE 'Event 2 ID: % (will get 1430 participants)', event2_id;

    -- Step 2: Create 1590 dummy users and participants for Event 1
    RAISE NOTICE 'Creating 1590 dummy participants for Event 1...';
    FOR i IN 1..1590 LOOP
        -- Generate a UUID for the user
        user_id := gen_random_uuid();
        
        -- First, create user in auth.users (requires service role or admin)
        -- Using auth.uid() function to create auth user
        -- Note: This requires proper permissions. If this fails, you may need to use Supabase Admin API
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
                updated_at,
                confirmation_token,
                recovery_token
            )
            VALUES (
                user_id,
                '00000000-0000-0000-0000-000000000000',
                'dummy.user' || i || '.event1@dummytest.com',
                crypt('dummy_password_' || i, gen_salt('bf')),
                NOW(),
                '{"provider":"email","providers":["email"]}',
                '{"name":"Dummy User ' || i || ' Event1"}',
                NOW() - (random() * INTERVAL '30 days'),
                NOW() - (random() * INTERVAL '30 days'),
                '',
                ''
            )
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            -- If auth.users insert fails, skip this user
            RAISE NOTICE 'Could not create auth user for iteration %: %', i, SQLERRM;
            CONTINUE;
        END;

        -- Insert dummy user into public.users
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

        -- Insert participant for Event 1
        INSERT INTO public.participants (id, event_id, user_id, joined_at)
        VALUES (
            gen_random_uuid(),
            event1_id,
            user_id,
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (event_id, user_id) DO NOTHING;

        -- Progress indicator every 100 records
        IF i % 100 = 0 THEN
            RAISE NOTICE 'Created % participants for Event 1', i;
        END IF;
    END LOOP;

    RAISE NOTICE 'Completed: 1590 participants created for Event 1';

    -- Step 3: Create 1430 dummy users and participants for Event 2
    RAISE NOTICE 'Creating 1430 dummy participants for Event 2...';
    FOR i IN 1..1430 LOOP
        -- Generate a UUID for the user
        user_id := gen_random_uuid();
        
        -- First, create user in auth.users
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
                updated_at,
                confirmation_token,
                recovery_token
            )
            VALUES (
                user_id,
                '00000000-0000-0000-0000-000000000000',
                'dummy.user' || i || '.event2@dummytest.com',
                crypt('dummy_password_' || i, gen_salt('bf')),
                NOW(),
                '{"provider":"email","providers":["email"]}',
                '{"name":"Dummy User ' || i || ' Event2"}',
                NOW() - (random() * INTERVAL '30 days'),
                NOW() - (random() * INTERVAL '30 days'),
                '',
                ''
            )
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            -- If auth.users insert fails, skip this user
            RAISE NOTICE 'Could not create auth user for iteration %: %', i, SQLERRM;
            CONTINUE;
        END;

        -- Insert dummy user into public.users
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

        -- Insert participant for Event 2
        INSERT INTO public.participants (id, event_id, user_id, joined_at)
        VALUES (
            gen_random_uuid(),
            event2_id,
            user_id,
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (event_id, user_id) DO NOTHING;

        -- Progress indicator every 100 records
        IF i % 100 = 0 THEN
            RAISE NOTICE 'Created % participants for Event 2', i;
        END IF;
    END LOOP;

    RAISE NOTICE 'Completed: 1430 participants created for Event 2';
    RAISE NOTICE 'Total: 3020 dummy participants created successfully!';
END $$;

-- Verify the counts
SELECT 
    e.title as event_title,
    e.status,
    COUNT(p.id) as participant_count
FROM public.events e
LEFT JOIN public.participants p ON e.id = p.event_id
WHERE e.id IN (
    SELECT id FROM public.events ORDER BY created_at DESC LIMIT 2
)
GROUP BY e.id, e.title, e.status
ORDER BY e.created_at DESC;

