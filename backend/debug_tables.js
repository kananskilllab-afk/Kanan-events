const mysql = require('mysql2/promise');
(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost', user: 'root', password: '', database: 'kanan_events'
        });

        // Test each table
        const tables = ['event_registrations', 'callback_requests', 'newsletter_subs', 'events'];
        for (const t of tables) {
            try {
                await conn.query(`SELECT 1 FROM ${t} LIMIT 1`);
                console.log(`[OK] ${t}`);
            } catch (e) {
                console.log(`[FAIL] ${t}: ${e.message}`);
            }
        }

        // Try to show full error for initDB
        try {
            await conn.query(`
                CREATE TABLE IF NOT EXISTS newsletter_subs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('[OK] newsletter_subs create');
        } catch (e) {
            console.log('[newsletter_subs create FAIL]:', e.message);
        }

        conn.end();
    } catch (e) {
        console.error('Connection ERROR:', e.message);
    }
})();
