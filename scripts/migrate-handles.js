#!/usr/bin/env node
/*
  migrate-handles.js

  Usage:
    node migrate-handles.js       # dry-run (detect collisions)
    node migrate-handles.js --apply  # perform updates and add unique index

  Requires environment variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
*/

const mysql = require('mysql2/promise');
const argv = process.argv.slice(2);
const doApply = argv.includes('--apply');

async function main() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'pds_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'augendapet_db',
    connectionLimit: 5
  });

  console.log('Connected to DB', process.env.DB_NAME || 'augendapet_db');

  // Fetch businesses
  const [businesses] = await pool.query('SELECT id, brand_name, custom_domain FROM businesses');
  const proposed = businesses.map(b => {
    let handle = null;
    if (b.custom_domain) {
      handle = b.custom_domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*/, '');
    } else if (b.brand_name) {
      handle = b.brand_name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    return { id: b.id, proposed: handle };
  });

  // Detect duplicates among proposed handles
  const counts = {};
  for (const p of proposed) {
    if (!p.proposed) continue;
    counts[p.proposed] = (counts[p.proposed] || 0) + 1;
  }

  const collisions = Object.entries(counts).filter(([h, c]) => c > 1);
  if (collisions.length > 0) {
    console.log('Detected collisions for proposed handles:');
    for (const [h, c] of collisions) console.log(`  ${h}: ${c} businesses`);
  } else {
    console.log('No collisions detected among proposed handles.');
  }

  if (!doApply) {
    console.log('\nDry run complete. Rerun with --apply to set handles and add index.');
    await pool.end();
    return;
  }

  // Apply handles where not null
  for (const p of proposed) {
    if (!p.proposed) continue;
    await pool.query('UPDATE businesses SET handle = ? WHERE id = ?', [p.proposed, p.id]);
    console.log(`Updated ${p.id} -> ${p.proposed}`);
  }

  // Create unique index; wrap in try/catch to report if duplicates remain
  try {
    await pool.query('ALTER TABLE businesses ADD UNIQUE INDEX ux_business_handle (handle)');
    console.log('Unique index ux_business_handle created.');
  } catch (err) {
    console.error('Failed to create unique index. Resolve duplicates before applying index.', err.message);
  }

  await pool.end();
  console.log('Migration applied.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
