# How to Add New Events to LuckyDraw.pk

There are several ways to add new events to your database. Choose the method that works best for you.

## Method 1: Using Supabase Dashboard (Easiest)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Table Editor**
   - Click on "Table Editor" in the left sidebar
   - Select the `events` table

3. **Add a New Event**
   - Click "Insert" → "Insert row"
   - Fill in the fields:
     - **title**: Event name (e.g., "Spring Festival Draw 2024")
     - **description**: Event description
     - **status**: Choose one:
       - `running` - Currently active event
       - `upcoming` - Event that hasn't started yet
       - `completed` - Past event
     - **start_date**: Event start date (format: YYYY-MM-DD)
     - **end_date**: Event end date (format: YYYY-MM-DD)
   - Click "Save"

4. **Add Prizes for the Event**
   - Note the `id` of the event you just created
   - Go to the `prizes` table
   - Click "Insert" → "Insert row"
   - Fill in:
     - **event_id**: The ID from step 3
     - **name**: Prize name (e.g., "iPhone 15 Pro")
     - **description**: Prize description
     - **category**: Category (e.g., "Electronics", "Cash", "Vouchers")
     - **image_url**: Image URL (optional, can use Unsplash URLs)
   - Repeat for each prize

## Method 2: Using SQL Editor (Recommended for Multiple Events)

1. **Go to SQL Editor in Supabase Dashboard**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

2. **Run the SQL Query**
   ```sql
   -- Insert new event
   INSERT INTO public.events (title, description, status, start_date, end_date)
   VALUES
     (
       'Your Event Title',
       'Your event description here.',
       'running',  -- or 'upcoming' or 'completed'
       '2024-03-15',  -- Start date
       '2024-04-15'   -- End date
     )
   RETURNING id;
   ```

3. **Copy the returned event ID** and use it to add prizes:
   ```sql
   -- Insert prizes (replace EVENT_ID with the ID from above)
   INSERT INTO public.prizes (event_id, name, description, category, image_url)
   VALUES
     (
       'EVENT_ID_HERE',
       'Prize Name',
       'Prize description',
       'Electronics',
       'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop'
     ),
     (
       'EVENT_ID_HERE',
       'Another Prize',
       'Another description',
       'Cash',
       'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop'
     );
   ```

## Method 3: Using Migration Files (Best for Version Control)

1. **Create a new migration file**
   - Create a file: `supabase/migrations/004_add_your_event_name.sql`
   - Use the template in `supabase/migrations/004_add_new_event_template.sql`

2. **Run the migration**
   - If using Supabase CLI: `supabase db push`
   - Or copy the SQL and run it in Supabase SQL Editor

## Event Status Guidelines

- **`running`**: Event is currently active and accepting participants
  - Use when: `start_date <= TODAY <= end_date`
  
- **`upcoming`**: Event hasn't started yet
  - Use when: `start_date > TODAY`
  
- **`completed`**: Event has ended
  - Use when: `end_date < TODAY`

## Tips

1. **Image URLs**: You can use Unsplash URLs for prize images:
   - Format: `https://images.unsplash.com/photo-[ID]?w=800&h=600&fit=crop`
   - Or upload to Supabase Storage and use those URLs

2. **Dates**: Use ISO format (YYYY-MM-DD) for dates

3. **Multiple Prizes**: You can add as many prizes as you want for each event

4. **Event ID**: The event ID is auto-generated (UUID). You'll need it to link prizes to events.

## Example: Complete Event with Prizes

```sql
-- Step 1: Create event
INSERT INTO public.events (title, description, status, start_date, end_date)
VALUES
  (
    'Eid Special Lucky Draw 2024',
    'Join our special Eid celebration lucky draw and win amazing prizes!',
    'running',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '10 days'
  )
RETURNING id;

-- Step 2: Add prizes (replace 'EVENT_ID' with the ID from above)
INSERT INTO public.prizes (event_id, name, description, category, image_url)
VALUES
  (
    'EVENT_ID',
    'iPhone 15 Pro Max',
    'Latest iPhone with 256GB storage',
    'Electronics',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop'
  ),
  (
    'EVENT_ID',
    'PKR 50,000 Cash Prize',
    'Win PKR 50,000 in cash!',
    'Cash',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop'
  );
```

## Need Help?

- Check the existing sample data in `supabase/migrations/002_sample_data.sql` for more examples
- The events will automatically appear on your website once added to the database

