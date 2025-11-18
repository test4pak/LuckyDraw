# Netlify Environment Variables Setup

## Quick Steps to Add Environment Variables in Netlify

### Step 1: Go to Netlify Dashboard
1. Go to https://app.netlify.com
2. Sign in to your account
3. Click on your site (LuckyDraw)

### Step 2: Navigate to Environment Variables
1. Click on **Site settings** (in the top navigation)
2. In the left sidebar, click on **Environment variables**
3. Click the **Add a variable** button

### Step 3: Add Your Supabase Credentials

Add these two environment variables:

#### Variable 1:
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- **Scopes**: Select **All scopes** (or at least **Production**)

#### Variable 2:
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon/public key
- **Scopes**: Select **All scopes** (or at least **Production**)

### Step 4: Save and Redeploy
1. Click **Save** after adding each variable
2. Go to **Deploys** tab
3. Click **Trigger deploy** → **Deploy site** to rebuild with the new environment variables

## Where to Find Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** (gear icon in left sidebar)
4. Click on **API** in the settings menu
5. You'll see:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Visual Guide

```
Netlify Dashboard
  └── Your Site (LuckyDraw)
      └── Site settings
          └── Environment variables
              └── Add a variable
                  ├── Key: NEXT_PUBLIC_SUPABASE_URL
                  │   Value: https://xxxxx.supabase.co
                  │
                  └── Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
                      Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Important Notes

- ✅ Environment variables are case-sensitive
- ✅ Make sure to include `NEXT_PUBLIC_` prefix (required for Next.js)
- ✅ After adding variables, you MUST trigger a new deploy
- ✅ The variables will be available during the build process
- ✅ Never commit these values to your repository

## After Adding Variables

Once you've added the environment variables and triggered a new deploy, the build should succeed!

## Troubleshooting

If the build still fails:
1. Double-check the variable names (exact spelling)
2. Make sure both variables are set
3. Verify the values are correct (no extra spaces)
4. Make sure you triggered a new deploy after adding them
5. Check the deploy logs to see if variables are being read

