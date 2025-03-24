# Setup Instructions for Partner

Hi there! We've moved our database to Neon, a cloud PostgreSQL service, so we can both work with the same data. Follow these steps to get set up:

## 1. Pull the Latest Code

First, make sure you have the latest code:

```bash
git pull origin main
```

## 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following content:

```
# PostgreSQL Database Configuration
DB_USER=neondb_owner
DB_HOST=ep-still-resonance-a5g96qo7-pooler.us-east-2.aws.neon.tech
DB_NAME=neonBugHunt
DB_PASSWORD=npg_j0NZc7wLfWzk
DB_PORT=5432
DB_SSL=true

# Server Configuration
PORT=5001
```

This will connect to our shared cloud database.

## 3. Install Dependencies

Make sure you have all dependencies installed:

```bash
npm install
cd client && npm install
```

## 4. Start the Application

Start the server:
```bash
node server/server.js
```

In a separate terminal, start the React client:
```bash
cd client
npm start
```

## 5. What Changed?

Here's what's different now:

1. **Shared Database**: We're using a Neon cloud PostgreSQL database that we can both access
2. **No Local Setup**: You don't need to set up PostgreSQL locally anymore
3. **Real-time Collaboration**: Any changes you make to the database will be visible to me and vice versa

## 6. Testing the Connection

You can test the database connection with:

```bash
psql 'postgresql://neondb_owner:npg_j0NZc7wLfWzk@ep-still-resonance-a5g96qo7-pooler.us-east-2.aws.neon.tech/neonBugHunt?sslmode=require'
```

Once connected, try:
```sql
SELECT * FROM public.users;
SELECT * FROM public.problems;
```

## 7. Important Notes

- Always use `public.` prefix when writing SQL queries (e.g., `SELECT * FROM public.users`)
- The database includes streak tracking functionality
- Any database schema changes should be discussed together

Let me know if you encounter any issues! 