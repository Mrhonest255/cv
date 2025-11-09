# DEPLOYMENT GUIDE - JobKit Pro

## Quick Deployment to Vercel

### 1. Prepare for Deployment

```bash
# Build the project locally to test
npm run build

# Test production build
npm start
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variable
vercel env add GEMINI_API_KEY
# Paste your API key: AIzaSyBI2kvWO2fA-N8Xt8bvLuTdUxqplmwcIco

# Deploy to production
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - JobKit Pro"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   
6. Add Environment Variables:
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyBI2kvWO2fA-N8Xt8bvLuTdUxqplmwcIco`

7. Click "Deploy"

### 3. Verify Deployment

After deployment:
- ✅ Visit your production URL
- ✅ Test CV creation (should work offline after first load)
- ✅ Test Cover Letter generation with Gemini AI
- ✅ Test Smart Job Match
- ✅ Test PDF/DOCX exports
- ✅ Check PWA installation (should see "Install" prompt)

---

## Security Checklist

✅ API key is server-side only (`/app/api/gemini/route.ts`)  
✅ Rate limiting implemented (10 req/min per IP)  
✅ Input validation (max 10k chars job description)  
✅ HTTPS enforced on Vercel (automatic)  
✅ Environment variables not committed to Git

---

## Performance Optimization

### Already Implemented:
- ✅ Next.js 15 with App Router
- ✅ PWA with offline caching
- ✅ Gemini 2.0 Flash (fast responses <3s)
- ✅ IndexedDB for local storage
- ✅ Code splitting (automatic)

### Optional Enhancements:
- Add Redis/Upstash for distributed rate limiting
- Implement Vercel Edge Functions for faster API responses
- Add image optimization for resume photos
- Enable Context Caching for repeated prompts (Gemini feature)

---

## Monitoring

### Vercel Analytics (Built-in)
- Performance metrics
- Error tracking
- User engagement

### Add Custom Logging (Optional)

```typescript
// In /app/api/gemini/route.ts
console.log({
  timestamp: new Date().toISOString(),
  model,
  language: lang,
  tone,
  responseTime: Date.now() - startTime,
});
```

---

## Troubleshooting

### Issue: "Gemini API Error"
**Solution**: Check if `GEMINI_API_KEY` is set in Vercel environment variables

### Issue: "Rate limit exceeded"
**Solution**: Adjust `RATE_LIMIT_MAX` or wait 1 minute

### Issue: "PDF generation fails"
**Solution**: Check browser console; pdf-lib requires modern browser

### Issue: "PWA not installing"
**Solution**: Ensure HTTPS (automatic on Vercel); check manifest.json

---

## Scaling Considerations

### Current Limits:
- **Gemini Free Tier**: 15 req/min, 1M tokens/day
- **Vercel Free**: 100 GB bandwidth/month
- **IndexedDB**: ~50 MB per domain (browser-dependent)

### To Scale:
1. Upgrade Gemini to paid tier for higher limits
2. Use Vercel Pro for better performance
3. Add backend database (Vercel Postgres) for cross-device sync
4. Implement user authentication (NextAuth.js)

---

## Maintenance

### Regular Tasks:
- Monitor Gemini API usage (Google AI Studio dashboard)
- Update dependencies: `npm outdated` → `npm update`
- Check for Next.js updates: `npm info next version`
- Review Vercel deployment logs

### Model Updates:
Google may release new Gemini models. To use them:
1. Check [Google AI docs](https://ai.google.dev/models)
2. Update `model` options in `/app/letter/page.tsx`
3. Test compatibility with structured output

---

## Backup & Recovery

### Export User Data:
Users can export their data via:
- JSON export (resumes/letters)
- PDF/DOCX downloads

### Developer Backup:
```bash
# Backup codebase
git push origin main

# Export environment variables
vercel env pull .env.production
```

---

## License & Attribution

**JobKit Pro** uses:
- Google Gemini API (subject to [Google AI Terms](https://ai.google.dev/terms))
- Next.js (MIT License)
- Open-source libraries (see package.json)

When deploying, ensure compliance with all licenses.

---

**Built with ❤️ in Tanzania 🇹🇿**  
For support: [GitHub Issues](YOUR_REPO_URL/issues)
