# Vercel Environment Variables Setup

After deploying to Vercel, you must configure these environment variables in your Vercel project dashboard:

## Required Environment Variables

1. **NEXTAUTH_URL**
   - Set this to your Vercel production domain
   - Format: `https://m-n-data-hub-yb66.vercel.app` (no trailing slash)
   - This tells NextAuth what your app's URL is for auth callbacks

2. **NEXTAUTH_SECRET**
   - Generate a secure random secret (NOT the dev one)
   - Use this command to generate: `openssl rand -base64 32`
   - Or use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Keep this secret and never commit it

3. **DATABASE_URL**
   - Your PostgreSQL connection string (same as local)
   - Format: `postgresql://user:password@host/dbname?sslmode=require`

4. **ADMIN_EMAIL**
   - Set to: `admin@mndata.com`

5. **ADMIN_ACCESS_KEY**
   - Set to: `mn_admin_2026_access` (or whatever you chose)

## How to Set Them on Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable above
4. Click "Save"
5. Redeploy your project

## After Setting Variables

- Redeploy your Vercel project (go to Deployments → click the latest → click "Redeploy")
- Clear your browser cache/cookies
- Try logging in again with:
  - Email: `admin@mndata.com`
  - Password: (the one set in your database)

## Note

The `.env` file in your repository is for local development only. Vercel uses its own environment variable configuration, which overrides the `.env` file during deployment.
