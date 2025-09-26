## E-commerce Mini Feature

Simple React + Express app demonstrating JWT login, products list/detail, cart with Context API, and a GraphQL `userProfile` query.

### Demo credentials

- Email: `user@example.com`
- Password: `password123`

### Monorepo structure

- `backend/`: Node.js/Express REST + GraphQL
- `frontend/`: React app (React Router, Context API)
- `Dockerfile`: Multi-stage production image
- `.github/workflows/ci.yml`: Installs deps, builds, runs tests, and does integration checks

### Requirements implemented

- JWT login with in-memory user and rate limiting (5/min)
- REST: `/products`, `/products/:id`, `/health`
- GraphQL: `/graphql` with `userProfile`
- Frontend: login, list, detail, cart add/remove and total
- Static data: `backend/products.json`
- Dockerized production image serving built frontend via Express
- CI workflow running `npm test` and integration hits for REST + GraphQL

### Local development

1. Backend

```bash
cd backend
npm install
cp .env.example .env  # optional; defaults are fine
npm start
# backend on http://localhost:4000
```

2. Frontend

```bash
cd frontend
npm install
cp .env.example .env  # optional; defaults are fine

npm start
# frontend on http://localhost:3000 (API base http://localhost:4000)
```

### Production build via Docker

```bash
docker build -t ecommerce-app .
docker run -p 4000:4000 ecommerce-app
# app at http://localhost:4000 (serves frontend build and API)
```

### Environment variables

- `JWT_SECRET` (default: demo value)
- `CORS_ORIGIN` (default: http://localhost:3000)
- `PORT` (default: 4000)
- `REACT_APP_API_BASE` (frontend, default: http://localhost:4000)

### Security notes

- Rate limiting on `/login`
- Helmet CSP and headers
- Input validation/sanitization
- Comments in `backend/server.js` explain SQL Injection, XSS, CSRF mitigations

### Tests

- CI runs `npm test` in both apps (currently smoke no-ops), builds frontend, starts backend, and verifies:
  - `/health`, `/products`, `/login`
  - `/graphql` `userProfile` with a real JWT from login
