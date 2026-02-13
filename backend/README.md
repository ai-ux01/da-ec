# AMRYTUM Backend

Minimal, production-ready backend for the AMRYTUM food brand. Accountability and traceability: every jar links to a real batch. No fake stock, no generic products.

## Tech stack

- **Node.js** + **TypeScript**
- **Express**
- **PostgreSQL** + **Prisma ORM**
- **S3-compatible storage** (MinIO, AWS S3, or Cloudflare R2) for lab report PDFs
- **Admin auth**: email magic link → JWT (no passwords)

## Setup

1. **Copy env and set variables**

```bash
cp .env.example .env
```

Edit `.env`: set `DATABASE_URL`, `JWT_SECRET` (min 32 chars), and optionally S3 keys.

2. **Install and generate Prisma client**

```bash
npm install
npm run db:generate
```

3. **Database**

Create a PostgreSQL database, then:

```bash
npm run db:migrate
npm run db:seed   # optional: creates one farm if none exist
```

4. **Run**

```bash
npm run dev   # tsx watch
# or
npm run build && npm start
```

Server runs at `http://localhost:4000` by default. API prefix: `/api`.

## API overview

| Area | Public (read-only) | Admin (Bearer token) |
|------|--------------------|----------------------|
| **Batch** | `GET /api/batch/:batch_id` | CRUD, list, approve, reject |
| **Lab reports** | `GET /api/batch/:batch_id/lab-reports` | Upload PDF, list, get by id |
| **Farms** | — | Create, list, get by id |
| **Jars** | — | Create, bulk create, list, update |
| **Orders** | — | Create, list, update |
| **Customers** | — | Create, list, update |

**Auth**

- `POST /api/admin/auth/request-link` — body: `{ "email": "admin@example.com" }`. In dev, response includes `dev_link`; open it or use the token in verify.
- `GET /api/admin/auth/verify?token=...` — returns `{ "token": "JWT" }`. Use this JWT as `Authorization: Bearer <token>` for admin endpoints.

## Postman

Import `postman/AMRYTUM-API.postman_collection.json`. Set collection variables: `baseUrl` = `http://localhost:4000/api`, and after verify set `token` to the returned JWT.

## Folder structure

```
backend/
  prisma/
    schema.prisma
    migrations/
  src/
    lib/           # config, prisma, s3, auth, middleware
    modules/
      admin/      # auth routes (magic link)
      batch/
      farm/
      jar/
      lab/
      order/
      customer/
    routes/
      index.ts     # mount all under API prefix
    server.ts
  postman/
```

## Editing content (admin-controlled)

An **admin** (magic-link auth) controls all dynamic data via the API:

- **Site content** (brand, process steps, founder): `GET` / `PUT` `/api/admin/site` (Bearer token).
- **Catalog** (Buy page products): `GET` / `POST` / `PUT` / `DELETE` `/api/admin/catalog` and `/api/admin/catalog/products` (Bearer token).
- **Batches, lab reports, jars, orders, customers**: existing admin endpoints or `npm run db:studio`.

See **[EDITING.md](./EDITING.md)** for step-by-step instructions and Postman usage.

## Constraints (as requested)

- No microservices, no GraphQL, no frontend, no analytics, no reviews, no coupons.
- Public endpoints are read-only (batch by batch_id, lab reports for a batch).
- Admin-only: create/update batches, jars, lab reports, orders, customers; approve/reject batches.
