require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

// Configure PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixDailyPuzzle() {
  try {
    await client.connect();
    console.log('Connected to the database');

    // Get the current date
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];
    
    // Calculate tomorrow's date
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`Setting up puzzle for today (${today}) until tomorrow (${tomorrowStr})`);

    // First, clean up any existing active puzzles
    await client.query(`
      DELETE FROM public.active_daily_puzzle 
      WHERE ActivationDate::date <= CURRENT_DATE
    `);
    console.log('Cleaned up existing active puzzles');

    // Get a random puzzle
    const puzzleQuery = await client.query(`
      SELECT PuzzleID FROM public.daily_puzzles 
      ORDER BY RANDOM() 
      LIMIT 1
    `);

    if (puzzleQuery.rows.length === 0) {
      console.log('No puzzles available in the database');
      return;
    }
    
    const puzzleId = puzzleQuery.rows[0].puzzleid;
    console.log(`Selected puzzle ID: ${puzzleId}`);
    
    // Set the puzzle as active with proper dates
    await client.query(`
      INSERT INTO public.active_daily_puzzle (PuzzleID, ActivationDate, ExpirationDate)
      VALUES ($1, $2, $3)
    `, [puzzleId, today, tomorrowStr]);
    
    console.log(`Successfully set puzzle ${puzzleId} as active for today`);

  } catch (error) {
    console.error('Error fixing daily puzzle:', error);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

// Run the fix function
fixDailyPuzzle().catch(console.error); 