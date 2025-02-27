require('dotenv').config({ path: '/Users/lorenzocagliero/Desktop/Spring 25/IW04/BugHunt-1/.env' });
const { Client } = require('pg');
const OpenAI = require('openai');

// Debug environment variables
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

const NUM_QUESTIONS_PER_DIFFICULTY = 5;

// Function to generate debugging questions in one request for all three difficulty levels
async function generateQuestions() {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ 
                role: "user", 
                content: `Generate three distinct Java debugging challenges, one for each of the following difficulty levels: Easy, Medium, and Hard.

Each challenge should be structured as follows:

### [Difficulty] Question:
Problem: [Brief problem statement]
Buggy Code:
\`\`\`java
[buggy code]
\`\`\`
Fixed Code:
\`\`\`java
[corrected code]
\`\`\`

- Ensure each buggy code snippet has **exactly one bug**.
- Provide the **minimal** necessary correction in the fixed code.
- Ensure the total response length is **under 700 tokens**.` 
            }],
            max_tokens: 700
        });

        return response.choices[0].message.content;
    } catch (err) {
        console.error("OpenAI API Error:", err);
        return null;
    }
}

// Function to extract and insert debugging challenges into the database
async function insertQuestions() {
    await client.connect();

    for (let i = 0; i < NUM_QUESTIONS_PER_DIFFICULTY; i++) {
        console.log(`Generating batch ${i + 1} of questions...`);

        const questions = await generateQuestions();
        if (!questions) {
            console.log(`No questions generated in batch ${i + 1}.`);
            continue;
        }

        // Extract questions using regex
        const questionMatches = questions.match(/### (Easy|Medium|Hard) Question:\s*Problem:\s*(.*?)\nBuggy Code:\s*```java\n([\s\S]*?)\n```\nFixed Code:\s*```java\n([\s\S]*?)\n```/g);
        if (!questionMatches || questionMatches.length !== 3) {
            console.error(`Could not parse three questions for batch ${i + 1}.`);
            console.log("Raw response:", questions); // Debugging
            continue;
        }

        questionMatches.forEach(async (match) => {
            const parts = match.match(/### (Easy|Medium|Hard) Question:\s*Problem:\s*(.*?)\nBuggy Code:\s*```java\n([\s\S]*?)\n```\nFixed Code:\s*```java\n([\s\S]*?)\n```/);

            if (!parts || parts.length !== 5) {
                console.error(`Invalid format for question in batch ${i + 1}`);
                console.log("Raw match:", match); // Debugging
                return;
            }

            const difficulty = parts[1].trim();
            const description = parts[2].trim();
            const buggyCode = parts[3].trim();
            const fixedCode = parts[4].trim();

            const query = `
                INSERT INTO problems (Difficulty, Description, Code, CorrectSolution, WrongOption1, WrongOption2, WrongOption3)
                VALUES ($1, $2, $3, $4, $5, $6, $7);
            `;

            const values = [
                difficulty,  
                description,  
                buggyCode,  
                fixedCode,  
                "Wrong option 1", "Wrong option 2", "Wrong option 3"  
            ];

            try {
                await client.query(query, values);
                console.log(`Inserted ${difficulty} question:`, description);
            } catch (err) {
                console.error("Error inserting question:", err);
            }
        });
    }

    await client.end();
    console.log("Database connection closed.");
}

// Run script
insertQuestions();