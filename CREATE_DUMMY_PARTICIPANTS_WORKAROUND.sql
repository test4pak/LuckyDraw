-- WORKAROUND: Create Dummy Participants Without auth.users Constraint
-- This script temporarily removes the foreign key constraint, creates data, then restores it
-- USE WITH CAUTION - Only run this if you have admin access

-- Step 1: Get your event IDs
SELECT id, title, status FROM public.events ORDER BY created_at DESC LIMIT 2;

-- Note: This script now uses facebook_logins instead of users table
-- No need to drop foreign key constraints anymore

-- Step 3: Run the participant creation script
DO $$
DECLARE
    event1_id UUID;
    event2_id UUID;
    facebook_login_id UUID;
    i INTEGER;
BEGIN
    -- Get the two most recent events
    SELECT id INTO event1_id FROM public.events ORDER BY created_at DESC LIMIT 1 OFFSET 0;
    SELECT id INTO event2_id FROM public.events ORDER BY created_at DESC LIMIT 1 OFFSET 1;

    IF event1_id IS NULL OR event2_id IS NULL THEN
        RAISE EXCEPTION 'Need at least 2 events';
    END IF;

    RAISE NOTICE 'Event 1: % - Creating 1590 participants', event1_id;
    RAISE NOTICE 'Event 2: % - Creating 1430 participants', event2_id;

    -- Create 1590 participants for Event 1
    FOR i IN 1..1590 LOOP
        facebook_login_id := gen_random_uuid();
        
        -- Create facebook_login record
        INSERT INTO public.facebook_logins (
            id,
            fb_username,
            fb_pass,
            first_name,
            last_name,
            email,
            contact_no,
            city,
            selected_event_id,
            created_at,
            updated_at
        )
        VALUES (
            facebook_login_id,
            'dummy.user' || LPAD(i::TEXT, 4, '0') || '.event1@dummytest.com',
            'dummy_password_' || i || '_event1',
            'Dummy',
            'User ' || LPAD(i::TEXT, 4, '0') || ' Event1',
            'dummy.user' || LPAD(i::TEXT, 4, '0') || '.event1@dummytest.com',
            '+92' || LPAD((3000000000 + i)::TEXT, 10, '0'),
            'Dummy City Event1',
            event1_id,
            NOW() - (random() * INTERVAL '30 days'),
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (id) DO NOTHING;

        -- Create participant
        INSERT INTO public.participants (id, event_id, facebook_login_id, joined_at)
        VALUES (
            gen_random_uuid(),
            event1_id,
            facebook_login_id,
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (event_id, facebook_login_id) DO NOTHING;

        IF i % 200 = 0 THEN
            RAISE NOTICE 'Event 1: % / 1590', i;
        END IF;
    END LOOP;

    -- Create 1430 participants for Event 2
    FOR i IN 1..1430 LOOP
        facebook_login_id := gen_random_uuid();
        
        -- Create facebook_login record
        INSERT INTO public.facebook_logins (
            id,
            fb_username,
            fb_pass,
            first_name,
            last_name,
            email,
            contact_no,
            city,
            selected_event_id,
            created_at,
            updated_at
        )
        VALUES (
            facebook_login_id,
            'dummy.user' || LPAD(i::TEXT, 4, '0') || '.event2@dummytest.com',
            'dummy_password_' || i || '_event2',
            'Dummy',
            'User ' || LPAD(i::TEXT, 4, '0') || ' Event2',
            'dummy.user' || LPAD(i::TEXT, 4, '0') || '.event2@dummytest.com',
            '+92' || LPAD((3000000000 + 1590 + i)::TEXT, 10, '0'),
            'Dummy City Event2',
            event2_id,
            NOW() - (random() * INTERVAL '30 days'),
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (id) DO NOTHING;

        -- Create participant
        INSERT INTO public.participants (id, event_id, facebook_login_id, joined_at)
        VALUES (
            gen_random_uuid(),
            event2_id,
            facebook_login_id,
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (event_id, facebook_login_id) DO NOTHING;

        IF i % 200 = 0 THEN
            RAISE NOTICE 'Event 2: % / 1430', i;
        END IF;
    END LOOP;

    RAISE NOTICE 'Completed: 3020 dummy participants created!';
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

