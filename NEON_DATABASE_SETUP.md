# Neon Database Connection Instructions

We've migrated our database to Neon, a cloud PostgreSQL service. Follow these steps to connect to our shared database:

## Connection Information

Use the following connection string to connect to our Neon database:

```
postgresql://neondb_owner:npg_j0NZc7wLfWzk@ep-still-resonance-a5g96qo7-pooler.us-east-2.aws.neon.tech/neonBugHunt?sslmode=require
```

## Updating Your Application

1. Update your `.env` file with the following values:

```
DB_USER=neondb_owner
DB_PASSWORD=npg_j0NZc7wLfWzk
DB_HOST=ep-still-resonance-a5g96qo7-pooler.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=neonBugHunt
DB_SSL=true
```

2. Modify your `server.js` file to include SSL configuration:

```javascript
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // For development purposes
  }
});
```

## Testing the Connection

You can test the connection with this command:

```bash
psql 'postgresql://neondb_owner:npg_j0NZc7wLfWzk@ep-still-resonance-a5g96qo7-pooler.us-east-2.aws.neon.tech/neonBugHunt?sslmode=require'
```

If successful, you'll be connected to the Neon PostgreSQL console.

## Benefits of Using Neon

- Shared database: Both partners can access the same data
- Cloud-hosted: No need to set up a local PostgreSQL server
- Always on: Database is available 24/7
- Automatic backups: Your data is safe

## Security Note

Keep this connection string private and don't commit it to public repositories. We've included it directly in this document for convenience, but in a production environment, you would use environment variables or secrets management. 