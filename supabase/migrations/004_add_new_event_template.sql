-- Template for adding new events
-- Copy this template and modify the values for your new event

-- Step 1: Insert the new event
-- Replace the values below with your event details
INSERT INTO public.events (title, description, status, start_date, end_date)
VALUES
  (
    'Your Event Title Here',                    -- Event title
    'Your event description here. Describe what the event is about, what prizes are available, and any important details.',  -- Event description
    'running',                                  -- Status: 'running', 'upcoming', or 'completed'
    CURRENT_DATE,                               -- Start date (or use specific date like '2024-03-15')
    CURRENT_DATE + INTERVAL '30 days'           -- End date (or use specific date like '2024-04-15')
  )
RETURNING id;  -- This will return the event ID which you'll need for prizes

-- Step 2: After running the above, note the returned event ID
-- Then insert prizes for that event (replace 'EVENT_ID_HERE' with the actual ID)

-- Example: Insert prizes for the event
-- INSERT INTO public.prizes (event_id, name, description, category, image_url)
-- VALUES
--   (
--     'EVENT_ID_HERE',                          -- Replace with actual event ID from Step 1
--     'Prize Name 1',                           -- Prize name
--     'Description of the prize',               -- Prize description
--     'Electronics',                            -- Category (e.g., 'Electronics', 'Cash', 'Vouchers', 'Travel')
--     'https://images.unsplash.com/photo-...'   -- Image URL (optional)
--   ),
--   (
--     'EVENT_ID_HERE',                          -- Same event ID
--     'Prize Name 2',
--     'Description of prize 2',
--     'Cash',
--     'https://images.unsplash.com/photo-...'
--   );

-- Example with actual values:
-- INSERT INTO public.events (title, description, status, start_date, end_date)
-- VALUES
--   (
--     'Spring Festival Draw 2024',
--     'Join our spring festival lucky draw! Win amazing prizes including smartphones, cash prizes, and shopping vouchers.',
--     'upcoming',
--     '2024-03-20',
--     '2024-04-20'
--   )
-- RETURNING id;

