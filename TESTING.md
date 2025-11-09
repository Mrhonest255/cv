# Testing Checklist for JobKit Pro

## Pre-Testing Setup
- [ ] Development server is running (`npm run dev`)
- [ ] Browser is open at http://localhost:3000
- [ ] `.env.local` has `GEMINI_API_KEY` set
- [ ] Browser DevTools console is open (F12)

---

## Test 1: Home Page
**URL**: http://localhost:3000

- [ ] Page loads without errors
- [ ] Navigation bar shows: Mwanzo, CV, Barua, Linganisha
- [ ] Three feature cards are visible
- [ ] Cards link to correct pages when clicked
- [ ] Footer shows "JobKit Pro"

**Expected**: Clean, modern homepage in Swahili with working navigation

---

## Test 2: Resume Builder (Basic)
**URL**: http://localhost:3000/resume

### Personal Info:
- [ ] Fill in: "John Doe"
- [ ] Email: "john@example.com"
- [ ] Phone: "+255 123 456 789"
- [ ] Location: "Dar es Salaam, Tanzania"

### Experience:
- [ ] Click "Ongeza Uzoefu"
- [ ] Title: "Software Engineer"
- [ ] Company: "Tech Corp"
- [ ] Location: "Dar es Salaam"
- [ ] Start: "2020-01"
- [ ] Check "Ninafanya kazi hapa sasa"
- [ ] Description: 
  ```
  • Developed web applications
  • Led team of 5 developers
  • Improved performance by 50%
  ```

### Education:
- [ ] Click "Ongeza Elimu"
- [ ] Degree: "Bachelor of Computer Science"
- [ ] Institution: "University of Dar es Salaam"
- [ ] Location: "Dar es Salaam"
- [ ] Dates: 2016-2020

### Skills:
- [ ] Click "Ongeza Ujuzi" 3 times
- [ ] Add: "JavaScript" (level 5), "Python" (level 4), "React" (level 4)

### Save & Export:
- [ ] Click "Hifadhi CV"
- [ ] Toast shows "Imehifadhiwa!"
- [ ] Click "Pakua PDF"
- [ ] PDF downloads successfully
- [ ] Open PDF → verify content is correct

**Expected**: Resume saved to IndexedDB, PDF downloads with all info

---

## Test 3: Offline Mode (PWA)
**Prerequisites**: Complete Test 2 first

1. **Enable Offline**:
   - [ ] Open DevTools → Application tab
   - [ ] Check "Service Worker" section
   - [ ] Select "Offline" checkbox

2. **Test Resume Access**:
   - [ ] Refresh page (Ctrl+R)
   - [ ] Page still loads
   - [ ] Resume data is still visible
   - [ ] Can edit resume offline

3. **Re-enable Online**:
   - [ ] Uncheck "Offline"
   - [ ] Refresh page

**Expected**: App works fully offline after initial load

---

## Test 4: Smart Cover Letter (Gemini AI)
**URL**: http://localhost:3000/letter

### Input Data:
```
Kazi Unayotaka: Customer Service Representative
Kampuni: Vodacom Tanzania
Maelezo ya Kazi:
We are looking for a customer service representative with excellent communication skills. You will handle customer inquiries, resolve complaints, and ensure customer satisfaction. Requirements: 2+ years experience, fluent in Swahili and English, computer literate.

Tone: Friendly
Lugha: Kiswahili
Keywords: customer service, communication, problem solving
```

### Test Flow:
- [ ] Fill all fields above
- [ ] Click "Tengeneza Barua ya Maombi"
- [ ] Loading state shows "Inatengeneza..."
- [ ] Response appears within 5 seconds
- [ ] Letter has all sections: Salamu, Utangulizi, Aya, Hitimisho, Saini
- [ ] Letter is in Swahili
- [ ] Keywords used are shown at bottom
- [ ] Edit intro paragraph
- [ ] Click "PDF" → downloads successfully
- [ ] Click "DOCX" → downloads successfully

**Expected**: AI generates professional cover letter in Swahili with keywords

---

## Test 5: Smart Cover Letter (English)
**Same as Test 4 but**:
- [ ] Change Lugha to "English"
- [ ] Change Tone to "Technical"
- [ ] Generate letter
- [ ] Verify letter is in English
- [ ] Verify technical tone (formal, precise language)

**Expected**: English letter with technical tone

---

## Test 6: Smart Job Match
**URL**: http://localhost:3000/match

### Job Description:
```
Software Engineer - Full Stack
Tech Innovations Ltd

We're seeking a talented Full Stack Software Engineer with expertise in JavaScript, React, Node.js, and Python. You'll build scalable web applications, collaborate with cross-functional teams, and mentor junior developers.

Requirements:
- 3+ years experience in software development
- Strong proficiency in JavaScript, React, Node.js
- Experience with Python and databases
- Excellent problem-solving skills
- Bachelor's degree in Computer Science

Preferred:
- Experience with cloud platforms (AWS, Azure)
- Knowledge of Docker and Kubernetes
- Agile/Scrum experience
```

### Test Flow:
- [ ] Select your resume from dropdown
- [ ] Paste job description above
- [ ] Click "Changanua Ulinganifu"
- [ ] Analysis completes within 1 second
- [ ] Match score shows (should be 60-80% for test resume)
- [ ] Green keywords shown (matched)
- [ ] Yellow keywords shown (missing)
- [ ] Suggestions provided
- [ ] Click "Nakili Keywords Zinazokosekana"
- [ ] Toast shows "Imenakiliwa!"
- [ ] Paste in notepad → keywords are there

**Expected**: Match score with keyword analysis

---

## Test 7: API Security
**Open Browser DevTools → Network Tab**

1. **Generate Cover Letter** (Test 4)
2. **Check Network Request**:
   - [ ] Find POST to `/api/gemini`
   - [ ] Click on request
   - [ ] Headers tab → verify `Content-Type: application/json`
   - [ ] Payload tab → should NOT see `GEMINI_API_KEY`
   - [ ] Response tab → should see JSON with letter content

3. **Check Source Code**:
   - [ ] Open DevTools → Sources
   - [ ] Search for "AIzaSy" (API key prefix)
   - [ ] Should NOT find API key in any client-side file

**Expected**: API key is never exposed to client

---

## Test 8: Rate Limiting
**Requires API call**

1. **Spam Cover Letter Generation**:
   - [ ] Click "Tengeneza Barua" 11 times rapidly
   - [ ] After 10th request, should see error
   - [ ] Error message: "Umefika kikomo cha maombi"
   
2. **Wait 1 Minute**:
   - [ ] Wait 60 seconds
   - [ ] Try generating again
   - [ ] Should work

**Expected**: Rate limit enforced at 10 req/min

---

## Test 9: Export Formats
**From Resume Builder**:

### PDF Export:
- [ ] Export resume as PDF
- [ ] Open in PDF reader
- [ ] Verify:
  - [ ] All text is readable
  - [ ] Sections are properly formatted
  - [ ] Font is professional (Helvetica)
  - [ ] Margins are appropriate
  - [ ] No text overflow

### DOCX Export:
- [ ] Export resume as DOCX
- [ ] Open in Word/LibreOffice
- [ ] Verify:
  - [ ] Proper headings (bold, larger font)
  - [ ] Bullet points formatted correctly
  - [ ] Editable text
  - [ ] Professional styling

**Expected**: Both formats look professional and editable

---

## Test 10: Data Persistence
**Test IndexedDB Storage**

1. **Create Resume** (Test 2)
2. **Close Browser Completely**
3. **Reopen Browser**
4. **Navigate to** http://localhost:3000/resume
5. **Verify**:
   - [ ] Resume data is still there
   - [ ] All fields populated
   - [ ] Version number maintained

**Expected**: Data persists across browser sessions

---

## Test 11: Error Handling

### Invalid API Key:
1. **Edit `.env.local`**:
   - Set `GEMINI_API_KEY=invalid_key_12345`
2. **Restart server** (`npm run dev`)
3. **Try generating cover letter**
4. **Verify**:
   - [ ] Error toast appears
   - [ ] Message: "Tatizo la ufunguo wa API"
   - [ ] No crash

### Empty Job Description:
1. **Go to** `/letter`
2. **Click "Tengeneza Barua"** without filling fields
3. **Verify**:
   - [ ] Error toast: "Taarifa Zimekosekana"
   - [ ] No API call made

**Expected**: Graceful error messages, no crashes

---

## Test 12: Multi-Language
**Switch between Swahili and English**

1. **Cover Letter in Swahili** (Test 4)
2. **Cover Letter in English** (Test 5)
3. **Compare**:
   - [ ] Both use appropriate grammar
   - [ ] Keywords incorporated naturally
   - [ ] Tone respected

**Expected**: High-quality output in both languages

---

## Test 13: Model Switching
**Test different Gemini models**

1. **Generate with Gemini 2.0 Flash**:
   - [ ] Time response (~2-3 seconds)
   - [ ] Quality good

2. **Generate with Gemini Exp 1206**:
   - [ ] Time response (~3-5 seconds)
   - [ ] Quality potentially better (more reasoning)

**Expected**: Both models work, Exp is slower but may be more detailed

---

## Test 14: Mobile Responsiveness
**Resize browser window**

1. **Desktop** (1920x1080):
   - [ ] Layout looks good
   - [ ] Navigation horizontal

2. **Tablet** (768px):
   - [ ] Layout adapts
   - [ ] Forms stack nicely

3. **Mobile** (375px):
   - [ ] Everything readable
   - [ ] Buttons accessible
   - [ ] Forms usable

**Expected**: Responsive design works on all screen sizes

---

## Test 15: Performance
**Check loading times**

1. **First Load**:
   - [ ] Initial page load < 3 seconds
   
2. **Navigation**:
   - [ ] Page transitions < 500ms
   
3. **AI Generation**:
   - [ ] Gemini 2.0 Flash < 5 seconds
   - [ ] Gemini Exp < 10 seconds

**Expected**: Fast, responsive application

---

## Bug Report Template

If you find issues:

```
**Bug**: [Brief description]
**Steps to Reproduce**:
1. Go to [page]
2. Click [button]
3. See error

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Browser**: [Chrome 120 / Edge 120 / Safari 17]
**Console Errors**: [Copy from DevTools]
```

---

## ✅ Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Home Page | ⬜ | |
| Resume Builder | ⬜ | |
| Offline Mode | ⬜ | |
| Cover Letter (SW) | ⬜ | |
| Cover Letter (EN) | ⬜ | |
| Job Match | ⬜ | |
| API Security | ⬜ | |
| Rate Limiting | ⬜ | |
| Export PDF/DOCX | ⬜ | |
| Data Persistence | ⬜ | |
| Error Handling | ⬜ | |
| Multi-Language | ⬜ | |
| Model Switching | ⬜ | |
| Mobile Responsive | ⬜ | |
| Performance | ⬜ | |

**Overall Score**: ___/15 ✅

---

## 🎯 Critical Tests (Must Pass)

1. ✅ Resume Builder works
2. ✅ Cover Letter generates (Gemini API works)
3. ✅ API key is NOT exposed
4. ✅ PDF export works
5. ✅ Offline mode works

If these 5 pass → **Production Ready** 🚀

---

**Happy Testing!** 🧪
