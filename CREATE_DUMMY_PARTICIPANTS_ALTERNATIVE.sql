-- Alternative SQL Script: Create Dummy Participants for Specific Events
-- Use this if you want to target events by title or ID instead of most recent

-- Option 1: Target events by title (modify the titles to match your events)
-- Replace 'Your Event 1 Title' and 'Your Event 2 Title' with actual event titles

DO $$
DECLARE
    event1_id UUID;
    event2_id UUID;
    user_id UUID;
    i INTEGER;
BEGIN
    -- Get events by title (modify these titles to match your events)
    SELECT id INTO event1_id
    FROM public.events
    WHERE title LIKE '%dummy%' OR title LIKE '%test%'  -- Modify this condition
    ORDER BY created_at DESC
    LIMIT 1;

    SELECT id INTO event2_id
    FROM public.events
    WHERE title NOT LIKE (SELECT title FROM public.events WHERE id = event1_id)
    AND (title LIKE '%dummy%' OR title LIKE '%test%')  -- Modify this condition
    ORDER BY created_at DESC
    LIMIT 1;

    -- Alternative: Get events by specific IDs (uncomment and set your event IDs)
    -- event1_id := 'YOUR-FIRST-EVENT-UUID-HERE';
    -- event2_id := 'YOUR-SECOND-EVENT-UUID-HERE';

    -- Check if we have two events
    IF event1_id IS NULL OR event2_id IS NULL THEN
        RAISE EXCEPTION 'Could not find 2 events. Found: event1=%, event2=%', event1_id, event2_id;
    END IF;

    RAISE NOTICE 'Event 1 ID: % (will get 1590 participants)', event1_id;
    RAISE NOTICE 'Event 2 ID: % (will get 1430 participants)', event2_id;

    -- Create 1590 dummy participants for Event 1
    RAISE NOTICE 'Creating 1590 dummy participants for Event 1...';
    FOR i IN 1..1590 LOOP
        user_id := gen_random_uuid();
        
        INSERT INTO public.users (id, name, email, facebook_id, profile_pic, created_at, updated_at)
        VALUES (
            user_id,
            'Dummy Participant ' || i || ' - Event 1',
            'dummy.participant' || i || '.event1@dummytest.com',
            'dummy_fb_' || i || '_e1',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
            NOW() - (random() * INTERVAL '30 days'),
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO public.participants (id, event_id, user_id, joined_at)
        VALUES (
            gen_random_uuid(),
            event1_id,
            user_id,
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (event_id, user_id) DO NOTHING;

        IF i % 200 = 0 THEN
            RAISE NOTICE 'Event 1: % participants created', i;
        END IF;
    END LOOP;

    -- Create 1430 dummy participants for Event 2
    RAISE NOTICE 'Creating 1430 dummy participants for Event 2...';
    FOR i IN 1..1430 LOOP
        user_id := gen_random_uuid();
        
        INSERT INTO public.users (id, name, email, facebook_id, profile_pic, created_at, updated_at)
        VALUES (
            user_id,
            'Dummy Participant ' || i || ' - Event 2',
            'dummy.participant' || i || '.event2@dummytest.com',
            'dummy_fb_' || i || '_e2',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
            NOW() - (random() * INTERVAL '30 days'),
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO public.participants (id, event_id, user_id, joined_at)
        VALUES (
            gen_random_uuid(),
            event2_id,
            user_id,
            NOW() - (random() * INTERVAL '30 days')
        )
        ON CONFLICT (event_id, user_id) DO NOTHING;

        IF i % 200 = 0 THEN
            RAISE NOTICE 'Event 2: % participants created', i;
        END IF;
    END LOOP;

    RAISE NOTICE 'All dummy participants created successfully!';
END $$;

-- Verification query
SELECT 
    e.id,
    e.title,
    e.status,
    COUNT(p.id) as total_participants,
    COUNT(CASE WHEN u.email LIKE '%dummy%' THEN 1 END) as dummy_participants
FROM public.events e
LEFT JOIN public.participants p ON e.id = p.event_id
LEFT JOIN public.users u ON p.user_id = u.id
WHERE e.id IN (
    SELECT id FROM public.events ORDER BY created_at DESC LIMIT 2
)
GROUP BY e.id, e.title, e.status
ORDER BY e.created_at DESC;

