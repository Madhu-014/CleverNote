# CleverNote AI PDF Note Taker

Premium AI-powered PDF workspace built with Next.js (App Router), Clerk auth, Convex backend, and Gemini.

## 🎯 Features

- **AI-Powered Analysis**: Ask questions about your PDFs with intelligent AI responses
- **Vector Search**: Fast semantic search through documents using embeddings
- **Rich Text Editor**: TipTap-based editor with AI suggestions
- **PDF Management**: Upload and organize multiple PDFs
- **Real-time Sync**: Live updates with Convex database
- **Premium Animations**: Smooth transitions and professional UI effects
- **Rate Limiting**: Built-in protection against abuse (Vercel KV supported)

## 📋 Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS 4, TipTap
- **Backend**: Convex (serverless DB + actions), Node.js
- **Authentication**: Clerk
- **AI Services**:
  - Groq (chat completions)
  - Google Generative AI (embeddings)
- **Vector Search**: Convex vector index with LangChain
- **Storage**: Convex file storage
- **Deployment**: Vercel

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer (Next.js)                    │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  │  Workspace  │  Editor  │  AIAssistant  │  Auth     │
│  (Upload)   │  (File Mgmt)│(TipTap)  │ (Search/Chat)│ (Clerk)   │
└────────────────┬──────────────┬──────────────┬──────────────────┘
                 │              │              │
                 ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js Routes)                    │
├─────────────────────────────────────────────────────────────────┤
│  /api/pdf-loader    │  /api/ai-chat    │  Middleware (Auth)    │
│  (PDF Extraction)   │  (Chat/Search)   │  (Protected Routes)   │
└────────────────┬──────────────┬──────────────┬──────────────────┘
                 │              │              │
          ┌──────┴──────┐       │       ┌──────┴───────┐
          ↓             ↓       ↓       ↓              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    Backend Layer (Convex)                        │
├──────────────────────────────────────────────────────────────────┤
│  Database     │  File Storage │  Vector Index │  Actions         │
│  (Schema)     │  (PDF files)  │  (Embeddings) │  (RAG Pipeline)  │
│  • users      │  • Uploads    │  • Chunks     │  • Search        │
│  • files      │               │  • Vectors    │  • Embed         │
│  • notes      │               │               │  • Chat resp.    │
└────────┬──────────┬──────────────┬───────────────┬────────────────┘
         │          │              │               │
         ↓          ↓              ↓               ↓
    ┌─────────────────────────────────────────────────────┐
    │         External AI & LLM Services                   │
    ├─────────────────────────────────────────────────────┤
    │  Google Generative AI │  Groq  │  LangChain      │
    │  (Embeddings)         │ (Chat) │ (Text Splitting)│
    └─────────────────────────────────────────────────────┘

Data Flow:
1. User uploads PDF → Convex storage
2. PDF-loader route extracts & chunks PDF
3. Chunks embedded via Google Generative AI → Vector index
4. User query → LangChain retrieval (3-stage: lexical → vector → overview)
5. Retrieved context + query → Groq → AI response
6. Response stored in notes → Database
```

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
# Fill in all required API keys
```

### 3. Start Convex Dev Environment
```bash
npx convex dev
```

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000 and sign in with Clerk.

## 🌐 Production Deployment

CleverNote is designed to deploy on Vercel with a Convex backend. Follow these steps:

### Step 1: Prepare Your Repository
```bash
# Push code to GitHub
git add .
git commit -m "Ready for production"
git push origin main
```

### Step 2: Set Up Convex Production
```bash
# Login to Convex
npx convex auth

# Create production deployment
npx convex prod:create

# Deploy your backend
npx convex deploy
```

### Step 3: Deploy Frontend on Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select "Next.js" as framework
5. Skip environment variables for now

### Step 4: Configure Environment Variables
On Vercel Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CONVEX_URL=https://[your-deployment].convex.cloud
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-120b
```

### Step 5: Configure Clerk URLs
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your production app
3. Settings → URLs
4. Add your Vercel domain:
   - Allowed Redirect URIs: `https://YOUR_DOMAIN/`
   - Allowed Sign Out URLs: `https://YOUR_DOMAIN/`
   - API URL: `https://YOUR_DOMAIN`

### Step 6: Deploy
```bash
# Vercel auto-deploys when you push to main
git push origin main

# Or manually redeploy from Vercel dashboard
```

### Step 7: Verify Deployment
- Visit your Vercel URL
- Test sign up and sign in
- Upload a PDF and test AI features
- Check Convex dashboard for database activity

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find Convex" | Ensure `NEXT_PUBLIC_CONVEX_URL` is set in Vercel env vars |
| 401 Unauthorized | Check Clerk keys match your production app |
| PDF upload fails | Verify Convex storage quota and API limits |
| AI responses empty | Check GEMINI_API_KEY and GROQ_API_KEY are valid |
| Slow cold starts | This is normal on Vercel free tier; upgrade to Pro for better performance |

### Optional: Custom Domain
1. On Vercel: Settings → Domains
2. Add your custom domain
3. Configure DNS CNAME record to Vercel
4. Update Clerk allowed URLs to match your domain
5. SSL auto-provisioned by Vercel

## 🔑 Environment Variables

See `.env.example` for complete list. Required in production:

```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Database & Vector Search
NEXT_PUBLIC_CONVEX_URL=https://....convex.cloud
GEMINI_API_KEY=AIzaSy...

# AI Services  
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-120b

# Optional: Production Rate Limiting
VERCEL_KV_URL=...
VERCEL_KV_REST_API_TOKEN=...
```

**Security**: Never commit these to Git. Use Vercel Project Settings for production.

## 📊 Architecture

```
┌─────────────┐
│   Browser   │ (React, Auth UI)
└──────┬──────┘
       │
┌──────▼──────────────┐
│  Next.js (Vercel)   │
├─────────────────────┤
│ · API Routes        │ → Groq API (Chat)
│ · Page Rendering    │
│ · Auth Middleware   │
└──────┬──────────────┘
       │
┌──────▼──────────────┐   ┌──────────────────┐
│   Convex Cloud      │   │ Google Generative│
├─────────────────────┤   │ AI (Embeddings)  │
│ · Database          │   └──────────────────┘
│ · Vector Index      │
│ · File Storage      │
│ · Actions/Logic     │
└─────────────────────┘
```

## 🔒 Security Features

- ✅ Rate limiting (30 req/min)
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Convex parameterization)
- ✅ CORS headers configured
- ✅ Secret key management (never in code)
- ✅ Timeout protection on API calls
- ✅ Authorization checks
- ✅ Audit logging (Convex)

## 📈 Performance

- **Build Size**: ~200KB (with optimizations)
- **Time to First Byte**: <200ms (Vercel Edge)
- **API Response Time**: <2s (with rate limiting)
- **PDF Processing**: ~5-30s (depends on size)
- **AI Response**: ~2-5s (Groq API)

## 🧪 Testing

```bash
# Linting
npm run lint

# Production build (validates everything)
npm run build

# Run locally
npm run dev

# Test API endpoints
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is AI?"}'
```

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### "Cannot find Convex" Error
```bash
# Start Convex dev server
npx convex dev
```

### Slow PDF Upload
- Check file size < 50MB
- Verify Convex deployment is active
- Check network connection

### Rate Limiting Issues
- Use Vercel KV for distributed rate limiting
- Production: Set `VERCEL_KV_*` env vars
- Reset: Redeploy or wait 60 seconds

## 📚 Key Files

| File | Purpose |
|------|---------|
| `app/api/ai-chat/route.js` | Groq AI chat endpoint |
| `app/api/pdf-loader/route.js` | PDF processing & chunking |
| `convex/myAction.js` | Vector search & RAG pipeline |
| `convex/schema.js` | Database schema (indexed) |
| `app/globals.css` | Premium animations & styles |
| `vercel.json` | Vercel production config |
| `next.config.mjs` | Next.js optimizations |

## 🔗 External Services

| Service | Status | Cost | Link |
|---------|--------|------|------|
| Clerk | Required | Free-$25/mo | https://clerk.com |
| Convex | Required | Free-$40+/mo | https://convex.dev |
| Groq | Required | Free | https://groq.com |
| Google AI | Required | Free | https://ai.google.dev |
| Vercel | Recommended | Free-$20/mo | https://vercel.com |

## 📖 Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)
- [Groq Docs](https://console.groq.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

## 📝 Notes

- **Vector Search**: Uses Gemini embeddings. Requires valid API key in Convex environment.
- **AI Responses**: Hybrid mode - uses document context when relevance > 0.2, otherwise pure AI generation
- **Rate Limiting**: Distributed with Vercel KV (prod) or in-memory (dev). 30 req/min per client.
- **Backups**: Convex auto-backups daily. Manually export from dashboard.
- **Custom Domain**: Configure CNAME to Vercel edge. Free SSL included.

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Test: `npm run build && npm run dev`
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature/my-feature`
6. Create Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🎓 Learning Resources

New to the tech stack? Start here:
- [Next.js Tutorial](https://nextjs.org/learn)
- [React Hooks](https://react.dev/reference/react)
- [Convex Model](https://docs.convex.dev/getting-started/codegen)
- [Clerk Auth](https://clerk.com/docs/authentication/overview)

---

**Latest Update**: March 2026
**Status**: ✅ Production Ready
