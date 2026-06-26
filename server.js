const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve frontend from /public folder
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false } : false
});

// GET /products?category=X&limit=20&cursor=...
app.get('/products', async (req, res) => {
  try {
    const { category, limit = 20, cursor } = req.query;
    const lim = Math.min(parseInt(limit), 100);
    const params = [];
    let where = [];

    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }

    if (cursor) {
      const [cursorTime, cursorId] = cursor.split(',');
      params.push(cursorTime, cursorId);
      where.push(
        `(created_at, id) < ($${params.length - 1}, $${params.length})`
      );
    }

    const whereClause = where.length
      ? 'WHERE ' + where.join(' AND ') : '';

    params.push(lim + 1);
    const query = `
      SELECT id, name, category, price, created_at
      FROM products
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT $${params.length}
    `;

    const result = await pool.query(query, params);
    const hasMore = result.rows.length > lim;
    const products = result.rows.slice(0, lim);

    let nextCursor = null;
    if (hasMore && products.length > 0) {
      const last = products[products.length - 1];
      nextCursor = `${new Date(last.created_at).toISOString()},${last.id}`;
    }

    res.json({ products, nextCursor, hasMore });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /categories
app.get('/categories', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT DISTINCT category FROM products ORDER BY category'
    );
    res.json(r.rows.map(row => row.category));
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /stats
app.get('/stats', async (req, res) => {
  try {
    const r = await pool.query('SELECT COUNT(*) as total FROM products');
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Fallback: serve index.html for any unmatched GET request that accepts HTML
// Use middleware instead of route pattern to avoid path-to-regexp issues
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts && req.accepts('html')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
