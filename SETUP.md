# LuckyDraw.pk - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Facebook Developer account (for OAuth)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to **Settings** > **API** and copy:
   - Project URL
   - `anon` `public` key

4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Set Up Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - This creates all necessary tables and RLS policies
3. (Optional) Run `supabase/migrations/002_sample_data.sql` for sample data

## Step 4: Configure Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add **Facebook Login** product
4. In **Settings** > **Basic**, add:
   - **App Domains**: `localhost` (for development)
   - **Privacy Policy URL**: Your privacy policy URL
   - **Terms of Service URL**: Your terms URL
5. In **Settings** > **Basic**, add **Valid OAuth Redirect URIs**:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)
6. Copy **App ID** and **App Secret**

## Step 5: Configure Supabase Auth

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Enable **Facebook** provider
3. Enter:
   - **Facebook App ID**: Your Facebook App ID
   - **Facebook App Secret**: Your Facebook App Secret
4. Save the configuration

## Step 6: Set Up Storage (for Prize Images)

1. In Supabase Dashboard, go to **Storage**
2. Create a new bucket named `prizes`
3. Set it to **Public**
4. (Optional) Configure policies to allow public read access

## Step 7: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 8: Test the Application

1. Click "Login with Facebook" on the homepage
2. Complete Facebook authentication
3. You should be redirected to the dashboard
4. Browse events and join a lucky draw

## Troubleshooting

### Facebook OAuth not working
- Ensure redirect URIs are correctly configured in Facebook App settings
- Check that the Supabase callback URL matches exactly
- Verify App ID and Secret are correct in Supabase

### Database errors
- Ensure all migrations have been run
- Check RLS policies are enabled
- Verify user has proper permissions

### Images not loading
- Check Supabase Storage bucket is public
- Verify image URLs are correct
- Check CORS settings if using external images

## Production Deployment

1. Update environment variables in your hosting platform
2. Update Facebook OAuth redirect URIs with production domain
3. Update Supabase redirect URLs
4. Run database migrations on production database
5. Build and deploy:

```bash
npm run build
npm start
```

## Additional Notes

- The app uses Row Level Security (RLS) for data protection
- All user data is stored securely in Supabase
- Prize images can be uploaded via Supabase Storage or use external URLs
- Admin panel can be added later using the same Supabase backend

