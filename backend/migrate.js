const mysql = require('mysql2/promise');

async function migrate() {
    const pool = mysql.createPool({
        host: 'tramway.proxy.rlwy.net',
        port: 57869,
        user: 'root',
        password: 'mVfivpIoPWiGQYjmKwErMtLqVTGPXNik',
        database: 'railway',
        connectTimeout: 15000
    });

    console.log('Connected. Running migrations...');

    // Create counsellings table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS counsellings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            mobile VARCHAR(50) NOT NULL,
            preferred_country VARCHAR(100),
            assigned_counselor VARCHAR(191),
            status VARCHAR(50) DEFAULT 'Pending',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARSET=utf8
    `);
    console.log('counsellings table OK');

    // Add missing columns to events table
    const cols = [
        'ALTER TABLE events ADD COLUMN is_featured TINYINT(1) DEFAULT 0',
        'ALTER TABLE events ADD COLUMN teamLead VARCHAR(191)',
    ];
    for (const sql of cols) {
        try { await pool.query(sql); console.log('Added:', sql.split('ADD COLUMN')[1].trim()); }
        catch (e) { console.log('Column already exists (skipped):', e.message.split("'")[1] || ''); }
    }

    console.log('All migrations done!');
    await pool.end();
    process.exit(0);
}

migrate().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
