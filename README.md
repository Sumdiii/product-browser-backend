# Product Browser Backend

A small Node.js/Express backend for browsing products with cursor-based pagination.

## What’s included

- `server.js` — Express backend with endpoints for `/products`, `/categories`, and `/stats`
- `index.html` — frontend browser page that queries the backend
- `seed.js` — sample DB seeder
- `schema.sql` — database schema
- `test-api.js` — lightweight endpoint smoke test

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with at least:

```env
DATABASE_URL=postgres://user:password@host:port/database
NODE_ENV=development
```

3. Seed the database (optional if you already have data):

```bash
npm run seed
```

## Run the server

```bash
npm start
```

The backend listens on `http://localhost:5000`.

## Frontend

The frontend currently lives in `index.html` and can be opened directly in the browser or served with a local HTTP server.

If you want to serve the backend-generated frontend from the same server, move the frontend into a `public/` folder and update the server static path accordingly.

## API Endpoints

- `GET /categories` — list of categories
- `GET /stats` — product count
- `GET /products?limit=<n>&category=<category>&cursor=<cursor>` — paginated product list

## Tests

Run the smoke test to verify the backend endpoints:

```bash
npm test
```

## Notes

- The current `server.js` configuration expects a `public/` folder for static assets.
- If you use Live Server or open `index.html` directly, the frontend will still query the backend on port `5000`.
