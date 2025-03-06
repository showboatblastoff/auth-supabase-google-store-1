# Next.js with Supabase Auth and Google Drive Integration

This template provides a ready-to-use Next.js application with Supabase authentication and Google Drive integration.

## Setup Steps

### 1. Clone the Template

```bash
git clone https://github.com/your-username/auth-supabase-google.git my-new-project
cd my-new-project
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your project URL and anon key
3. Set up your database tables:

```sql
-- Create user_drive_tokens table
CREATE TABLE user_drive_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add row level security
ALTER TABLE user_drive_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for user_drive_tokens
CREATE POLICY "Users can only access their own tokens"
ON user_drive_tokens
FOR ALL
USING (auth.uid() = user_id);
```

### 3. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google Drive API
4. Create OAuth credentials:
   - Application type: Web application
   - Name: Your app name
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://your-production-domain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-supabase-project.supabase.co/auth/v1/callback`
     - `https://your-production-domain.com/auth/callback` (production)
     - `https://your-production-domain.com/api/auth/callback/google` (production)
5. Note your Client ID and Client Secret

### 4. Environment Setup

1. Copy `.env.template` to `.env.local`:

   ```bash
   cp .env.template .env.local
   ```

2. Fill in the values in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 5. Start the Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your application.

## Authentication Flow

This template uses the following authentication flow:

1. **Client-side Authentication:**

   - Uses `@supabase/ssr` with `createBrowserClient` for cookie-based auth
   - All auth state is maintained in cookies (not localStorage)

2. **Server-side Authentication:**

   - Uses `@supabase/ssr` with `createServerClient`
   - Session is checked and refreshed in middleware

3. **Google Drive Integration:**
   - User must be authenticated with Supabase first
   - Then can connect to Google Drive using OAuth
   - Tokens are stored in the `user_drive_tokens` table

## Common Issues and Solutions

### Session Not Persisting Between Requests

Ensure you're using the correct cookie setup:

- In `utils/supabase.ts`: Use `createBrowserClient`
- In `utils/supabaseServer.ts`: Use `createServerClient` with proper cookie handling
- In `middleware.ts`: Ensure you're using the correct cookie methods

### Google OAuth Errors

If you see "redirect_uri_mismatch" errors:

1. Double-check your Google Cloud Console configuration
2. Ensure all redirect URIs are properly registered
3. Check that the URLs in your code match exactly what's in Google Cloud Console

## Deployment

When deploying to production:

1. Update your environment variables for production
2. Add your production domain to Google Cloud Console
3. Update the redirect URIs in Google Cloud Console to include your production domain
