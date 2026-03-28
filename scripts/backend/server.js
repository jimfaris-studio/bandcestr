const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bandcestr',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===========================================
// BANDS ENDPOINTS
// ===========================================

// Get all bands
app.get('/api/bands', async (req, res) => {
  try {
    const { location, genre, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM bands WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (location) {
      query += ` AND location_city ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }
    
    if (genre) {
      query += ` AND $${paramIndex} = ANY(genre_tags)`;
      params.push(genre);
      paramIndex++;
    }
    
    query += ` ORDER BY name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bands:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single band by slug
app.get('/api/bands/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM bands WHERE slug = $1', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Band not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching band:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get band members
app.get('/api/bands/:slug/members', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const query = `
      SELECT 
        p.id, p.name, p.slug, p.image_url,
        m.role, m.start_date, m.end_date, m.is_current
      FROM people p
      JOIN memberships m ON p.id = m.person_id
      JOIN bands b ON m.band_id = b.id
      WHERE b.slug = $1
      ORDER BY m.start_date DESC NULLS LAST
    `;
    
    const result = await pool.query(query, [slug]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching band members:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get band albums
app.get('/api/bands/:slug/albums', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const query = `
      SELECT a.*
      FROM albums a
      JOIN bands b ON a.band_id = b.id
      WHERE b.slug = $1
      ORDER BY a.release_year DESC, a.release_date DESC
    `;
    
    const result = await pool.query(query, [slug]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching band albums:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// PEOPLE ENDPOINTS
// ===========================================

// Get all people
app.get('/api/people', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const query = `
      SELECT * FROM people 
      ORDER BY name 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching people:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single person by slug
app.get('/api/people/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM people WHERE slug = $1', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching person:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get person's bands
app.get('/api/people/:slug/bands', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const query = `
      SELECT 
        b.id, b.name, b.slug, b.image_url, b.formed_year, b.disbanded_year,
        m.role, m.start_date, m.end_date, m.is_current
      FROM bands b
      JOIN memberships m ON b.id = m.band_id
      JOIN people p ON m.person_id = p.id
      WHERE p.slug = $1
      ORDER BY m.start_date DESC NULLS LAST
    `;
    
    const result = await pool.query(query, [slug]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching person bands:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get person's album credits
app.get('/api/people/:slug/albums', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const query = `
      SELECT 
        a.id, a.title, a.release_year, a.cover_art_url,
        ac.credit_type, ac.role,
        b.name as band_name, b.slug as band_slug
      FROM albums a
      JOIN album_credits ac ON a.id = ac.album_id
      JOIN people p ON ac.person_id = p.id
      JOIN bands b ON a.band_id = b.id
      WHERE p.slug = $1
      ORDER BY a.release_year DESC
    `;
    
    const result = await pool.query(query, [slug]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching person albums:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get person's collaborators (other musicians they've worked with)
app.get('/api/people/:slug/collaborators', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const query = `
      SELECT DISTINCT
        p2.id, p2.name, p2.slug, p2.image_url,
        COUNT(DISTINCT m2.band_id) as shared_bands
      FROM people p1
      JOIN memberships m1 ON p1.id = m1.person_id
      JOIN memberships m2 ON m1.band_id = m2.band_id
      JOIN people p2 ON m2.person_id = p2.id
      WHERE p1.slug = $1 AND p2.slug != $1
      GROUP BY p2.id, p2.name, p2.slug, p2.image_url
      ORDER BY shared_bands DESC, p2.name
      LIMIT 20
    `;
    
    const result = await pool.query(query, [slug]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching collaborators:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// SEARCH ENDPOINT
// ===========================================

app.get('/api/search', async (req, res) => {
  try {
    const { q, type = 'all', limit = 20 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({ bands: [], people: [] });
    }
    
    const searchTerm = `%${q}%`;
    const results = { bands: [], people: [] };
    
    // Search bands
    if (type === 'all' || type === 'band') {
      const bandQuery = `
        SELECT * FROM bands 
        WHERE name ILIKE $1 
        ORDER BY 
          CASE WHEN name ILIKE $2 THEN 0 ELSE 1 END,
          name
        LIMIT $3
      `;
      const bandResult = await pool.query(bandQuery, [searchTerm, q, limit]);
      results.bands = bandResult.rows;
    }
    
    // Search people
    if (type === 'all' || type === 'person') {
      const peopleQuery = `
        SELECT * FROM people 
        WHERE name ILIKE $1 
        ORDER BY 
          CASE WHEN name ILIKE $2 THEN 0 ELSE 1 END,
          name
        LIMIT $3
      `;
      const peopleResult = await pool.query(peopleQuery, [searchTerm, q, limit]);
      results.people = peopleResult.rows;
    }
    
    res.json(results);
  } catch (err) {
    console.error('Error searching:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// STATS ENDPOINT
// ===========================================

app.get('/api/stats', async (req, res) => {
  try {
    const stats = {};
    
    // Count bands
    const bandsResult = await pool.query('SELECT COUNT(*) FROM bands');
    stats.totalBands = parseInt(bandsResult.rows[0].count);
    
    // Count people
    const peopleResult = await pool.query('SELECT COUNT(*) FROM people');
    stats.totalPeople = parseInt(peopleResult.rows[0].count);
    
    // Count albums
    const albumsResult = await pool.query('SELECT COUNT(*) FROM albums');
    stats.totalAlbums = parseInt(albumsResult.rows[0].count);
    
    // Count relationships
    const membershipResult = await pool.query('SELECT COUNT(*) FROM memberships');
    stats.totalMemberships = parseInt(membershipResult.rows[0].count);
    
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// ERROR HANDLING
// ===========================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===========================================
// START SERVER
// ===========================================

app.listen(port, () => {
  console.log(`🎸 Bandcestr API server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});
