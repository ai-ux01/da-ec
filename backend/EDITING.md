# How to edit AMRYTUM content

An **admin** controls all dynamic data via the API (with a magic-link JWT). No code changes needed for copy or products.

---

## 1. Who is the admin?

- **Auth:** Admin signs in with **magic link** (no password).
- **Steps:**  
  1. `POST /api/admin/auth/request-link` with body `{ "email": "admin@example.com" }`.  
  2. In dev, the response includes `dev_link` — open it in a browser (or call the verify URL with the token).  
  3. The verify response returns a **JWT**. Use it as `Authorization: Bearer <token>` for all admin requests.

Add the first admin by using any email in step 1; that email is registered as an admin.

---

## 2. What the admin can edit

| Data | Public (read) | Admin (edit) |
|------|----------------|--------------|
| **Site content** (brand, process steps, founder) | `GET /api/site` | `GET /api/admin/site` — get current<br>`PUT /api/admin/site` — update |
| **Catalog** (products for Buy page) | `GET /api/catalog` | `GET /api/admin/catalog` — list products<br>`POST /api/admin/catalog/products` — create<br>`PUT /api/admin/catalog/products/:id` — update<br>`DELETE /api/admin/catalog/products/:id` — delete |
| **Batches, lab reports, jars, orders, customers** | See API overview in README | Use existing admin endpoints (Postman collection) |

---

## 3. Editing site content (Home, Process, About, Footer)

**Get current:**  
`GET /api/admin/site`  
Headers: `Authorization: Bearer <your-jwt>`

**Update:**  
`PUT /api/admin/site`  
Headers: `Authorization: Bearer <your-jwt>`, `Content-Type: application/json`  
Body (all fields optional; only sent fields are updated):

```json
{
  "brand": {
    "name": "AMRYTUM",
    "tagline": "From Farm to Ghee. No shortcuts.",
    "subtext": "Small batch A2 desi cow ghee made using the bilona method.",
    "cta": "Join the first batch"
  },
  "processSteps": [
    { "number": 1, "title": "Ethical farms", "description": "..." },
    { "number": 2, "title": "Fresh milk", "description": "..." }
  ],
  "founder": {
    "name": "Founder Name",
    "title": "Founder, AMRYTUM",
    "story": "Paragraph text...",
    "philosophy": ["Point one.", "Point two."],
    "imagePlaceholder": true
  }
}
```

You can send only `brand`, or only `processSteps`, or only `founder`; they are merged with existing content.

---

## 4. Editing the catalog (Buy page products)

**List products:**  
`GET /api/admin/catalog`  
Returns all catalog products (each has internal `id` for update/delete).

**Create product:**  
`POST /api/admin/catalog/products`  
Body:

```json
{
  "productId": "a2-ghee",
  "name": "A2 Desi Cow Ghee",
  "description": "Small batch, bilona method. Lab-tested. Glass jar.",
  "sizes": [
    { "id": "250ml", "label": "250 ml", "price": 899, "inr": "₹899" },
    { "id": "500ml", "label": "500 ml", "price": 1699, "inr": "₹1,699" }
  ],
  "defaultSizeId": "500ml",
  "sortOrder": 0
}
```

**Update product:**  
`PUT /api/admin/catalog/products/:id`  
Use the **internal `id`** (UUID) from the list response. Body can include any of: `productId`, `name`, `description`, `sizes`, `defaultSizeId`, `sortOrder`.

**Delete product:**  
`DELETE /api/admin/catalog/products/:id`  
Use the internal `id`.

---

## 5. Using Postman

1. Import `postman/AMRYTUM-API.postman_collection.json`.
2. Set collection variable `baseUrl` = `http://localhost:4000/api`.
3. **Auth:** Run **Auth → Request magic link** (with your admin email), then open **Verify** with the token from the response (or use the `dev_link`). Copy the returned `token` into the collection variable `token`.
4. **Site content:** Use **Admin – Site content** (GET current, PUT to update).
5. **Catalog:** Use **Admin – Catalog** (list, create product, update product, delete product).

---

## 6. First-time setup (empty database)

After running migrations, seed default site content and catalog:

```bash
cd backend
npm run db:seed
```

This creates one row of site content and the default products if none exist. The admin can then change everything via the API.

---

## Summary

- **Admin** = anyone who can complete magic-link auth; they control site content and catalog via the API.
- **Site content** → `GET` / `PUT` `/api/admin/site` (with Bearer token).
- **Catalog** → `GET` / `POST` / `PUT` / `DELETE` `/api/admin/catalog` and `/api/admin/catalog/products` (with Bearer token).
- Use **Postman** (or any HTTP client) with the JWT; no code edits required for copy or products.
