# LuckyDraw.pk - Modern Lucky Draw Events Website

A modern, professional lucky draw website for Pakistan built with Next.js 14, Supabase, and Framer Motion.

## Features

- 🔐 Facebook OAuth authentication via Supabase
- 🎯 Real-time event management (Running, Upcoming, Completed)
- 🎁 Prize listings with images
- 📱 Fully responsive design
- ✨ Smooth animations with Framer Motion
- 🎨 Modern UI with ShadCN components

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **UI Components:** ShadCN UI
- **Backend:** Supabase (Auth + Database + Storage)
- **Icons:** Lucide React

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

4. Set up Supabase:
   - Create a Supabase project
   - Run the SQL migration in `supabase/migrations/001_initial_schema.sql`
   - Configure Facebook OAuth in Supabase Dashboard
   - Set up Storage bucket for prize images

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the complete database schema.

## License

MIT

