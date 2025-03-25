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

    // Get the current date
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];
    console.log(`Running update for today: ${today}`);

    // Start a transaction
    await client.query('BEGIN');

    // Check if today's puzzle already exists and is valid
    const todayCheck = await client.query(`
      SELECT * FROM public.active_daily_puzzle 
      WHERE ActivationDate::date <= CURRENT_DATE
      AND ExpirationDate::date > CURRENT_DATE
    `);

    if (todayCheck.rows.length > 0) {
      console.log(`Daily puzzle for today (${today}) already exists: Puzzle ID ${todayCheck.rows[0].puzzleid}`);
      await client.query('COMMIT');
      return;
    }

    // There's no puzzle for today, so let's deactivate any old puzzles first
    console.log('No active puzzle for today, checking for any expired puzzles to clean up');
    
    // Expire any active puzzles that should be over
    await client.query(`
      UPDATE public.active_daily_puzzle
      SET ExpirationDate = LEAST(ExpirationDate, CURRENT_DATE)
      WHERE ExpirationDate::date > CURRENT_DATE
      AND ActivationDate::date < CURRENT_DATE
    `);

    // Get a random unused puzzle
    const puzzleQuery = await client.query(`
      SELECT PuzzleID FROM public.daily_puzzles 
      WHERE IsUsed = false 
      ORDER BY RANDOM() 
      LIMIT 1
    `);

    if (puzzleQuery.rows.length === 0) {
      console.log('No unused puzzles available. Resetting puzzles older than 30 days...');
      
      // Reset puzzles that haven't been used recently
      await client.query(`
        UPDATE public.daily_puzzles
        SET IsUsed = false, LastUsedDate = NULL
        WHERE IsUsed = true 
        AND (LastUsedDate IS NULL OR LastUsedDate < (CURRENT_DATE - INTERVAL '30 days'))
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
      console.log(`Selected puzzle ${puzzleId} after resetting old puzzles`);
      
      // Calculate tomorrow's date for expiration
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(currentDate.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
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
    console.log('Daily puzzle updated successfully');
  } catch (error) {
    await client.query('ROLLBACK').catch(console.error);
    console.error('Error updating daily puzzle:', error);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

// Run the update function
updateDailyPuzzle().catch(console.error); 