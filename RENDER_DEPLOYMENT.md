# Deploying BugHunt to Render

This guide explains how to deploy the BugHunt application to Render.com.

## Prerequisites

- A Render.com account
- Git repository with your code
- Neon PostgreSQL database (already configured in .env)

## Deployment Options

You have two options for deploying to Render:

### Option 1: Using the render.yaml file (Blueprint)

1. Fork or clone this repository to your own GitHub account
2. Connect your GitHub account to Render
3. Click "New Blueprint" in Render dashboard
4. Select your repository
5. Render will automatically detect the `render.yaml` file and set up both services
6. For each service, you'll need to configure environment variables or set up credentials as described below

### Option 2: Manual Setup

If you prefer to set up each service individually:

## Backend Service (API)

1. In Render dashboard, click "New" > "Web Service"
2. Connect your repository
3. Configure the following settings:
   - Name: `bughunt-api` (or your preferred name)
   - Root Directory: (leave empty)
   - Environment: Node
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   
4. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `DB_USER`: [Your Neon DB user]
   - `DB_HOST`: [Your Neon DB host]
   - `DB_NAME`: [Your Neon DB name]
   - `DB_PASSWORD`: [Your Neon DB password]
   - `DB_PORT`: `5432`
   - `DB_SSL`: `true`
   - `DATABASE_URL`: [Your full Neon DB URL]
   - `PORT`: `5001`
   - `OPENAI_API_KEY`: [Your OpenAI API key]

5. Click "Create Web Service"

## Frontend Service

1. In Render dashboard, click "New" > "Static Site"
2. Connect your repository
3. Configure the following settings:
   - Name: `bughunt` (or your preferred name)
   - Root Directory: (leave empty)
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/build`

4. Add the following environment variables:
   - `REACT_APP_API_URL`: The URL of your deployed API service (e.g., `https://bughunt-api.onrender.com`)
   - `REACT_APP_AUTH0_DOMAIN`: `dev-6jjadkywt5r7vivx.us.auth0.com`
   - `REACT_APP_AUTH0_CLIENT_ID`: `obHs9V2fQXchiUGXZhrjNRVGTVnOjtdS`
   - `REACT_APP_AUTH0_CALLBACK_URL`: The URL of your deployed frontend with `/callback` (e.g., `https://bughunt.onrender.com/callback`)

5. Under "Redirects/Rewrites", add a new rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

6. Click "Create Static Site"

## Auth0 Configuration

After deployment, make sure to update your Auth0 application settings:

1. Log in to your Auth0 dashboard
2. Navigate to Applications > Applications
3. Select your application
4. Update the following fields:
   - Allowed Callback URLs: Add your production URL (e.g., `https://bughunt.onrender.com/callback`)
   - Allowed Web Origins: Add your production URL (e.g., `https://bughunt.onrender.com`)
   - Allowed Logout URLs: Add your production URL (e.g., `https://bughunt.onrender.com`)

5. Save changes

## Verifying Deployment

1. Once both services are deployed, visit your frontend URL
2. You should see the BugHunt application and be able to log in
3. Test the API connection by navigating to the leaderboard or levels page

## Troubleshooting

- If you see CORS errors, check that your API's CORS configuration includes your frontend domain
- If authentication fails, verify your Auth0 configuration
- For database connection issues, check the API service logs in Render dashboard 