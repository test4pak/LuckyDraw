-- SQL Script: Create Dummy Participants for Specific Event IDs
-- INSTRUCTIONS: Replace 'YOUR-FIRST-EVENT-UUID' and 'YOUR-SECOND-EVENT-UUID' with your actual event IDs

-- First, run this query to get your event IDs:
-- SELECT id, title, status, created_at FROM public.events ORDER BY created_at DESC LIMIT 2;

-- Then replace the UUIDs below and run this script

DO $$
DECLARE
    event1_id UUID := 'YOUR-FIRST-EVENT-UUID';  -- Replace with your first event ID
    event2_id UUID := 'YOUR-SECOND-EVENT-UUID'; -- Replace with your second event ID
    user_id UUID;
    i INTEGER;
    event1_title TEXT;
    event2_title TEXT;
BEGIN
    -- Verify events exist and get their titles
    SELECT title INTO event1_title FROM public.events WHERE id = event1_id;
    SELECT title INTO event2_title FROM public.events WHERE id = event2_id;

    IF event1_title IS NULL THEN
        RAISE EXCEPTION 'Event 1 with ID % not found!', event1_id;
    END IF;

    IF event2_title IS NULL THEN
        RAISE EXCEPTION 'Event 2 with ID % not found!', event2_id;
    END IF;

    RAISE NOTICE 'Event 1: % (ID: %) - Creating 1590 dummy participants', event1_title, event1_id;
    RAISE NOTICE 'Event 2: % (ID: %) - Creating 1430 dummy participants', event2_title, event2_id;

    -- Create 1590 dummy participants for Event 1
    FOR i IN 1..1590 LOOP
        user_id := gen_random_uuid();
        
        -- Create dummy user
        INSERT INTO public.users (id, name, email, facebook_id, profile_pic, created_at, updated_at)
        VALUES (
            user_id,
            'Dummy User ' || LPAD(i::TEXT, 4, '0') || ' - ' || event1_title,
            'dummy.user' || LPAD(i::TEXT, 4, '0') || '.event1@dummytest.com',
            'dummy_facebook_id_' || LPAD(i::TEXT, 4, '0') || '_event1_dummy',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
            NOW() - (random() * INTERVAL '30 days'),
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email;

        -- Create participant
        INSERT INTO public.participants (id, event_id, user_id, joined_at)
        VALUES (
            gen_random_uuid(),
            event1_id,
            user_id,
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (event_id, user_id) DO NOTHING;

        -- Progress update
        IF i % 200 = 0 THEN
            RAISE NOTICE 'Event 1: % / 1590 participants created', i;
        END IF;
    END LOOP;

    RAISE NOTICE 'Event 1 completed: 1590 dummy participants created';

    -- Create 1430 dummy participants for Event 2
    FOR i IN 1..1430 LOOP
        user_id := gen_random_uuid();
        
        -- Create dummy user
        INSERT INTO public.users (id, name, email, facebook_id, profile_pic, created_at, updated_at)
        VALUES (
            user_id,
            'Dummy User ' || LPAD(i::TEXT, 4, '0') || ' - ' || event2_title,
            'dummy.user' || LPAD(i::TEXT, 4, '0') || '.event2@dummytest.com',
            'dummy_facebook_id_' || LPAD(i::TEXT, 4, '0') || '_event2_dummy',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
            NOW() - (random() * INTERVAL '30 days'),
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email;

        -- Create participant
        INSERT INTO public.participants (id, event_id, user_id, joined_at)
        VALUES (
            gen_random_uuid(),
            event2_id,
            user_id,
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (event_id, user_id) DO NOTHING;

        -- Progress update
        IF i % 200 = 0 THEN
            RAISE NOTICE 'Event 2: % / 1430 participants created', i;
        END IF;
    END LOOP;

    RAISE NOTICE 'Event 2 completed: 1430 dummy participants created';
    RAISE NOTICE 'SUCCESS: Total 3020 dummy participants created!';
END $$;

-- Verification: Check participant counts
SELECT 
    e.id,
    e.title as event_title,
    e.status,
    COUNT(DISTINCT p.id) as total_participants,
    COUNT(DISTINCT CASE WHEN u.email LIKE '%dummy%' THEN p.id END) as dummy_participants,
    COUNT(DISTINCT CASE WHEN u.name LIKE '%Dummy%' THEN p.id END) as dummy_by_name
FROM public.events e
LEFT JOIN public.participants p ON e.id = p.event_id
LEFT JOIN public.users u ON p.user_id = u.id
WHERE e.id IN (event1_id, event2_id)  -- Will use the variables from above, or replace with actual IDs
GROUP BY e.id, e.title, e.status
ORDER BY e.created_at DESC;

-- Alternative verification query (use this if the above doesn't work)
-- Replace the UUIDs with your actual event IDs
/*
SELECT 
    e.id,
    e.title,
    e.status,
    COUNT(p.id) as participant_count
FROM public.events e
LEFT JOIN public.participants p ON e.id = p.event_id
WHERE e.id IN ('YOUR-FIRST-EVENT-UUID', 'YOUR-SECOND-EVENT-UUID')
GROUP BY e.id, e.title, e.status;
*/

