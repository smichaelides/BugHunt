require('dotenv').config({ path: '/Users/lorenzocagliero/Desktop/Spring25/IW04/BugHunt-1/.env' });
const { Client } = require('pg');
const OpenAI = require('openai');

console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Loaded" : "Not Found");

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const NUM_LEVELS = 3;  // Number of levels
const PROBLEMS_PER_LEVEL = 5; // 5 problems per level

// Define difficulty distribution per level
const difficultyDistribution = [
    ["Easy", "Easy", "Easy", "Easy", "Easy"],   // Level 1
    ["Easy", "Easy", "Easy", "Medium", "Medium"], // Level 2
    ["Easy", "Easy", "Medium", "Medium", "Hard"], // Level 3
    ["Easy", "Medium", "Medium", "Hard", "Hard"], // Level 4
    ["Medium", "Medium", "Hard", "Hard", "Hard"], // Level 5
    ["Medium", "Medium", "Medium", "Hard", "Hard"], // Level 6
    ["Medium", "Hard", "Hard", "Hard", "Hard"],  // Level 7
    ["Hard", "Hard", "Hard", "Hard", "Hard"],    // Level 8
    ["Hard", "Hard", "Hard", "Hard", "Hard"],    // Level 9
    ["Hard", "Hard", "Hard", "Hard", "Hard"]     // Level 10
];

// Function to generate debugging problems using GPT
async function generateProblem(difficulty) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ 
                role: "user", 
                content: `Generate a ${difficulty} Java debugging challenge for a coding game.

Format:

### Problem:
Problem: [Brief problem statement]
Buggy Code:
\`\`\`java
[buggy code]
\`\`\`
Fixed Code:
\`\`\`java
[corrected code]
\`\`\`

- The buggy code must contain **exactly one bug**.
- The fixed code must be the **minimal necessary correction**.
- Ensure the response is **concise and under 250 tokens**.` 
            }],
            max_tokens: 250
        });

        return response.choices[0].message.content;
    } catch (err) {
        console.error("OpenAI API Error:", err);
        return null;
    }
}

// Function to extract problem data from GPT response
function extractProblemData(responseText) {
    const match = responseText.match(/### Problem:\s*Problem:\s*(.*?)\nBuggy Code:\s*```java\n([\s\S]*?)\n```\nFixed Code:\s*```java\n([\s\S]*?)\n```/);

    if (!match || match.length !== 4) {
        console.error("Error parsing problem data:", responseText);
        return null;
    }

    return {
        description: match[1].trim(),
        buggyCode: match[2].trim(),
        fixedCode: match[3].trim()
    };
}

// Main function to populate the database
async function populateDatabase() {
    await client.connect();

    for (let level = 1; level <= NUM_LEVELS; level++) {
        console.log(`Generating problems for Level ${level}...`);

        for (let i = 0; i < PROBLEMS_PER_LEVEL; i++) {
            const difficulty = difficultyDistribution[level - 1][i]; // Select difficulty based on level

            console.log(`Generating ${difficulty} problem for Level ${level}...`);
            const problemResponse = await generateProblem(difficulty);
            if (!problemResponse) {
                console.log(`Skipping problem ${i + 1} for Level ${level} due to API error.`);
                continue;
            }

            const problemData = extractProblemData(problemResponse);
            if (!problemData) {
                console.log(`Skipping problem ${i + 1} for Level ${level} due to parsing error.`);
                continue;
            }

            const query = `
                INSERT INTO problems (Difficulty, Description, Code, CorrectSolution, WrongOption1, WrongOption2, WrongOption3)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ProblemID;
            `;

            const values = [
                difficulty,
                problemData.description,
                problemData.buggyCode,
                problemData.fixedCode,
                "Wrong option 1", "Wrong option 2", "Wrong option 3"
            ];

            try {
                const result = await client.query(query, values);
                const problemID = result.rows[0].problemid;

                console.log(`Inserted ${difficulty} problem with ProblemID: ${problemID} for Level ${level}`);

                // Insert into challenges table
                const challengeQuery = `
                    INSERT INTO challenges (Level, ProblemID) VALUES ($1, $2);
                `;
                await client.query(challengeQuery, [level, problemID]);

                console.log(`Assigned ProblemID ${problemID} to Level ${level}`);

            } catch (err) {
                console.error("Error inserting problem or challenge:", err);
            }
        }
    }

    await client.end();
    console.log("Database population completed.");
}

// Run the script
populateDatabase();