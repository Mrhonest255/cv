# JobKit Pro - Smart Resume & Cover Letter Builder

**Production-ready Next.js web app** na **Gemini AI** kwa ajili ya kutengeneza CV na barua za maombi kwa usalama na kwa urahisi. Inatumia **offline-first** (PWA), **server-side API security**, na **PDF/DOCX export**.

## ✨ Vipengele Muhimu (Core Features)

- ✅ **Resume Builder**: Tengeneza CV kamili na sehemu nyingi (experience, education, skills, projects, etc.)
- ✅ **Smart Cover Letter Studio**: Barua za maombi zenye akili kwa kutumia **Gemini 2.0 Flash/Pro**
- ✅ **Smart Job Match**: Linganisha CV yako na kazi unayotaka kwa kutumia keyword scoring
- ✅ **Offline PWA**: Inatumia bila mtandao baada ya kupakia mara ya kwanza
- ✅ **Export PDF & DOCX**: Pakua CV na barua kwa muundo wa PDF au Word
- ✅ **Server-side API Security**: API key haionyeshwi kwa client; usalama wa juu
- ✅ **Streaming UX**: Ona barua inaandikwa palepale (typewriter effect)
- ✅ **Kiswahili & English**: Chagua lugha unayotaka
- ✅ **IndexedDB Storage**: Data yako inabaki kwenye kifaa chako

## 🚀 Jinsi ya Kuanza (Quick Start)

### 1. Sakinisha dependencies

```bash
npm install
```

### 2. Weka API Key

Tengeneza faili `.env.local` kwenye root directory:

```env
GEMINI_API_KEY=AIzaSyBI2kvWO2fA-N8Xt8bvLuTdUxqplmwcIco
```

### 3. Endesha development server

```bash
npm run dev
```

Fungua [http://localhost:3000](http://localhost:3000) katika browser yako.

### 4. Jenga kwa production

```bash
npm run build
npm start
```

## 📋 Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript
- **AI**: Google GenAI SDK (`@google/genai`) - Gemini 2.0 Flash/Pro
- **Styling**: Tailwind CSS, shadcn/ui components
- **State**: Zustand (global state management)
- **Storage**: IndexedDB via `idb-keyval` (offline-first)
- **Export**: `pdf-lib` (PDF), `docx` (Word)
- **PWA**: `next-pwa` (service worker, offline caching)
- **Forms**: React Hook Form + Zod validation

## 🗂️ Project Structure

```
/app
  /api/gemini/route.ts    ← Server-only Gemini API endpoint
  /resume/page.tsx        ← Resume Builder
  /letter/page.tsx        ← Cover Letter Studio
  /match/page.tsx         ← Smart Job Match
  layout.tsx
  page.tsx                ← Home page
/components
  /ui/                    ← shadcn/ui components
  navigation.tsx
/lib
  types.ts                ← TypeScript interfaces
  storage.ts              ← IndexedDB helpers
  scoring.ts              ← Job matching algorithm
  pdf.ts                  ← PDF generation
  docx.ts                 ← DOCX generation
  store.ts                ← Zustand store
  utils.ts                ← Utility functions
/public
  manifest.json           ← PWA manifest
  icon-512.svg            ← App icon
```

## 🔐 Security Features

1. **API Key Protection**: `GEMINI_API_KEY` haiwekwi client-side; `/api/gemini` route pekee inaiunganisha
2. **Rate Limiting**: In-memory rate limiter (10 requests/minute per IP)
3. **Input Validation**: Zod schemas, length guards (max 10k chars job description)
4. **Server-side Only**: Hakuna direct calls kwa Gemini kutoka browser

## 🧠 How Gemini Integration Works

```typescript
// Client sends request to /api/gemini (POST)
{
  jobText: "Customer Service Agent...",
  resumeSnapshot: { ...personalInfo, skills, experience },
  tone: "Friendly" | "Technical" | "Leadership",
  lang: "sw" | "en",
  model: "gemini-2.0-flash-exp" | "gemini-exp-1206",
  keywords: ["customer", "communication"]
}

// Server responds with structured JSON
{
  greeting: "Ndugu Mheshimiwa,",
  intro: "Ninaandika kwa shauku kubwa...",
  body_paragraphs: ["Para 1...", "Para 2..."],
  closing: "Natarajia fursa ya mazungumzo...",
  signature: "Kwa heshima,",
  tone: "Friendly",
  target_keywords: ["customer", "service", "team"]
}
```

## 📦 Main Dependencies

```json
{
  "@google/genai": "^0.21.0",
  "next": "^15.0.3",
  "react": "^18.3.1",
  "zustand": "^5.0.1",
  "idb-keyval": "^6.2.1",
  "pdf-lib": "^1.17.1",
  "docx": "^8.5.0",
  "react-hook-form": "^7.53.1",
  "zod": "^3.23.8",
  "next-pwa": "^5.6.0",
  "lucide-react": "^0.451.0"
}
```

## 🧪 Testing Features

1. **Resume Builder**:
   - Ongeza experience, education, skills
   - Export PDF & DOCX
   - Hifadhi kwa IndexedDB

2. **Cover Letter Studio**:
   - Paste job description
   - Chagua tone (Friendly/Technical/Leadership)
   - Chagua lugha (Kiswahili/English)
   - Ona streaming response (live generation)
   - Edit na save
   - Export PDF/DOCX

3. **Smart Job Match**:
   - Linganisha CV na job description
   - Angalia match percentage
   - Pata missing keywords
   - Tumia suggestions kwa cover letter

4. **Offline Mode**:
   - Load app bila mtandao baada ya first visit
   - Tengeneza CV offline
   - Data inabaki kwenye browser (IndexedDB)

## 🌐 PWA Features

- **Offline-first**: App shell na assets zinacached
- **Install prompt**: Weka app kwenye home screen
- **Background sync**: Resume autosave
- **Cache strategies**:
  - App shell: Cache-first
  - `/api/gemini`: Network-first (fallback to error message)
  - Static assets: Stale-while-revalidate

## 🔧 Environment Variables

| Variable | Maelezo | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |
| `RATE_LIMIT_REQUESTS` | Max requests per window (default: 10) | ❌ No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window ms (default: 60000) | ❌ No |

## 📝 Usage Examples

### Tengeneza CV

1. Nenda `/resume`
2. Jaza taarifa binafsi (jina, email, simu)
3. Ongeza experience, education, skills
4. Preview na export PDF/DOCX

### Tengeneza Cover Letter

1. Nenda `/letter`
2. Paste job description
3. Chagua tone na lugha
4. Bonyeza "Tengeneza Barua" → ona AI inaandika
5. Edit kama unavyotaka
6. Save na export

### Linganisha Kazi

1. Nenda `/match`
2. Chagua CV yako
3. Paste job description
4. Angalia match score na suggestions
5. Tumia missing keywords kwa cover letter

## 🤝 Contributing

1. Fork repo
2. Tengeneza branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Fungua Pull Request

## 📄 License

MIT License - angalia `LICENSE` file kwa maelezo zaidi.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language models
- **Vercel** for hosting platform
- **shadcn/ui** for beautiful components
- **Next.js team** for amazing framework

---

**Built with ❤️ using Next.js, TypeScript, and Gemini AI**
