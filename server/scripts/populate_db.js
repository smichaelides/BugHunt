require('dotenv').config({ path: '/Users/lorenzocagliero/Desktop/Spring25/IW04/BugHunt-1/.env' });
const { Client } = require('pg');
const OpenAI = require('openai');

console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Loaded" : "Not Found");

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROBLEMS_PER_LEVEL = 5;
const TOTAL_LEVELS = 10;

const LEVEL_TOPICS = {
    1: "Intro to Debugging",
    2: "Basic Syntax Errors",
    3: "Logic Errors",
    4: "Runtime Errors",
    5: "Array and Object Debugging",
    6: "Function Debugging",
    7: "Async Code Debugging",
    8: "Performance Issues",
    9: "Memory Leaks",
    10: "Advanced Debugging"
};

// Generate a debugging problem using OpenAI
async function generateProblem(level, topic) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "user",
                content: `
Generate a Java debugging challenge focused on the theme "${topic}".
The total code should be no more than 12 lines. Follow this format exactly:

Problem: [Brief problem description here]

Buggy Code:
\`\`\`java
[up to 12 lines of buggy code]
\`\`\`

Correct Solution:
\`\`\`java
[corrected version of the buggy code, up to 12 lines]
\`\`\`

Wrong Options:
1. \`\`\`java
[first incorrect solution]
\`\`\`
2. \`\`\`java
[second incorrect solution]
\`\`\`
3. \`\`\`java
[third incorrect solution]
\`\`\`

Formatting Rules:
- Use exactly the formatting shown above.
- All options (correct and incorrect) must be Java code blocks.
- Each incorrect option must be a plausible fix but contain a mistake.
- Do NOT include any explanation or extra commentary.
                `.trim()
            }],
            max_tokens: 800
        });

        return response.choices[0].message.content.trim();
    } catch (err) {
        console.error("❌ OpenAI API Error:", err);
        return null;
    }
}

// Extract problem data
function extractProblemData(responseText) {
    const match = responseText.match(
        /Problem:\s*(.*?)\n+Buggy Code:\s*```java\n([\s\S]+?)\n```[\s\S]+?Correct Solution:\s*```java\n([\s\S]+?)\n```[\s\S]+?Wrong Options:\s*1\.\s*```java\n([\s\S]+?)\n```[\s\S]+?2\.\s*```java\n([\s\S]+?)\n```[\s\S]+?3\.\s*```java\n([\s\S]+?)\n```/
    );

    if (!match || match.length !== 7) {
        console.error("❌ Parsing error. Full GPT response:\n", responseText);
        return null;
    }

    return {
        description: match[1].trim(),
        buggyCode: match[2].trim(),
        fixedCode: match[3].trim(),
        wrongOption1: match[4].trim(),
        wrongOption2: match[5].trim(),
        wrongOption3: match[6].trim()
    };
}

// Main function
async function populateDatabase() {
    await client.connect();
    console.log(`🛠 Generating ${PROBLEMS_PER_LEVEL} problems for ${TOTAL_LEVELS} levels...`);

    for (let level = 1; level <= TOTAL_LEVELS; level++) {
        const topic = LEVEL_TOPICS[level];
        console.log(`\n📌 Generating problems for Level ${level}: ${topic}`);

        for (let i = 0; i < PROBLEMS_PER_LEVEL; i++) {
            console.log(`  🔧 Problem ${i + 1}/${PROBLEMS_PER_LEVEL}...`);
            const responseText = await generateProblem(level, topic);

            if (!responseText) {
                console.log(`  ⚠️ Skipped due to OpenAI error.`);
                continue;
            }

            const problem = extractProblemData(responseText);
            if (!problem) {
                console.log(`  ⚠️ Skipped due to parsing error.`);
                continue;
            }

            const query = `
                INSERT INTO problems (Level, Difficulty, Description, Code, CorrectSolution, WrongOption1, WrongOption2, WrongOption3)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ProblemID;
            `;

            const values = [
                level,
                topic,
                problem.description,
                problem.buggyCode,
                problem.fixedCode,
                problem.wrongOption1,
                problem.wrongOption2,
                problem.wrongOption3
            ];

            try {
                const result = await client.query(query, values);
                console.log(`  ✅ Inserted ProblemID: ${result.rows[0].problemid}`);
            } catch (err) {
                console.error("  ❌ Error inserting problem:", err);
            }
        }
    }

    await client.end();
    console.log("\n🎯 Database population completed.");
}

populateDatabase();