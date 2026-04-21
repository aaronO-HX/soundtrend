# Sounds Dashboard — Integration Briefing

This document is for the AI assistant helping build the Trending Sounds Dashboard. It explains how to integrate authentication with the Social Command Centre that will link to this app.

## Context

The Trending Sounds Dashboard is a standalone app (its own Vercel frontend + Railway backend) that will be accessed via a link from the Social Command Centre. Users are already authenticated in the Social Command Centre, so we pass their token across rather than making them log in twice.

## Auth Handoff

The Social Command Centre uses **JWT tokens** (signed with a shared secret, 7-day expiry). When it links to the Sounds Dashboard it will append the token as a URL query parameter:

```
https://your-sounds-app.vercel.app?token=<jwt>
```

### JWT Payload Shape

```ts
{
  email: string,       // e.g. "name@holidayextras.com"
  name: string,        // display name from Google
  picture: string,     // Google profile photo URL
  role: 'admin' | 'creator' | 'viewer',
  isAdmin: boolean,    // true if role === 'admin'
  iat: number,         // issued at (Unix timestamp)
  exp: number          // expires at (Unix timestamp, 7 days from iat)
}
```

### What the Sounds Dashboard backend needs to do

1. Accept `Authorization: Bearer <token>` headers (frontend should store the token and send it with API calls)
2. Verify the token using the shared `JWT_SECRET` env var:
   ```ts
   import jwt from 'jsonwebtoken';
   const user = jwt.verify(token, process.env.JWT_SECRET) as AuthUser;
   ```
3. If verification passes, the user is authenticated — use `user.email`, `user.role` etc. as needed
4. If verification fails (expired, tampered), return 401

### What the Sounds Dashboard frontend needs to do

On app load, check for a `?token=` query param. If present:
1. Store it (e.g. `localStorage.setItem('sounds_auth_token', token)`)
2. Strip it from the URL (`history.replaceState({}, '', window.location.pathname)`)
3. On subsequent loads, read from localStorage

When making API calls to the Sounds Dashboard backend:
```ts
fetch('/api/sounds', {
  headers: { Authorization: `Bearer ${localStorage.getItem('sounds_auth_token')}` }
})
```

## Env Vars Needed

| Variable | Description |
|---|---|
| `JWT_SECRET` | Shared secret — get this value securely from Allie |

## What Allie Will Do on Her Side

Once the Sounds Dashboard is deployed and has a URL, Allie will add a link in her Navigation component pointing to:
```
https://your-sounds-app.vercel.app?token=<user's JWT>
```

The Navigation component reads the token from `localStorage.getItem('hx_auth_token')`.

## Security Note

Tokens in URLs appear in browser history and server logs. For an internal team tool this is acceptable, but the frontend should strip the token from the URL immediately after reading it (step 2 above).

## Deployment

- Frontend → Vercel (under Allie's team account)
- Backend → Railway (under Allie's team account)
- Both are standalone projects — no shared codebase with the Social Command Centre

## Custom Domain

The app will be served from `https://sounds.hxsocial.dev`. DNS is already configured.

To activate it, add the domain in Vercel once the project is created:

1. Open the project in Vercel → **Settings** → **Domains**
2. Add `sounds.hxsocial.dev`
3. Vercel will verify and provision an SSL certificate automatically (~1 min)
