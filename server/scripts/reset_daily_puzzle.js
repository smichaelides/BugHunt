require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

// Configure PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function resetDailyPuzzle() {
  try {
    await client.connect();
    console.log('Connected to the database');

    // Get the current date
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];
    console.log(`Running reset for today: ${today}`);

    // Start a transaction
    await client.query('BEGIN');

    // 1. Clear all active daily puzzles
    console.log('Truncating active_daily_puzzle table...');
    await client.query('TRUNCATE TABLE public.active_daily_puzzle CASCADE');
    
    // 2. Clear completed puzzles for today
    console.log('Removing completion records for today...');
    await client.query(`
      DELETE FROM public.daily_puzzle_completions 
      WHERE CompletionDate::date = CURRENT_DATE
    `);
    
    // 3. Get a random unused puzzle
    const puzzleQuery = await client.query(`
      SELECT PuzzleID FROM public.daily_puzzles 
      WHERE IsUsed = false OR (LastUsedDate IS NOT NULL AND LastUsedDate < CURRENT_DATE - INTERVAL '14 days')
      ORDER BY RANDOM() 
      LIMIT 1
    `);

    if (puzzleQuery.rows.length === 0) {
      console.log('No suitable puzzles available. Resetting all puzzles...');
      
      // Reset all puzzles
      await client.query(`
        UPDATE public.daily_puzzles
        SET IsUsed = false, LastUsedDate = NULL
      `);
      
      // Try again to get a puzzle
      const retryQuery = await client.query(`
        SELECT PuzzleID FROM public.daily_puzzles 
        ORDER BY RANDOM() 
        LIMIT 1
      `);
      
      if (retryQuery.rows.length === 0) {
        console.log('No puzzles available at all. Manual intervention needed.');
        await client.query('ROLLBACK');
        return;
      }
      
      const puzzleId = retryQuery.rows[0].puzzleid;
      console.log(`Selected puzzle ${puzzleId} after full reset`);
      
      // Calculate tomorrow's date for expiration
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(currentDate.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Set the new puzzle as active
      await client.query(`
        INSERT INTO public.active_daily_puzzle (PuzzleID, ActivationDate, ExpirationDate)
        VALUES ($1, $2, $3)
      `, [puzzleId, today, tomorrowStr]);
      
      await client.query(`
        UPDATE public.daily_puzzles
        SET IsUsed = true, LastUsedDate = $2
        WHERE PuzzleID = $1
      `, [puzzleId, today]);
      
      console.log(`Set puzzle ${puzzleId} as today's daily puzzle (${today} to ${tomorrowStr})`);
    } else {
      const puzzleId = puzzleQuery.rows[0].puzzleid;
      console.log(`Selected new puzzle: ${puzzleId}`);
      
      // Calculate tomorrow's date for expiration
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(currentDate.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Set the new puzzle as active
      await client.query(`
        INSERT INTO public.active_daily_puzzle (PuzzleID, ActivationDate, ExpirationDate)
        VALUES ($1, $2, $3)
      `, [puzzleId, today, tomorrowStr]);
      
      await client.query(`
        UPDATE public.daily_puzzles
        SET IsUsed = true, LastUsedDate = $2
        WHERE PuzzleID = $1
      `, [puzzleId, today]);
      
      console.log(`Set puzzle ${puzzleId} as today's daily puzzle (${today} to ${tomorrowStr})`);
    }

    // Commit the transaction
    await client.query('COMMIT');
    console.log('Daily puzzle reset and updated successfully');
  } catch (error) {
    await client.query('ROLLBACK').catch(console.error);
    console.error('Error resetting daily puzzle:', error);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

// Run the reset function
resetDailyPuzzle().catch(console.error); 