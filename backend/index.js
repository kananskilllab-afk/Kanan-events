require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL || 'https://kanan-events.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());

// Setup multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, ''));
    }
});
const upload = multer({ storage: storage });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
let pool;

async function initDB() {
    try {
        // First connect without database to create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS kanan_events;');
        await connection.end();

        // Now create the pool with the database selected
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kanan_events',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

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


        console.log('Database and tables initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// ── HODs CRUD ──────────────────────────────────────────────────────────────
app.get('/api/hods', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM hods ORDER BY name ASC');
        res.json({ success: true, data: rows });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/hods/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM hods WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'HOD not found' });
        res.json({ success: true, data: rows[0] });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/hods', upload.single('vcard_image'), async (req, res) => {
    try {
        const { name, designation, department, phone, email, branch, initials, color } = req.body;
        const vcard_image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
        const [result] = await pool.execute(
            'INSERT INTO hods (name, designation, department, phone, email, branch, vcard_image, initials, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, designation || '', department || '', phone || '', email || '', branch || '', vcard_image, initials || '', color || '#0052CC']
        );
        res.status(201).json({ success: true, message: 'HOD created', id: result.insertId });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.put('/api/hods/:id', upload.single('vcard_image'), async (req, res) => {
    try {
        console.log('PUT /api/hods/:id', 'Body:', req.body, 'File:', req.file);
        const { name, designation, department, phone, email, branch, initials, color } = req.body;

        // If a new file is uploaded, update vcard_image. Otherwise, keep existing.
        if (req.file) {
            const vcard_image = `/uploads/${req.file.filename}`;
            console.log('Using new file:', vcard_image);
            await pool.execute(
                'UPDATE hods SET name=?, designation=?, department=?, phone=?, email=?, branch=?, vcard_image=?, initials=?, color=? WHERE id=?',
                [name, designation || '', department || '', phone || '', email || '', branch || '', vcard_image, initials || '', color || '#0052CC', req.params.id]
            );
        } else {
            console.log('No new file uploaded.');
            // Check if user specifically requested to remove the image (e.g. passing empty string)
            const removeImage = req.body.vcard_image === '';
            if (removeImage) {
                console.log('Removing image.');
                await pool.execute(
                    'UPDATE hods SET name=?, designation=?, department=?, phone=?, email=?, branch=?, vcard_image=NULL, initials=?, color=? WHERE id=?',
                    [name, designation || '', department || '', phone || '', email || '', branch || '', initials || '', color || '#0052CC', req.params.id]
                );
            } else {
                console.log('Keeping existing image.');
                await pool.execute(
                    'UPDATE hods SET name=?, designation=?, department=?, phone=?, email=?, branch=?, initials=?, color=? WHERE id=?',
                    [name, designation || '', department || '', phone || '', email || '', branch || '', initials || '', color || '#0052CC', req.params.id]
                );
            }
        }
        res.json({ success: true, message: 'HOD updated' });
    } catch (e) {
        console.error('Error on PUT /api/hods:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

app.delete('/api/hods/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM hods WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'HOD deleted' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const {
            name, mobile, email, eventTitle, studentType,
            kananId, city, destination, educationLevel, referralSource
        } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO event_registrations 
            (name, mobile, email, event_title, student_type, kanan_id, city, destination, education_level, referral_source) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, mobile, email, eventTitle, studentType, kananId || null, city || null, destination || null, educationLevel || null, referralSource || null]
        );

        res.status(201).json({ success: true, message: 'Registration successful', id: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/callback', async (req, res) => {
    try {
        const { name, mobile, email, interest } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO callback_requests (name, mobile, email, interest) VALUES (?, ?, ?, ?)`,
            [name, mobile, email, interest || null]
        );

        res.status(201).json({ success: true, message: 'Callback request registered', id: result.insertId });
    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        await pool.execute(`INSERT IGNORE INTO newsletter_subs (email) VALUES (?)`, [email]);
        res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET all callback requests (admin)
app.get('/api/callbacks', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM callback_requests ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching callbacks:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// DELETE a callback request (admin)
app.delete('/api/callbacks/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM callback_requests WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Callback deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET all callback interests
app.get('/api/interests', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM callback_interests ORDER BY sort_order ASC, id ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST new interest option
app.post('/api/interests', async (req, res) => {
    try {
        const { label } = req.body;
        if (!label || !label.trim()) return res.status(400).json({ success: false, message: 'Label required' });
        const [result] = await pool.execute('INSERT INTO callback_interests (label) VALUES (?)', [label.trim()]);
        res.status(201).json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// DELETE interest option
app.delete('/api/interests/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM callback_interests WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Interest deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



// --- Dynamic Events APIs ---

// GET the single featured event for the Hero section
app.get('/api/events/featured', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events WHERE is_featured = 1 AND is_active = 1 LIMIT 1');
        if (rows.length === 0) return res.json({ success: true, data: null });
        const r = rows[0];
        res.json({
            success: true,
            data: {
                ...r,
                tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : (r.tags || []),
                isOnline: !!r.isOnline,
                is_active: !!r.is_active,
                is_featured: !!r.is_featured,
            }
        });
    } catch (error) {
        console.error('Error fetching featured event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET all events (with optional filter for active only)
app.get('/api/events', async (req, res) => {
    try {
        const { activeOnly } = req.query;
        let query = 'SELECT * FROM events';
        if (activeOnly === 'true') {
            query += ' WHERE is_active = true';
        }
        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.query(query);
        // Parse JSON tags for frontend usage
        const parsedRows = rows.map(r => ({
            ...r,
            tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags,
            isOnline: !!r.isOnline,
            is_active: !!r.is_active
        }));
        res.json({ success: true, data: parsedRows });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST new event
app.post('/api/events', async (req, res) => {
    try {
        const { month, type, ribbonColor, dateDayStr, dateMonthStr, title, subtitle, venue, time, tags, isOnline, activitiesLabel, activities, searchKeys, is_active, is_featured, teamLead } = req.body;

        const tagsJson = JSON.stringify(tags || []);

        if (is_featured) {
            await pool.query('UPDATE events SET is_featured = 0');
        }

        const [result] = await pool.execute(
            `INSERT INTO events (month, type, ribbonColor, dateDayStr, dateMonthStr, title, subtitle, venue, time, tags, isOnline, activitiesLabel, activities, searchKeys, is_active, is_featured, teamLead) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [month || '', type || '', ribbonColor || '', dateDayStr || '', dateMonthStr || '', title, subtitle || '', venue || '', time || '', tagsJson, isOnline ? 1 : 0, activitiesLabel || '', activities || '', searchKeys || '', is_active !== false ? 1 : 0, is_featured ? 1 : 0, teamLead || null]
        );
        res.status(201).json({ success: true, message: 'Event created', id: result.insertId });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// PUT update event
app.put('/api/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const { month, type, ribbonColor, dateDayStr, dateMonthStr, title, subtitle, venue, time, tags, isOnline, activitiesLabel, activities, searchKeys, is_active, is_featured, teamLead } = req.body;

        const tagsJson = JSON.stringify(tags || []);

        if (is_featured) {
            await pool.query('UPDATE events SET is_featured = 0 WHERE id != ?', [eventId]);
        }

        await pool.execute(
            `UPDATE events SET month=?, type=?, ribbonColor=?, dateDayStr=?, dateMonthStr=?, title=?, subtitle=?, venue=?, time=?, tags=?, isOnline=?, activitiesLabel=?, activities=?, searchKeys=?, is_active=?, is_featured=?, teamLead=? WHERE id=?`,
            [month || '', type || '', ribbonColor || '', dateDayStr || '', dateMonthStr || '', title, subtitle || '', venue || '', time || '', tagsJson, isOnline ? 1 : 0, activitiesLabel || '', activities || '', searchKeys || '', is_active !== false ? 1 : 0, is_featured ? 1 : 0, teamLead || null, eventId]
        );
        res.json({ success: true, message: 'Event updated' });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// DELETE event
app.delete('/api/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        await pool.execute('DELETE FROM events WHERE id=?', [eventId]);
        res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST bulk import events from CSV
const csvParser = require('csv-parser');
app.post('/api/events/bulk', upload.single('csv_file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No CSV file uploaded' });

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                let inserted = 0;
                for (const row of results) {
                    console.log('--- CSV ROW ---', row);

                    // Extract fields from CSV row based on user's exact headings
                    const title = row['Main Event'] || row.title || row.Title;
                    if (!title) {
                        console.log('Skipping due to no title');
                        continue; // Skip empty rows or rows without title
                    }

                    const month = (row.Month || row.month || 'march').toLowerCase();
                    const type = 'seminar'; // Default, as it's not in their cols
                    const ribbonColor = '';

                    // Parse Date column (e.g. "15-Mar", "15 March", "15")
                    let dateDayStr = row.Date || row.dateDayStr || row.Day || '';
                    let dateMonthStr = row.Date || row.dateMonthStr || row.DateMonth || '';
                    if (row.Date) {
                        const dateParts = row.Date.split(/[- /\\]/);
                        if (dateParts.length > 0) dateDayStr = dateParts[0];
                        if (dateParts.length > 1) dateMonthStr = dateParts[1].substring(0, 3);
                    } else if (dateDayStr.length > 2) {
                        // If they just put a string in Day
                        dateDayStr = dateDayStr.substring(0, 2);
                    }

                    // Map other fields
                    const venue = row.Branch || row.venue || row.Venue || '';
                    const time = row.Time || row.time || '';
                    const activities = row.Activities || row.activities || '';
                    const teamLead = row['Team Leader'] || row.teamLead || row['Team Lead'] || null;

                    // Extra fields mapped to subtitle for visibility
                    let subtitleArr = [];
                    if (row.Department) subtitleArr.push(`Dept: ${row.Department}`);
                    if (row['Contact Number']) subtitleArr.push(`Contact: ${row['Contact Number']}`);
                    if (row['2nd Member']) subtitleArr.push(`Member 2: ${row['2nd Member']}`);
                    const subtitle = subtitleArr.join(' | ');

                    const isOnline = 0;
                    const activitiesLabel = 'Activities';
                    const searchKeys = '';
                    const is_active = 1;

                    // Handle tags
                    let tagsJson = '[]';
                    const rawTags = row.tags || row.Tags || '';
                    if (rawTags) {
                        const tagList = rawTags.split(',').map(t => t.trim().toLowerCase());
                        const parsedTags = [];
                        tagList.forEach(t => {
                            if (t === 'canada') parsedTags.push({ id: 'canada', label: 'Canada', colorClass: 't-canada' });
                            else if (t === 'uk') parsedTags.push({ id: 'uk', label: 'UK', colorClass: 't-uk' });
                            else if (t === 'usa') parsedTags.push({ id: 'usa', label: 'USA', colorClass: 't-usa' });
                            else if (t === 'australia') parsedTags.push({ id: 'australia', label: 'Australia', colorClass: 't-australia' });
                            else if (t === 'germany') parsedTags.push({ id: 'germany', label: 'Germany', colorClass: 't-germany' });
                            else if (t === 'ireland') parsedTags.push({ id: 'ireland', label: 'Ireland', colorClass: 't-ireland' });
                            else if (t === 'dubai') parsedTags.push({ id: 'dubai', label: 'Dubai', colorClass: 't-dubai' });
                            else if (t === 'ielts') parsedTags.push({ id: 'ielts', label: 'IELTS', colorClass: 't-coaching' });
                            else if (t === 'pte') parsedTags.push({ id: 'pte', label: 'PTE', colorClass: 't-coaching' });
                            else parsedTags.push({ id: t, label: t.charAt(0).toUpperCase() + t.slice(1), colorClass: 't-other' });
                        });
                        tagsJson = JSON.stringify(parsedTags);
                    }

                    await pool.execute(
                        `INSERT INTO events (month, type, ribbonColor, dateDayStr, dateMonthStr, title, subtitle, venue, time, tags, isOnline, activitiesLabel, activities, searchKeys, is_active, is_featured, teamLead) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [month, type, ribbonColor, dateDayStr, dateMonthStr, title, subtitle, venue, time, tagsJson, isOnline, activitiesLabel, activities, searchKeys, is_active, 0, teamLead]
                    );
                    inserted++;
                }

                // Cleanup temp file
                fs.unlink(req.file.path, () => { });
                res.status(201).json({ success: true, message: `Successfully imported ${inserted} events!` });
            });
    } catch (error) {
        console.error('Error in bulk import:', error);
        res.status(500).json({ success: false, message: 'Internal server error during import' });
    }
});

// ==========================================
// COUNSELLINGS ROUTES
// ==========================================

// GET all counsellings
app.get('/api/counsellings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM counsellings ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching counsellings:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST new counselling
app.post('/api/counsellings', async (req, res) => {
    try {
        const { name, mobile, preferred_country, assigned_counselor, status, notes } = req.body;

        if (!name || !mobile) {
            return res.status(400).json({ success: false, message: 'Name and Mobile are required' });
        }

        const [result] = await pool.execute(
            `INSERT INTO counsellings (name, mobile, preferred_country, assigned_counselor, status, notes) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, mobile, preferred_country || '', assigned_counselor || '', status || 'Pending', notes || '']
        );
        res.status(201).json({ success: true, message: 'Counselling record created', id: result.insertId });
    } catch (error) {
        console.error('Error creating counselling:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// PUT update counselling
app.put('/api/counsellings/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name, mobile, preferred_country, assigned_counselor, status, notes } = req.body;

        if (!name || !mobile) {
            return res.status(400).json({ success: false, message: 'Name and Mobile are required' });
        }

        await pool.execute(
            `UPDATE counsellings SET name=?, mobile=?, preferred_country=?, assigned_counselor=?, status=?, notes=? WHERE id=?`,
            [name, mobile, preferred_country || '', assigned_counselor || '', status || 'Pending', notes || '', id]
        );
        res.json({ success: true, message: 'Counselling record updated' });
    } catch (error) {
        console.error('Error updating counselling:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// DELETE counselling
app.delete('/api/counsellings/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await pool.execute('DELETE FROM counsellings WHERE id=?', [id]);
        res.json({ success: true, message: 'Counselling record deleted' });
    } catch (error) {
        console.error('Error deleting counselling:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ==========================================
// REGISTRATIONS ROUTES
// ==========================================

// GET all registrations (with optional event_title filter)
app.get('/api/registrations', async (req, res) => {
    try {
        const { event } = req.query;
        let query = 'SELECT * FROM event_registrations';
        const params = [];
        if (event) {
            query += ' WHERE event_title = ?';
            params.push(event);
        }
        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET registrations as CSV export
app.get('/api/registrations/export', async (req, res) => {
    try {
        const { event } = req.query;
        let query = 'SELECT * FROM event_registrations';
        const params = [];
        if (event) {
            query += ' WHERE event_title = ?';
            params.push(event);
        }
        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(query, params);

        const headers = ['ID', 'Name', 'Mobile', 'Email', 'Event', 'Type', 'Kanan ID', 'City', 'Destination', 'Education Level', 'Referral Source', 'Registered At'];
        const csvRows = rows.map(r => [
            r.id, `"${r.name}"`, r.mobile, r.email, `"${r.event_title}"`,
            r.student_type, r.kanan_id || '', r.city || '', r.destination || '',
            r.education_level || '', r.referral_source || '',
            new Date(r.created_at).toLocaleString('en-IN')
        ].join(','));

        const csv = [headers.join(','), ...csvRows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="registrations${event ? '-' + event.replace(/ /g, '_') : ''}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting registrations:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// DELETE a registration
app.delete('/api/registrations/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM event_registrations WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Registration deleted' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Kanan Events API is running' });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    await initDB();
    console.log(`Server is running on port ${PORT}`);
});
