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

const PROBLEMS_TO_GENERATE = 5;  // Generate 5 problems
const LEVEL = 1;  // Assign all problems to Level 1
const DIFFICULTY = "Easy";  // Difficulty level for all problems

// Function to generate a debugging problem using GPT
async function generateProblem() {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "user",
                content: `Generate a Java debugging challenge in the EXACT format below.

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

DO NOT include explanations. The buggy code must have EXACTLY one bug, and the fixed code should be the minimal correction.`
            }],
            max_tokens: 300
        });

        return response.choices[0].message.content.trim();
    } catch (err) {
        console.error("❌ OpenAI API Error:", err);
        return null;
    }
}

// Function to extract problem data using a more flexible regex
function extractProblemData(responseText) {
    console.log("🔍 GPT Response:\n", responseText); // Debugging output

    const match = responseText.match(
        /Problem:\s*(.*?)\n+Buggy Code:\s*```java\n([\s\S]+?)\n```[\s\S]*?Fixed Code:\s*```java\n([\s\S]+?)\n```/
    );

    if (!match || match.length !== 4) {
        console.error("❌ Error parsing problem data. Full response:\n", responseText);
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
    console.log(`🛠 Generating ${PROBLEMS_TO_GENERATE} ${DIFFICULTY} problems for Level ${LEVEL}...`);

    for (let i = 0; i < PROBLEMS_TO_GENERATE; i++) {
        console.log(`📌 Generating problem ${i + 1}...`);
        const problemResponse = await generateProblem();

        if (!problemResponse) {
            console.log(`⚠️ Skipping problem ${i + 1} due to API error.`);
            continue;
        }

        const problemData = extractProblemData(problemResponse);
        if (!problemData) {
            console.log(`⚠️ Skipping problem ${i + 1} due to parsing error.`);
            continue;
        }

        // Insert into problems table
        const query = `
            INSERT INTO problems (Difficulty, Description, Code, CorrectSolution, WrongOption1, WrongOption2, WrongOption3)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ProblemID;
        `;

        const values = [
            DIFFICULTY,
            problemData.description,
            problemData.buggyCode,
            problemData.fixedCode,
            "Wrong option 1", "Wrong option 2", "Wrong option 3"
        ];

        try {
            const result = await client.query(query, values);
            const problemID = result.rows[0].problemid;

            console.log(`✅ Inserted ProblemID: ${problemID}`);

            // Insert into challenges table
            const challengeQuery = `
                INSERT INTO challenges (Level, ProblemID) VALUES ($1, $2);
            `;
            await client.query(challengeQuery, [LEVEL, problemID]);

            console.log(`🔗 Assigned ProblemID ${problemID} to Level ${LEVEL}`);

        } catch (err) {
            console.error("❌ Error inserting problem or challenge:", err);
        }
    }

    await client.end();
    console.log("🎯 Database population completed.");
}

// Run the script
populateDatabase();