require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

// Configure PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function debugDailyPuzzle() {
  try {
    await client.connect();
    console.log('Connected to the database');

    // Get the current date
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];
    console.log(`Current date for debugging: ${today}`);

    // Check active_daily_puzzle table
    console.log('\nChecking active_daily_puzzle table:');
    const activeQuery = await client.query(`
      SELECT * FROM public.active_daily_puzzle 
      ORDER BY ActivationDate DESC
    `);
    
    if (activeQuery.rows.length === 0) {
      console.log('No active puzzles found in the database');
    } else {
      console.log(`Found ${activeQuery.rows.length} active puzzle records:`);
      activeQuery.rows.forEach(row => {
        console.log(`ID: ${row.id}, PuzzleID: ${row.puzzleid}, Activation: ${row.activationdate}, Expiration: ${row.expirationdate}`);
      });
    }
    
    // Check for today's active puzzle
    console.log('\nChecking for today\'s active puzzle:');
    const todayQuery = await client.query(`
      SELECT * FROM public.active_daily_puzzle 
      WHERE CURRENT_DATE >= ActivationDate::date 
      AND CURRENT_DATE < ExpirationDate::date
    `);
    
    if (todayQuery.rows.length === 0) {
      console.log('No active puzzle for TODAY specifically');
    } else {
      console.log(`Found ${todayQuery.rows.length} active puzzle(s) for today:`);
      todayQuery.rows.forEach(row => {
        console.log(`ID: ${row.id}, PuzzleID: ${row.puzzleid}, Activation: ${row.activationdate}, Expiration: ${row.expirationdate}`);
      });
    }
    
    // Check daily_puzzles table
    console.log('\nChecking daily_puzzles table:');
    const puzzlesQuery = await client.query(`
      SELECT PuzzleID, IsUsed, LastUsedDate FROM public.daily_puzzles
    `);
    
    if (puzzlesQuery.rows.length === 0) {
      console.log('No puzzles found in the daily_puzzles table');
    } else {
      console.log(`Found ${puzzlesQuery.rows.length} puzzles in total:`);
      const usedCount = puzzlesQuery.rows.filter(row => row.isused).length;
      const unusedCount = puzzlesQuery.rows.length - usedCount;
      console.log(`Used: ${usedCount}, Unused: ${unusedCount}`);
      
      if (unusedCount === 0) {
        console.log('WARNING: All puzzles are marked as used!');
      }
    }

  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    await client.end();
    console.log('\nDisconnected from the database');
  }
}

// Run the debug function
debugDailyPuzzle().catch(console.error); 