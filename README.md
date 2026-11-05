# ProspectCRM

Mobile-first PWA CRM to track website-sale prospects at scale: pipeline states, outreach emails and proposal demo pages per prospect. Built to be operated entirely from a phone.

The project and code are public. Real prospect data, emails and credentials live only in the private deployment (Cloudflare D1 + Worker secrets) and are never committed to this repository.

## Stack

- Next.js 15 (App Router, TypeScript strict, Tailwind CSS v4)
- Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)
- Cloudflare D1 (SQLite) with Drizzle ORM
- PWA: installable, app shell service worker

## Pipeline states

| State | Meaning |
| --- | --- |
| Nuevo | Prospect loaded, not contacted yet |
| Contactado | Outreach email sent (the email text is logged on the prospect) |
| Lead avanzado | They replied |
| Cerrando | Closing the landing page sale (USD 50) |
| Derivado a Fran | They want more than a landing: handed off to a human |
| Ganado / Perdido | Closed won / lost |

## Features

- Pipeline dashboard with per-state counts and recent activity feed
- Prospect list with search and state filters
- Prospect detail: contact (tap-to-call, Maps link), pitch angle, demo page URL, full email log with bodies, notes and activity timeline
- Per-prospect email log: direction, subject, body, addresses and date
- Real authentication: PBKDF2-hashed password, HMAC-signed HttpOnly+Secure+SameSite session cookie, login rate limiting, middleware protection on every route
- Agent API (bearer token) so an assistant can register prospects, log sent emails and advance states without any OAuth in the app itself

## Scripts

- `npm run dev` local dev
- `npm run lint` / `npm run typecheck` / `npm run build`
- `npm run db:generate` generate D1 migrations from the schema
- `npm run preview` OpenNext build + local worker preview
- `npm run deploy` OpenNext build + deploy to Cloudflare Workers

## Deploy

1. `npx wrangler d1 create prospect-crm-db` and set `database_id` in `wrangler.jsonc`
2. `npx wrangler secret put ADMIN_PASSWORD_HASH` (PBKDF2 format `iterations:salt:hash`), `npx wrangler secret put SESSION_SECRET`, `npx wrangler secret put AGENT_API_TOKEN`
3. `npm run deploy`
4. `npx wrangler d1 migrations apply prospect-crm-db --remote`

## Agent API

All routes require `Authorization: Bearer <AGENT_API_TOKEN>`.

- `GET /api/agent/prospects?status=CONTACTED&search=nader`
- `POST /api/agent/prospects` create a prospect
- `GET|PATCH /api/agent/prospects/:id`
- `POST /api/agent/prospects/:id/status` `{ "status": "CONTACTED" }`
- `POST /api/agent/prospects/:id/emails` log an email: `{ "direction": "OUTBOUND", "subject", "body", "fromAddress", "toAddress", "sentAt" }`

## Data policy

This repo never contains real prospect data, real outreach emails or secrets. Those live only in the private D1 database and Worker secrets.
