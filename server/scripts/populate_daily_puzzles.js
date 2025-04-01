require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const OpenAI = require('openai');

// Configure PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Configure OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Constants
const TOTAL_PUZZLES = 30; // Create 30 puzzles per run
const DIFFICULTY = 'Hard'; // All daily puzzles are hard

// Function to generate a single daily puzzle using OpenAI
async function generateDailyPuzzle() {
  console.log(`Generating a new daily puzzle...`);
  
  const topics = [
    'collections and generics',
    'multithreading and synchronization',
    'exception handling',
    'inheritance and polymorphism',
    'stream API',
    'memory management',
    'object equality',
    'serialization',
    'design patterns',
    'null pointer handling',
    'concurrency issues',
    'IO operations',
    'lambda expressions',
    'method overloading/overriding',
    'static context'
  ];
  
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  const prompt = `Create a challenging but concise programming bug in Java focusing on ${randomTopic}. The bug should be interesting and not too obvious, but the solution should be concise.

The bug should demonstrate a common pitfall or misconception in Java programming.

Format the response exactly as follows:

Description: [A clear description of the bug scenario]

Buggy Code:
\`\`\`java
[Code with the bug - keep it under 12 lines]
\`\`\`

Correct Solution:
\`\`\`java
[Fixed code]
\`\`\`

Wrong Option 1:
\`\`\`java
[An incorrect solution that looks plausible]
\`\`\`

Wrong Option 2:
\`\`\`java
[Another incorrect solution]
\`\`\`

Wrong Option 3:
\`\`\`java
[A third incorrect solution]
\`\`\`

Each wrong option should represent a different common misconception or mistake that developers might make when trying to fix this issue.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert Java programming tutor who creates challenging but educational programming puzzles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null;
  }
}

// Function to extract puzzle data from OpenAI response
function extractPuzzleData(responseText) {
  try {
    // Extract description
    const descriptionMatch = responseText.match(/Description: (.*?)(?:\n\n|\n)/s);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';

    // Extract buggy code
    const codeMatch = responseText.match(/Buggy Code:\s*```\s*([\s\S]*?)\s*```/);
    const buggyCode = codeMatch ? codeMatch[1].trim() : '';

    // Extract correct solution
    const solutionMatch = responseText.match(/Correct Solution:\s*```\s*([\s\S]*?)\s*```/);
    const correctSolution = solutionMatch ? solutionMatch[1].trim() : '';

    // Extract wrong options
    const wrongOption1Match = responseText.match(/Wrong Option 1:\s*```\s*([\s\S]*?)\s*```/);
    const wrongOption1 = wrongOption1Match ? wrongOption1Match[1].trim() : '';

    const wrongOption2Match = responseText.match(/Wrong Option 2:\s*```\s*([\s\S]*?)\s*```/);
    const wrongOption2 = wrongOption2Match ? wrongOption2Match[1].trim() : '';

    const wrongOption3Match = responseText.match(/Wrong Option 3:\s*```\s*([\s\S]*?)\s*```/);
    const wrongOption3 = wrongOption3Match ? wrongOption3Match[1].trim() : '';

    // Validate all fields are present
    if (!description || !buggyCode || !correctSolution || !wrongOption1 || !wrongOption2 || !wrongOption3) {
      console.log('Missing required fields in the response');
      return null;
    }

    return {
      description,
      buggyCode,
      correctSolution,
      wrongOption1,
      wrongOption2,
      wrongOption3
    };
  } catch (error) {
    console.error('Error extracting puzzle data:', error);
    return null;
  }
}

// Main function to populate the database
async function populateDailyPuzzles() {
  try {
    await client.connect();
    console.log('Connected to the database');

    // First, check how many puzzles we already have
    const countResult = await client.query('SELECT COUNT(*) FROM public.daily_puzzles');
    const existingCount = parseInt(countResult.rows[0].count);
    console.log(`Found ${existingCount} existing daily puzzles`);

    // Calculate how many more puzzles we need to create
    const puzzlesToCreate = TOTAL_PUZZLES;
    console.log(`Creating ${puzzlesToCreate} new daily puzzles`);

    // Generate and insert the puzzles
    for (let i = 0; i < puzzlesToCreate; i++) {
      console.log(`Generating puzzle ${i+1} of ${puzzlesToCreate}...`);
      
      const puzzleResponse = await generateDailyPuzzle();
      if (!puzzleResponse) {
        console.log('Failed to generate puzzle. Skipping...');
        continue;
      }

      const puzzleData = extractPuzzleData(puzzleResponse);
      if (!puzzleData) {
        console.log('Failed to extract puzzle data. Skipping...');
        continue;
      }

      // Insert the puzzle into the database
      const insertQuery = `
        INSERT INTO public.daily_puzzles 
        (difficulty, description, code, correctsolution, wrongoption1, wrongoption2, wrongoption3, isused)
        VALUES ($1, $2, $3, $4, $5, $6, $7, false)
        RETURNING puzzleid
      `;
      
      const insertValues = [
        DIFFICULTY,
        puzzleData.description,
        puzzleData.buggyCode,
        puzzleData.correctSolution,
        puzzleData.wrongOption1,
        puzzleData.wrongOption2,
        puzzleData.wrongOption3
      ];

      const result = await client.query(insertQuery, insertValues);
      const puzzleId = result.rows[0].puzzleid;
      console.log(`Inserted new daily puzzle with ID: ${puzzleId}`);
      
      // Add a small delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Create initial active daily puzzle if none exists
    const activeResult = await client.query('SELECT COUNT(*) FROM public.active_daily_puzzle WHERE ExpirationDate >= CURRENT_DATE');
    const hasActive = parseInt(activeResult.rows[0].count) > 0;
    
    if (!hasActive) {
      console.log('No active daily puzzle found. Setting up the first one...');
      
      // Get a random puzzle that hasn't been used yet
      const puzzleResult = await client.query(`
        SELECT PuzzleID FROM public.daily_puzzles 
        WHERE IsUsed = false 
        ORDER BY RANDOM() 
        LIMIT 1
      `);
      
      if (puzzleResult.rows.length > 0) {
        const puzzleId = puzzleResult.rows[0].puzzleid;
        
        // Insert as active puzzle
        await client.query(`
          INSERT INTO public.active_daily_puzzle (PuzzleID, ActivationDate, ExpirationDate)
          VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day')
        `, [puzzleId]);
        
        // Mark puzzle as used
        await client.query(`
          UPDATE public.daily_puzzles
          SET IsUsed = true, LastUsedDate = CURRENT_DATE
          WHERE PuzzleID = $1
        `, [puzzleId]);
        
        console.log(`Set puzzle ${puzzleId} as today's daily puzzle`);
      } else {
        console.log('No unused puzzles available');
      }
    } else {
      console.log('An active daily puzzle already exists');
    }

    console.log('Finished populating daily puzzles');
  } catch (error) {
    console.error('Error populating daily puzzles:', error);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

// Run the population script
populateDailyPuzzles().catch(console.error); 