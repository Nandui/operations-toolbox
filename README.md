# Operations Toolbox

A clean, manager-focused dashboard that gives your team one place to access key tools and see live operations data from Trail.

## What's included

- **Quick-access links** — one-click cards for Notion, Google Drive, HR/Payroll, and Trail
- **Live Trail data** — today's task completion rates, pending and overdue counts, per-location breakdown
- **Auto-refreshing** — Trail data updates every 5 minutes via Next.js ISR; no manual refresh needed

## Prerequisites

- Node.js 18+
- A Trail API key (Settings → Integrations in the Trail web app)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.local.example .env.local
# Open .env.local and fill in your values

# 3. Start the development server
npm run dev
# → http://localhost:3000
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `TRAIL_API_KEY` | **Yes** | Authenticates Trail API requests |
| `TRAIL_API_BASE_URL` | No | Trail API base URL (default: `https://web.trailapp.com/api/v1`) |
| `NOTION_URL` | No | Notion workspace or page link |
| `GOOGLE_DRIVE_URL` | No | Google Drive folder or doc link |
| `HR_PAYROLL_URL` | No | HR/Payroll system link |
| `TRAIL_APP_URL` | No | Trail web app link (default: `https://web.trailapp.com`) |
| `DASHBOARD_TITLE` | No | Header title (default: `Operations Toolbox`) |

> Without `TRAIL_API_KEY` the dashboard shows demo data so you can preview the layout immediately.

## Getting your Trail API key

1. Log into [web.trailapp.com](https://web.trailapp.com)
2. Go to **Settings → Integrations**
3. Generate or copy your API key
4. Paste it as `TRAIL_API_KEY` in `.env.local`

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables in the Vercel dashboard (Project → Settings → Environment Variables)
4. Deploy — done

## Architecture notes

- All Trail API calls happen in **server components** and route handlers. Your API key is never sent to the browser.
- Data caching uses Next.js's built-in fetch cache: locations cache for 1 hour, task reports for 5 minutes.
- Quick links are configured via `.env.local` — no database or CMS needed.

## Adding more quick links

Edit `app/lib/config.ts` and add an entry to the array returned by `getQuickLinksConfig()`. Add an icon variant to `app/components/QuickLinkCard.tsx` if needed.
