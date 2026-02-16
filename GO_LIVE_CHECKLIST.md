# AMRYTUM — Go-live checklist

Use this checklist before and after deploying to production (e.g. Vercel + Render).

---

## 1. Environment keys (secrets)

### Frontend (Vercel / hosting env)

| Key | Required | Where to get it | Notes |
|-----|----------|-----------------|--------|
| `NEXT_PUBLIC_API_URL` | **Yes** | Your backend base URL + `/api` | e.g. `https://your-app.onrender.com/api`. Must not be localhost in production. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **Yes** (for payments) | Razorpay Dashboard → API Keys | Use **test** keys for staging, **live** for production. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Your frontend URL | e.g. `https://your-app.vercel.app`. Used for Open Graph / link previews. |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry project → Settings → Client Keys (DSN) | For frontend error monitoring. Unset = no reporting. |

### Backend (Render / Node host env)

| Key | Required | Where to get it | Notes |
|-----|----------|-----------------|--------|
| `DATABASE_URL` | **Yes** | Render PostgreSQL or your DB provider | Must not point to localhost in production. |
| `JWT_SECRET` | **Yes** | Generate a long random string (≥32 chars) | e.g. `openssl rand -base64 32`. Keep secret. |
| `RAZORPAY_KEY_ID` | **Yes** (for payments) | Razorpay Dashboard → API Keys | Same mode (test/live) as frontend key. |
| `RAZORPAY_KEY_SECRET` | **Yes** (for payments) | Razorpay Dashboard → API Keys | **Secret** — never expose in frontend. |
| `RAZORPAY_WEBHOOK_SECRET` | **Yes** (for payments) | Razorpay Dashboard → Webhooks → Add URL → copy secret | Used to verify webhook payloads. |
| `CORS_ORIGIN` | **Yes** | Your frontend origin(s) | e.g. `https://your-app.vercel.app`. Comma-separated if multiple. |
| `TWILIO_ACCOUNT_SID` | **Yes** (for OTP) | Twilio Console | Required so customers receive login OTP in production. |
| `TWILIO_AUTH_TOKEN` | **Yes** (for OTP) | Twilio Console | **Secret.** |
| `TWILIO_PHONE_NUMBER` | **Yes** (for OTP) | Twilio Console (phone number) | E.164 format, e.g. `+91xxxxxxxxxx`. |
| `MAGIC_LINK_BASE_URL` | Recommended | Backend base + path | e.g. `https://your-app.onrender.com/api/admin/auth/verify` for admin magic links. |

Optional (see `backend/.env.example`): S3 for lab report PDFs, SMTP for admin magic-link emails.

---

## 2. Pre-go-live steps

### Razorpay

- [ ] Create/link Razorpay account and switch to **live** mode for production.
- [ ] In Razorpay Dashboard → Webhooks, add URL: `https://<your-backend-host>/api/payment/webhook`.
- [ ] Subscribe to event: **Payment Captured**.
- [ ] Copy the **Webhook Secret** into backend env as `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Use **live** Key ID and Key Secret in both frontend (`NEXT_PUBLIC_RAZORPAY_KEY_ID`) and backend (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).

### Database

- [ ] Production DB created (e.g. Render PostgreSQL).
- [ ] `DATABASE_URL` set in backend env (no localhost).
- [ ] Run migrations: from `backend/`, run `npm run db:migrate:prod` (or `npx prisma migrate deploy`) before or during first deploy.
- [ ] Optional: run seed if needed: `npm run db:seed` (e.g. for initial catalog/farm).

### Backend deploy (e.g. Render)

- [ ] Root directory set to `backend` (if repo is monorepo at root).
- [ ] Build command: e.g. `npm install && npx prisma generate`.
- [ ] Start command: `npm start` (or `node dist/server.js`).
- [ ] Health check path: `/health`.
- [ ] All env vars from section 1 (backend) set; no secrets in repo.

### Frontend deploy (e.g. Vercel)

- [ ] Build command: `npm run build`; output: default.
- [ ] All env vars from section 1 (frontend) set; `NEXT_PUBLIC_API_URL` points to live backend (not localhost).

### SMS (OTP)

- [ ] Twilio account configured; number able to send to Indian mobiles (+91).
- [ ] All three Twilio env vars set in backend so customer OTP login works in production.

---

## 3. Post-deploy checks

- [ ] **Health:** Open `https://<backend-host>/health` — expect `{"status":"ok",...}`.
- [ ] **Frontend loads:** Open frontend URL; home page and nav load.
- [ ] **API connection:** Lab Reports and Buy page load data from API (not only mock).
- [ ] **Login:** Request OTP with a real Indian mobile; receive SMS and complete login.
- [ ] **Checkout:** Add to cart → checkout → create Razorpay order (test/live as applicable) → complete or cancel; no hard errors.
- [ ] **Webhook:** After a successful test payment, confirm order appears in admin (and optionally in My Orders) so webhook is working.
- [ ] **Admin:** Request admin magic link; open link and access admin dashboard; verify orders/customers/catalog.
- [ ] **CORS:** No browser CORS errors when frontend calls backend from production URL.
- [ ] **Sentry (if used):** Trigger a test error or use Sentry’s test button; event appears in Sentry project.

---

## 4. Security reminders

- Never commit `.env`, `.env.local`, or any file containing real keys.
- Rotate secrets if they were ever exposed (e.g. pasted in chat or committed).
- Use Razorpay **test** keys and test mode for staging; switch to **live** only for production.
- Keep `JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `TWILIO_AUTH_TOKEN` only on the backend and in the host’s env (e.g. Render env vars).