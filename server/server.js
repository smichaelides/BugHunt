require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors()); // Enable CORS
app.use(express.json()); // Allow JSON body parsing

// Database connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// 🟢 API Endpoint: Get a Single Challenge by ID
app.get('/problems/level/:level', async (req, res) => {
    const challengeID = req.params.challengeID;

    try {
        const query = `
            SELECT p.* FROM problems p
            JOIN challenges c ON p.ProblemID = c.ProblemID
            WHERE c.Level = $1;
        `;

        const { rows } = await pool.query(query, [challengeID]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Challenge not found" });
        }

        const problem = rows[0];

        // Shuffle answer choices
        const answers = [
            problem.CorrectSolution,
            problem.WrongOption1,
            problem.WrongOption2,
            problem.WrongOption3
        ].sort(() => Math.random() - 0.5);

        res.json({
            problemID: problem.ProblemID,
            description: problem.Description,
            code: problem.Code,
            choices: answers,
            correctAnswer: problem.CorrectSolution
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// 🟢 API Endpoint: Get All Levels
app.get('/levels', async (req, res) => {
    try {
        const query = `SELECT DISTINCT Level FROM challenges ORDER BY Level;`;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// 🟢 API Endpoint: Get Problems by Level
app.get('/problems/level/:level', async (req, res) => {
    const level = req.params.level;

    try {
        const query = `
            SELECT p.* FROM problems p
            JOIN challenges c ON p.ProblemID = c.ProblemID
            WHERE c.Level = $1;
        `;

        const { rows } = await pool.query(query, [level]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "No problems found for this level" });
        }

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});