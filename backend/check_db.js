const mysql = require('mysql2/promise');
(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost', user: 'root', password: '', database: 'kanan_events'
        });
        const [charRows] = await conn.query("SHOW VARIABLES LIKE '%char%'");
        console.log('Charset vars:', JSON.stringify(charRows.map(r => ({ name: r.Variable_name, val: r.Value }))));

        // Try creating the events table with charset=utf8 (3 byte) to avoid key length issues
        await conn.query(`DROP TABLE IF EXISTS events`);
        await conn.query(`
            CREATE TABLE events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                month VARCHAR(50),
                type VARCHAR(100),
                ribbonColor VARCHAR(50),
                dateDayStr VARCHAR(10),
                dateMonthStr VARCHAR(20),
                title VARCHAR(191) NOT NULL,
                subtitle VARCHAR(191),
                venue VARCHAR(191),
                time VARCHAR(100),
                tags TEXT,
                isOnline TINYINT(1) DEFAULT 0,
                activitiesLabel VARCHAR(100),
                activities TEXT,
                searchKeys TEXT,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) DEFAULT CHARSET=utf8
        `);
        console.log('events table created successfully!');
        conn.end();
    } catch (e) {
        console.error('ERROR:', e.message);
    }
})();
