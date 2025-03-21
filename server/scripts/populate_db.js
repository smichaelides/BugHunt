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

const PROBLEMS_PER_LEVEL = 5;  // 5 problems per level
const TOTAL_LEVELS = 5;       // Total number of levels
const DIFFICULTY_DISTRIBUTION = {
    easy: 2,
    medium: 1,
    hard: 2
};

// Function to generate a debugging problem using GPT
async function generateProblem(difficulty) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "user",
                content: `Generate a Java debugging challenge in the EXACT format below. The difficulty should be ${difficulty}.

Problem: [Brief problem statement]

Buggy Code:
\`\`\`java
[buggy code]
\`\`\`

Fixed Code:
\`\`\`java
[corrected code]
\`\`\`

Wrong Options:
1. [First wrong option]
2. [Second wrong option]
3. [Third wrong option]

IMPORTANT FORMATTING RULES:
1. Start with "Problem:" (no ### or other markers)
2. Include "Buggy Code:" and "Fixed Code:" labels
3. Use \`\`\`java for code blocks
4. Wrong options should be plain text, not code blocks
5. Each wrong option should be on a new line starting with a number and period
6. DO NOT include explanations or additional text`
            }],
            max_tokens: 500
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

    // Clean up the response text
    responseText = responseText.replace(/###\s*Problem:/, 'Problem:');
    responseText = responseText.replace(/Wrong Options \(generate 3 plausible but incorrect solutions\):/, 'Wrong Options:');

    // Match the problem data with a more flexible pattern
    const match = responseText.match(
        /Problem:\s*(.*?)\n+(?:Buggy Code:)?\s*```java\n([\s\S]+?)\n```[\s\S]*?(?:Fixed Code:)?\s*```java\n([\s\S]+?)\n```[\s\S]*?(?:Wrong Options:)?\s*1\.\s*(.*?)\n2\.\s*(.*?)\n3\.\s*(.*?)(?:\n|$)/
    );

    if (!match || match.length !== 7) {
        console.error("❌ Error parsing problem data. Full response:\n", responseText);
        return null;
    }

    // Clean up the wrong options by removing any remaining code block markers
    const cleanWrongOption = (text) => {
        return text.replace(/```java\n?|\n?```/g, '').trim();
    };

    return {
        description: match[1].trim(),
        buggyCode: match[2].trim(),
        fixedCode: match[3].trim(),
        wrongOption1: cleanWrongOption(match[4]),
        wrongOption2: cleanWrongOption(match[5]),
        wrongOption3: cleanWrongOption(match[6])
    };
}

// Main function to populate the database
async function populateDatabase() {
    await client.connect();
    console.log(`🛠 Generating ${PROBLEMS_PER_LEVEL} problems for each of the ${TOTAL_LEVELS} levels...`);

    for (let level = 1; level <= TOTAL_LEVELS; level++) {
        console.log(`\n📌 Generating problems for Level ${level}...`);
        
        // Generate problems for each difficulty
        for (const [difficulty, count] of Object.entries(DIFFICULTY_DISTRIBUTION)) {
            for (let i = 0; i < count; i++) {
                console.log(`  Generating ${difficulty} problem ${i + 1}/${count}...`);
                const problemResponse = await generateProblem(difficulty);

                if (!problemResponse) {
                    console.log(`  ⚠️ Skipping problem due to API error.`);
                    continue;
                }

                const problemData = extractProblemData(problemResponse);
                if (!problemData) {
                    console.log(`  ⚠️ Skipping problem due to parsing error.`);
                    continue;
                }

                // Insert into problems table
                const query = `
                    INSERT INTO problems (Level, Difficulty, Description, Code, CorrectSolution, WrongOption1, WrongOption2, WrongOption3)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ProblemID;
                `;

                const values = [
                    level,
                    difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
                    problemData.description,
                    problemData.buggyCode,
                    problemData.fixedCode,
                    problemData.wrongOption1,
                    problemData.wrongOption2,
                    problemData.wrongOption3
                ];

                try {
                    const result = await client.query(query, values);
                    console.log(`  ✅ Inserted ProblemID: ${result.rows[0].problemid}`);
                } catch (err) {
                    console.error("  ❌ Error inserting problem:", err);
                }
            }
        }
    }

    await client.end();
    console.log("\n🎯 Database population completed.");
}

// Run the script
populateDatabase();