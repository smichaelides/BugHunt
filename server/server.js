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

// 🟢 API Endpoint: Get Problems as Multiple-Choice for a Level
app.get('/problems/:level', async (req, res) => {
    const level = req.params.level;

    try {
        const query = `
            SELECT p.ProblemID, p.Difficulty, p.Description, p.Code, p.CorrectSolution, p.WrongOption1, p.WrongOption2, p.WrongOption3
            FROM problems p
            JOIN challenges c ON p.ProblemID = c.ProblemID
            WHERE c.Level = $1;
        `;

        const { rows } = await pool.query(query, [level]);

        // Convert problems into multiple-choice format
        const formattedProblems = rows.map(problem => {
            const choices = [
                problem.CorrectSolution,
                problem.WrongOption1,
                problem.WrongOption2,
                problem.WrongOption3
            ];

            // Shuffle the answer choices randomly
            choices.sort(() => Math.random() - 0.5);

            return {
                problemID: problem.ProblemID,
                difficulty: problem.Difficulty,
                description: problem.Description,
                code: problem.Code,
                choices: choices,  // Randomized choices
                correctAnswer: problem.CorrectSolution
            };
        });

        res.json(formattedProblems);
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});