const mysql = require('mysql2/promise');

async function initDB() {
    try {
        console.log('Connecting to public database...');
        const pool = mysql.createPool('mysql://root:sNBdyvzJwXUXRpGmEOByNKxWbjmdMRaf@shortline.proxy.rlwy.net:16599/railway');

        console.log('Creating tables...');
        // Initialize tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS event_registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                mobile VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                event_title VARCHAR(255) NOT NULL,
                student_type VARCHAR(50) NOT NULL,
                kanan_id VARCHAR(100),
                city VARCHAR(100),
                destination VARCHAR(100),
                education_level VARCHAR(100),
                referral_source VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS callback_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                mobile VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                interest VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS newsletter_subs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(191) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) DEFAULT CHARSET=utf8
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
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

        await pool.query(`
            CREATE TABLE IF NOT EXISTS callback_interests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                label VARCHAR(191) NOT NULL,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) DEFAULT CHARSET=utf8
        `);

        // Ensure is_featured column exists
        await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) DEFAULT 0`).catch(() => { });

        // Seed default interests if table is empty
        const [existing] = await pool.query('SELECT COUNT(*) as cnt FROM callback_interests');
        if (existing[0].cnt === 0) {
            await pool.query(`INSERT INTO callback_interests (label, sort_order) VALUES
                ('Study Abroad Counselling', 1),
                ('IELTS / PTE / TOEFL Coaching', 2),
                ('Visa Assistance', 3),
                ('University Admissions', 4),
                ('Scholarship Guidance', 5)
            `);
        }

        // HODs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS hods (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(191) NOT NULL,
                designation VARCHAR(191),
                department VARCHAR(191),
                phone VARCHAR(50),
                email VARCHAR(191),
                branch TEXT,
                vcard_image VARCHAR(255) DEFAULT NULL,
                initials VARCHAR(10),
                color VARCHAR(20) DEFAULT '#0052CC',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) DEFAULT CHARSET=utf8
        `);

        // Seed default HODs if empty
        const [hodsCount] = await pool.query('SELECT COUNT(*) as cnt FROM hods');
        if (hodsCount[0].cnt === 0) {
            await pool.query(`INSERT INTO hods (name, designation, department, phone, email, branch, initials, color) VALUES
                ('Rajeev Kumar', 'Event Manager', 'Event Management & Visa Fairs', '+91 97275 00000', 'rajeev@kananinternational.com', 'Head Office, Vadodara', 'RK', '#0052CC'),
                ('Anil Goel', 'Head – Canada & B2C', 'Canada Admissions & Onshore Support', '+91 63590 75555', 'anilgoyal@kananinternational.com', 'Kanan House, 2nd Floor, Trident Complex, Vadodara', 'AG', '#003399'),
                ('Bheru Singh', 'Head – Germany Program', 'Germany & European Education', '+91 97275 00000', 'bheru@kananinternational.com', 'Head Office, Vadodara', 'BS', '#1A3A66'),
                ('Sagar Pokhrel', 'Head – Australia Program', 'Australia Admissions & Visa', '+91 97275 00000', 'sagar@kananinternational.com', 'Head Office, Vadodara', 'SP', '#005533'),
                ('Sneha Nair', 'Head – Dubai Program', 'Dubai & UAE Education', '+91 97275 00000', 'sneha@kananinternational.com', 'Bhyli Branch, Vadodara', 'SN', '#CC7A00'),
                ('Ankit Singh', 'Head – Value Added Services', 'Loans, Insurance & VAS', '+91 97275 00000', 'ankit@kananinternational.com', 'Head Office, Vadodara', 'AS', '#006B5B'),
                ('Rahul Rajput', 'Head – Europe & Ireland', 'European Education Programs', '+91 97275 00000', 'rahul@kananinternational.com', 'Head Office, Vadodara', 'RR', '#5500CC'),
                ('Kishori Modi', 'Head – USA & Medicine', 'USA Admissions & Medical Education', '+91 97275 00000', 'kishori@kananinternational.com', 'Head Office, Vadodara', 'KM', '#0052CC'),
                ('Priyannka Patel', 'Head – UK Program', 'UK Admissions & Visa', '+91 97275 00000', 'priyannka@kananinternational.com', 'Head Office, Vadodara', 'PP', '#0052CC'),
                ('Himanshu Panwar', 'Career Mentor Lead', 'My Career Mentor Program', '+91 97275 00000', 'himanshu@kananinternational.com', 'Head Office, Vadodara', 'HP', '#2D2D8B'),
                ('Kinnari V & Sanchita M', 'IELTS & Coaching Trainers', 'Test Preparation & Coaching', '+91 97275 00000', 'coaching@kananinternational.com', 'Bhyli Branch, Vadodara', 'KS', '#8B1A1A'),
                ('Kinnari V & Varsha G', 'IELTS & Coaching Trainers', 'Test Preparation & Coaching', '+91 97275 00000', 'coaching@kananinternational.com', 'Head Office, Vadodara', 'KV', '#8B1A1A'),
                ('Hardik Vadgama & Varsha G', 'B2B & B2C Leads', 'B2B Partnerships & B2C Operations', '+91 97275 00000', 'b2b@kananinternational.com', 'All Branches, Vadodara', 'HV', '#3D0099'),
                ('Varsha Godavale / Vikash Panchal / Akanksha Bagariya', 'Mock Test Coordinators', 'Test Preparation & Mock Drives', '+91 97275 00000', 'mocktest@kananinternational.com', 'Manjalpur Branch, Vadodara', 'VVA', '#995500')
            `);
        }

        console.log('Database and tables initialized successfully on public database!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}
initDB();
