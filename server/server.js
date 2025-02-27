// server/server.js

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// PostgreSQL connection setup
const pool = new Pool({
    user: 'lorenzocagliero', // Your database username
    host: 'localhost', // Assuming the database is on the same machine
    database: 'burghunt_db', // Your database name
    password: '', // No password
    port: 5432, // Default PostgreSQL port
});

// API endpoint to get questions
app.get('/api/questions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM problems'); // Replace 'questions' with your actual table name
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).send('Error fetching questions');
    }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});