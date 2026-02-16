# AMRYTUM

A premium, minimalist ecommerce site for a luxury food brand. One product: A2 Desi Cow Ghee. Farm to jar, no shortcuts.

## Tech stack

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS** (custom design tokens)
- **Framer Motion** (animations)
- **TypeScript**

**Site content** (Home, Process, About, Footer) always uses **mock data** from `lib/mockData`. Optional **backend** connection: when `NEXT_PUBLIC_API_URL` is set, **Lab Reports** and **Buy** (product catalog) load from the API; otherwise they use mock data.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### With backend

1. Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_API_URL=http://localhost:4000/api`.
2. Start **both** from the project root: **`npm run dev:all`** (runs backend on port 4000 and frontend on 3000).  
   Or run in two terminals: `cd backend && npm run dev` then `npm run dev`. Lab Reports and Buy will load from the API.

## Build

```bash
npm run build
npm start
```

## Pages

1. **Home** — Hero, value props, CTA
2. **Our Process** — 7-step timeline (farm → jar)
3. **Lab Reports** — Batch table with PDF links
4. **About Founder** — Story and philosophy
5. **Buy Now** — Product card, size/quantity, add to cart, checkout modal (Razorpay pay-first)
6. **My orders** — Logged-in customers see order history at `/orders`

## Production / deployment

- **Frontend (e.g. Vercel):** Set `NEXT_PUBLIC_API_URL` to your backend API URL (e.g. `https://your-backend.onrender.com/api`). Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` for checkout. Optional: `NEXT_PUBLIC_SITE_URL` for Open Graph; `NEXT_PUBLIC_SENTRY_DSN` for error monitoring. Build: `npm run build`; output: default.
- **Backend (e.g. Render):** Set `DATABASE_URL`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `CORS_ORIGIN` (your frontend origin, e.g. `https://your-app.vercel.app`). Run `npm run db:migrate:prod` before first deploy. Use **Health check path**: `/health`.

Checkout uses **Razorpay** (pay first, then order is created). Configure the webhook in Razorpay Dashboard to your backend `/api/payment/webhook` and set `RAZORPAY_WEBHOOK_SECRET`.

**E2E tests:** Run `npm run e2e` (start the app with `npm run dev` first, or set `CI=1` to auto-start). Use `npm run e2e:ui` for the Playwright UI.

## Design

- White/off-white (cream) background
- Earthy palette (beige, brown, muted gold)
- Serif (Cormorant Garamond via stylesheet when loaded) + sans (Inter) for headings and body
- Large type, generous whitespace
- Mobile-first, responsive
- Framer Motion for entrance and hover micro-interactions

No ads, reviews, popups, discounts, or dark patterns.
