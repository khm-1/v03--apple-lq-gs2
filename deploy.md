# Manual Deployment Guide for Vercel

This guide covers manually deploying your React + Express.js portfolio application to Vercel.

## Project Overview

- **Frontend**: React 18 with TypeScript, Vite build tool
- **Backend**: Express.js with TypeScript (Node.js)
- **Database**: PostgreSQL (requires external provider like Neon)
- **Build Output**: Static frontend + serverless backend functions

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```
3. **Database**: Set up PostgreSQL database (recommended: [Neon](https://neon.tech))
4. **Environment Variables**: Prepare your production environment variables

## Step 1: Prepare Your Project

### 1.1 Create Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/index.html",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    },
    {
      "src": "server/index.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["shared/**"]
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/index.html"
    }
  ],
  "functions": {
    "server/index.ts": {
      "maxDuration": 30
    }
  }
}
```

### 1.2 Update Package.json Scripts

Add Vercel-specific build script to your `package.json`:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "build:vercel": "vite build",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

### 1.3 Create API Directory Structure

Vercel expects API routes in an `api` directory. Create the following structure:

```
api/
├── portfolio/
│   └── [userId].ts
├── stocks.ts
└── transactions/
    └── [userId].ts
```

## Step 2: Set Up Database

### 2.1 Create Production Database

1. **Neon Database** (Recommended):
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Alternative Options**:
   - Supabase PostgreSQL
   - PlanetScale (MySQL)
   - Railway PostgreSQL

### 2.2 Run Database Migrations

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Push schema to production database
npm run db:push
```

## Step 3: Configure Environment Variables

### 3.1 Required Environment Variables

Create a `.env.production` file (don't commit this):

```env
# Database
DATABASE_URL=your-production-database-connection-string

# Node Environment
NODE_ENV=production

# Optional: Session secrets, API keys, etc.
SESSION_SECRET=your-session-secret
```

### 3.2 Set Vercel Environment Variables

Using Vercel CLI:
```bash
vercel env add DATABASE_URL
vercel env add NODE_ENV
vercel env add SESSION_SECRET
```

Or via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development

## Step 4: Deploy to Vercel

### 4.1 Login to Vercel

```bash
vercel login
```

### 4.2 Initialize Project

In your project directory:
```bash
vercel
```

Follow the prompts:
- Link to existing project or create new one
- Set up project settings
- Choose deployment settings

### 4.3 Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Step 5: Verify Deployment

### 5.1 Check Build Logs

Monitor the deployment in:
- Vercel CLI output
- Vercel Dashboard > Deployments
- Check for any build errors

### 5.2 Test Application

1. **Frontend**: Visit your Vercel URL
2. **API Endpoints**: Test API routes
   - `https://your-app.vercel.app/api/portfolio/1`
   - `https://your-app.vercel.app/api/stocks`
   - `https://your-app.vercel.app/api/transactions/1`

### 5.3 Database Connection

Verify database connectivity:
- Check API responses
- Monitor database logs
- Test CRUD operations

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain

In Vercel Dashboard:
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 6.2 SSL Certificate

Vercel automatically provides SSL certificates for custom domains.

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check TypeScript errors: `npm run check`
   - Verify all dependencies are installed
   - Check build logs in Vercel dashboard

2. **Database Connection Issues**:
   - Verify DATABASE_URL is correctly set
   - Check database provider firewall settings
   - Ensure database is accessible from Vercel's IP ranges

3. **API Route Issues**:
   - Verify API routes are in correct directory structure
   - Check serverless function logs
   - Ensure proper export format for Vercel functions

4. **Static Asset Issues**:
   - Check build output directory (`dist/public`)
   - Verify Vite build configuration
   - Check asset paths in production

### Debug Commands

```bash
# Check build locally
npm run build:vercel

# Test production build locally
npx serve dist/public

# Check TypeScript
npm run check

# Verify database connection
npm run db:push
```

## Production Considerations

### Performance
- Enable Vercel Analytics
- Configure caching headers
- Optimize bundle size
- Use Vercel Edge Functions for better performance

### Monitoring
- Set up Vercel monitoring
- Configure error tracking (Sentry, etc.)
- Monitor database performance
- Set up uptime monitoring

### Security
- Review environment variables
- Enable CORS properly
- Secure database connections
- Use HTTPS only

## Maintenance

### Updates
```bash
# Update dependencies
npm update

# Redeploy
vercel --prod
```

### Database Migrations
```bash
# For schema changes
npm run db:push
```

### Rollbacks
Use Vercel Dashboard to rollback to previous deployments if needed.

---

## Quick Reference

**Deploy Commands:**
```bash
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel env ls            # List environment variables
vercel logs              # View deployment logs
```

**Useful Links:**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Node.js on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
