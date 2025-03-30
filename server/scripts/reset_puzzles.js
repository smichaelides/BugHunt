require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

// Configure PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function resetPuzzles() {
  try {
    await client.connect();
    console.log('Connected to the database');

    // Reset all puzzles to unused status
    const resetQuery = await client.query(`
      UPDATE public.daily_puzzles
      SET IsUsed = false, LastUsedDate = NULL
    `);
    
    console.log(`Reset ${resetQuery.rowCount} puzzles to unused status`);

  } catch (error) {
    console.error('Error resetting puzzles:', error);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

// Run the reset function
resetPuzzles().catch(console.error); 