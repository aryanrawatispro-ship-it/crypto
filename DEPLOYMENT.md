# TradeGPT Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)
**Perfect for**: Beginners, quick deployment, all-in-one solution

**Pros**:
- Auto-detects tech stack
- Built-in PostgreSQL & Redis
- WebSocket support
- Free $5/month credit
- One-click deploy

**Steps**:
1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your `crypto` repository
4. Railway auto-creates services:
   - PostgreSQL database
   - Redis cache
   - Backend service
   - Frontend service
5. Add environment variables (see below)
6. Click "Deploy"

**Cost**: Free tier → ~$5-15/month

---

### Option 2: Vercel + Render (Recommended - Best Performance)
**Perfect for**: Production apps, better performance

**Frontend on Vercel**:
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. **Settings**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Framework: Vite
4. Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. Deploy

**Backend on Render**:
1. Go to [render.com](https://render.com)
2. New → Web Service → Connect GitHub
3. **Settings**:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`
   - Environment: Node
4. Add PostgreSQL database (same dashboard)
5. Add Redis (Upstash or Render addon)
6. Environment Variables (see below)
7. Deploy

**Cost**: Vercel free + Render $7/month + Redis free = **$7/month**

---

### Option 3: Fly.io (Recommended - Developer-Friendly)
**Perfect for**: Developers comfortable with CLI

**Steps**:
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy backend
cd backend
fly launch --name tradegpt-backend
fly postgres create --name tradegpt-db
fly postgres attach tradegpt-db
fly redis create --name tradegpt-redis
fly secrets set GLM_API_KEY="your-key"
fly deploy

# Deploy frontend
cd ../frontend
fly launch --name tradegpt-frontend
fly secrets set VITE_API_URL="https://tradegpt-backend.fly.dev"
fly deploy
```

**Cost**: ~$5-10/month

---

## Environment Variables

### Backend (.env for production)
```env
# Server
PORT=3001
NODE_ENV=production

# Database (auto-filled by Railway/Render)
DATABASE_URL=postgresql://user:pass@host:5432/tradegpt

# Redis (auto-filled by Railway/Render)
REDIS_URL=redis://host:6379

# API Keys (YOU MUST ADD THESE)
GLM_API_KEY=your-glm-4.6-api-key-here
COINGECKO_API_KEY=your-coingecko-key (optional)
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key (optional)

# CORS (set to your frontend URL)
CORS_ORIGIN=https://tradegpt.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

### Frontend
```env
VITE_API_URL=https://tradegpt-backend.onrender.com
```

---

## Database Setup (After Deployment)

### On Railway/Render:
Databases are auto-created. Just run migrations:

```bash
# In Railway/Render terminal or locally
cd backend
npx prisma migrate deploy
npx prisma generate
```

### On Fly.io:
```bash
fly postgres connect -a tradegpt-db
# Then run SQL migrations manually or use Prisma
```

---

## Getting API Keys

### 1. GLM-4.6 API Key (REQUIRED)
**Option A - Zhipu AI (Official)**:
- Go to [https://open.bigmodel.cn/](https://open.bigmodel.cn/)
- Sign up (Chinese site, use Google Translate)
- Create API key
- Free tier available

**Option B - OpenAI GPT-4 (Alternative)**:
- Go to [https://platform.openai.com/](https://platform.openai.com/)
- Create API key
- Modify `backend/src/services/glmAI.ts`:
  ```typescript
  // Change GLM endpoint to OpenAI
  const GLM_API_URL = 'https://api.openai.com/v1/chat/completions';
  // Change model to gpt-4
  model: 'gpt-4'
  ```

### 2. CoinGecko API (Optional)
- Go to [https://www.coingecko.com/en/api](https://www.coingecko.com/en/api)
- Free tier: 10-50 calls/minute (usually enough)
- Pro tier: $129/month (not needed for MVP)

### 3. Alpha Vantage (Optional)
- Go to [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
- Free tier: 5 calls/minute, 500/day
- Premium: $49/month

---

## Pre-Deployment Checklist

- [ ] Get GLM-4.6 API key (or OpenAI key)
- [ ] Sign up for deployment platform (Railway/Vercel/Render)
- [ ] Update CORS_ORIGIN to your frontend URL
- [ ] Test backend locally: `cd backend && npm run dev`
- [ ] Test frontend locally: `cd frontend && npm run dev`
- [ ] Build frontend successfully: `cd frontend && npm run build`
- [ ] Build backend successfully: `cd backend && npm run build`
- [ ] Verify .env.example is committed (but NOT .env)
- [ ] Push latest changes to GitHub

---

## Post-Deployment

### Test Your Deployment

1. **Backend Health Check**:
   ```bash
   curl https://your-backend-url.com/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Frontend**:
   - Open your frontend URL
   - Check browser console for errors
   - Try sending a chat message

3. **WebSocket**:
   - Watch price ticker - should update every 30-60s
   - Open browser DevTools → Network → WS to see WebSocket connection

### Common Issues

**CORS Error**:
- Update `CORS_ORIGIN` in backend .env to match frontend URL
- Redeploy backend

**Database Connection Error**:
- Check `DATABASE_URL` is set correctly
- Run `npx prisma migrate deploy`
- Check PostgreSQL service is running

**Redis Connection Error**:
- Check `REDIS_URL` is set correctly
- Verify Redis service is running
- Optional: Remove Redis dependency for testing

**AI Not Responding**:
- Verify `GLM_API_KEY` is set correctly
- Check API quota/billing
- Test API key with curl:
  ```bash
  curl https://open.bigmodel.cn/api/paas/v4/chat/completions \
    -H "Authorization: Bearer your-key" \
    -H "Content-Type: application/json" \
    -d '{"model":"glm-4","messages":[{"role":"user","content":"hello"}]}'
  ```

---

## Cost Breakdown

### Free Tier (For Testing):
- **Frontend**: Vercel (Free forever)
- **Backend**: Render free tier (sleeps after 15min)
- **Database**: Neon (Free 0.5GB)
- **Redis**: Upstash (Free 10k commands/day)
- **Total**: $0/month ✅

### Production (Recommended):
- **Frontend**: Vercel (Free)
- **Backend**: Render ($7/month)
- **Database**: Render Postgres ($7/month) or Neon (Free)
- **Redis**: Upstash (Free tier) or Render ($3/month)
- **Total**: $7-17/month 💰

### All-in-One:
- **Railway**: Everything included
- **Total**: ~$10-20/month (pay-as-you-go)

---

## Monitoring & Logs

### Railway:
- Built-in logs dashboard
- Metrics included
- Auto-scaling available

### Render:
- View logs: Dashboard → Service → Logs
- Metrics included
- Auto-deploy on GitHub push

### Vercel:
- Analytics dashboard
- Real-time logs
- Auto-deploy on GitHub push

---

## Scaling Tips

**When traffic grows**:

1. **Enable Caching**: Already implemented with Redis
2. **CDN**: Vercel includes free CDN for frontend
3. **Database Pooling**: Use connection pooling in Prisma
4. **Rate Limiting**: Already implemented (10 req/min)
5. **Horizontal Scaling**:
   - Railway: Auto-scales
   - Render: Upgrade to Standard plan
6. **Load Balancing**: Most platforms handle automatically

---

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Fly.io Docs**: [fly.io/docs](https://fly.io/docs)

---

## Quick Deploy Commands

### Railway CLI:
```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs
```

### Render (Git-based):
- Just push to GitHub
- Auto-deploys on push to main branch

### Vercel CLI:
```bash
# Install
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Production deploy
vercel --prod
```

---

**🎉 You're ready to deploy TradeGPT!**

Choose your platform and follow the steps above. Railway is recommended for beginners.
