# Next.js + Supabase + Google Drive Template

A production-ready template for building applications with Next.js, Supabase authentication, and Google Drive integration.

## Features

- ✅ Next.js 15 App Router
- ✅ Supabase Authentication (Email + Google)
- ✅ Google Drive API Integration
- ✅ TypeScript
- ✅ Server-Side Rendering with cookie-based auth
- ✅ Complete authentication flow
- ✅ Proper middleware implementation
- ✅ Comprehensive error handling

## Getting Started

See the [SETUP.md](./SETUP.md) file for detailed instructions.

## Critical Authentication Details

This template uses the proper implementation of Supabase Auth with Next.js:

- Uses `@supabase/ssr` package (NOT the deprecated `auth-helpers-nextjs`)
- Implements cookie-based authentication (NOT localStorage)
- Uses the `getAll()` and `setAll()` methods for cookie handling
- Includes middleware that refreshes the session on each request

## Common Pitfalls Avoided

This template avoids these common mistakes:

1. ❌ Using localStorage for authentication (breaks SSR)
2. ❌ Missing proper Google OAuth redirect URIs
3. ❌ Using deprecated Supabase auth packages
4. ❌ Inconsistent cookie handling
5. ❌ Missing session refresh in middleware

## Architecture Overview

```
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/             # Auth-related endpoints
│   │   │   ├── google/       # Google OAuth endpoint
│   │   │   └── callback/     # Auth callback handlers
│   │   └── drive/            # Google Drive API endpoints
│   ├── auth/                 # Auth-related pages
│   │   └── callback/         # Auth callback page
│   ├── drive/                # Google Drive page
│   └── login/                # Login page
├── components/               # UI Components
├── contexts/                 # React Context Providers
│   ├── AuthContext.tsx       # Authentication context
│   └── DriveContext.tsx      # Google Drive context
├── utils/                    # Utility functions
│   ├── supabase.ts           # Browser Supabase client
│   ├── supabaseServer.ts     # Server Supabase client
│   └── googleDrive.ts        # Google Drive utilities
└── middleware.ts             # Next.js middleware
```

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## License

MIT
