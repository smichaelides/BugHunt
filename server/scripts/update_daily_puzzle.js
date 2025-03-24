require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

// Configure PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateDailyPuzzle() {
  try {
    await client.connect();
    console.log('Connected to the database');

    // Start a transaction
    await client.query('BEGIN');

    // Check if today's puzzle already exists
    const todayCheck = await client.query(`
      SELECT * FROM public.active_daily_puzzle 
      WHERE ActivationDate = CURRENT_DATE
    `);

    if (todayCheck.rows.length > 0) {
      console.log(`Daily puzzle for today (${new Date().toISOString().split('T')[0]}) already exists`);
      await client.query('COMMIT');
      return;
    }

    // Get a random unused puzzle
    const puzzleQuery = await client.query(`
      SELECT PuzzleID FROM public.daily_puzzles 
      WHERE IsUsed = false 
      ORDER BY RANDOM() 
      LIMIT 1
    `);

    if (puzzleQuery.rows.length === 0) {
      console.log('No unused puzzles available. Resetting all puzzles...');
      
      // Reset all puzzles if we've used them all
      await client.query(`
        UPDATE public.daily_puzzles
        SET IsUsed = false, LastUsedDate = NULL
        WHERE IsUsed = true AND LastUsedDate < (CURRENT_DATE - INTERVAL '30 days')
      `);
      
      // Try again to get a puzzle
      const retryQuery = await client.query(`
        SELECT PuzzleID FROM public.daily_puzzles 
        WHERE IsUsed = false 
        ORDER BY RANDOM() 
        LIMIT 1
      `);
      
      if (retryQuery.rows.length === 0) {
        console.log('Still no puzzles available after reset. Manual intervention needed.');
        await client.query('ROLLBACK');
        return;
      }
      
      // Set the new puzzle as active
      const puzzleId = retryQuery.rows[0].puzzleid;
      
      await client.query(`
        INSERT INTO public.active_daily_puzzle (PuzzleID, ActivationDate, ExpirationDate)
        VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day')
      `, [puzzleId]);
      
      await client.query(`
        UPDATE public.daily_puzzles
        SET IsUsed = true, LastUsedDate = CURRENT_DATE
        WHERE PuzzleID = $1
      `, [puzzleId]);
      
      console.log(`Set puzzle ${puzzleId} as today's daily puzzle`);
    } else {
      const puzzleId = puzzleQuery.rows[0].puzzleid;
      
      // Set the new puzzle as active
      await client.query(`
        INSERT INTO public.active_daily_puzzle (PuzzleID, ActivationDate, ExpirationDate)
        VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day')
      `, [puzzleId]);
      
      await client.query(`
        UPDATE public.daily_puzzles
        SET IsUsed = true, LastUsedDate = CURRENT_DATE
        WHERE PuzzleID = $1
      `, [puzzleId]);
      
      console.log(`Set puzzle ${puzzleId} as today's daily puzzle`);
    }

    // Commit the transaction
    await client.query('COMMIT');
    console.log('Daily puzzle updated successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating daily puzzle:', error);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

// Run the update function
updateDailyPuzzle().catch(console.error); 