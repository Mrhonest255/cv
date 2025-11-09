# Quick Start - JobKit Pro

## 1️⃣ Install Dependencies (if not done)
```bash
npm install
```

## 2️⃣ Start Development Server
```bash
npm run dev
```

Server runs at: **http://localhost:3000**

## 3️⃣ Test the App

### Create a Resume:
1. Go to http://localhost:3000/resume
2. Fill in your details
3. Click "Hifadhi CV"
4. Click "Pakua PDF"

### Generate Cover Letter:
1. Go to http://localhost:3000/letter
2. Paste any job description
3. Click "Tengeneza Barua ya Maombi"
4. Wait 2-5 seconds for AI to generate
5. Download PDF/DOCX

### Check Job Match:
1. Go to http://localhost:3000/match
2. Paste job description
3. Click "Changanua Ulinganifu"
4. See your match score!

## 4️⃣ Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add API key when prompted:
# GEMINI_API_KEY=AIzaSyBI2kvWO2fA-N8Xt8bvLuTdUxqplmwcIco

# Deploy to production
vercel --prod
```

## ✅ Features Checklist

- [x] Resume Builder with autosave
- [x] AI Cover Letter (Gemini 2.0)
- [x] Smart Job Match
- [x] PDF & DOCX Export
- [x] Offline PWA
- [x] Swahili & English
- [x] Server-side API security
- [x] Rate limiting
- [x] Mobile responsive

## 🎉 You're Ready!

Visit http://localhost:3000 and start building your resume!

For detailed testing, see: **TESTING.md**
For deployment guide, see: **DEPLOYMENT.md**
For full docs, see: **README.md**
