import type { Resume, JobMatch } from './types';

interface TokenFrequency {
  [key: string]: number;
}

// Tokenize and normalize text
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // Ignore very short words
}

// Calculate term frequency
function getTermFrequency(tokens: string[]): TokenFrequency {
  const freq: TokenFrequency = {};
  tokens.forEach(token => {
    freq[token] = (freq[token] || 0) + 1;
  });
  return freq;
}

// Extract important keywords (simple TF approach)
function extractKeywords(freq: TokenFrequency, minFreq: number = 2): string[] {
  return Object.entries(freq)
    .filter(([_, count]) => count >= minFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 30); // Top 30 keywords
}

// Convert resume to searchable text
function resumeToText(resume: Resume): string {
  const parts: string[] = [];
  
  // Summary
  if (resume.summary) parts.push(resume.summary);
  
  // Skills
  resume.skills.forEach(skill => parts.push(skill.name));
  
  // Experience
  resume.experience.forEach(exp => {
    parts.push(exp.title, exp.company);
    parts.push(...exp.description);
  });
  
  // Education
  resume.education.forEach(edu => {
    parts.push(edu.degree, edu.institution);
  });
  
  // Projects
  resume.projects.forEach(proj => {
    parts.push(proj.title, proj.description);
    parts.push(...proj.technologies);
  });
  
  // Certifications
  resume.certifications.forEach(cert => {
    parts.push(cert.name, cert.issuer);
  });
  
  // Languages
  resume.languages.forEach(lang => parts.push(lang.name));
  
  return parts.join(' ');
}

// Calculate match score
export function calculateJobMatch(resume: Resume, jobDescription: string): JobMatch {
  const resumeText = resumeToText(resume);
  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobDescription);
  
  const resumeFreq = getTermFrequency(resumeTokens);
  const jobFreq = getTermFrequency(jobTokens);
  
  const resumeKeywords = extractKeywords(resumeFreq, 1);
  const jobKeywords = extractKeywords(jobFreq, 2);
  
  // Calculate overlap
  const matchedKeywords = jobKeywords.filter(keyword => 
    resumeKeywords.includes(keyword)
  );
  
  const missingKeywords = jobKeywords.filter(keyword => 
    !resumeKeywords.includes(keyword)
  );
  
  // Weighted scoring
  const skillsMatch = calculateSkillsMatch(resume.skills.map(s => s.name), jobTokens);
  const experienceMatch = calculateExperienceMatch(resume.experience, jobTokens);
  
  // Combined score (weighted)
  const keywordScore = (matchedKeywords.length / Math.max(jobKeywords.length, 1)) * 40;
  const skillScore = skillsMatch * 35;
  const expScore = experienceMatch * 25;
  
  const totalScore = Math.min(100, Math.round(keywordScore + skillScore + expScore));
  
  // Generate suggestions
  const suggestions = generateSuggestions(totalScore, missingKeywords);
  
  return {
    score: totalScore,
    missingKeywords: missingKeywords.slice(0, 15), // Top 15 missing
    matchedKeywords: matchedKeywords.slice(0, 15), // Top 15 matched
    suggestions,
  };
}

function calculateSkillsMatch(skills: string[], jobTokens: string[]): number {
  const skillTokens = skills.flatMap(s => tokenize(s));
  const matchCount = skillTokens.filter(skill => jobTokens.includes(skill)).length;
  return matchCount / Math.max(skillTokens.length, 1);
}

function calculateExperienceMatch(experience: any[], jobTokens: string[]): number {
  const expText = experience.flatMap(e => [e.title, ...e.description]).join(' ');
  const expTokens = tokenize(expText);
  const matchCount = expTokens.filter(token => jobTokens.includes(token)).length;
  return matchCount / Math.max(expTokens.length, 1);
}

function generateSuggestions(score: number, missingKeywords: string[]): string[] {
  const suggestions: string[] = [];
  
  if (score < 50) {
    suggestions.push('Consider adding more relevant keywords from the job description to your resume');
    suggestions.push('Highlight skills that match the job requirements');
  }
  
  if (score >= 50 && score < 75) {
    suggestions.push('Good match! Consider emphasizing your matching skills in your cover letter');
  }
  
  if (score >= 75) {
    suggestions.push('Excellent match! Your profile aligns well with this position');
  }
  
  if (missingKeywords.length > 10) {
    suggestions.push(`Focus on these missing keywords in your cover letter: ${missingKeywords.slice(0, 5).join(', ')}`);
  }
  
  return suggestions;
}

// Extract job-specific keywords for cover letter
export function extractJobKeywords(jobDescription: string, count: number = 10): string[] {
  const tokens = tokenize(jobDescription);
  const freq = getTermFrequency(tokens);
  
  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'are', 'will', 'can', 'you', 'your', 'our',
    'this', 'that', 'from', 'have', 'has', 'been', 'must', 'should', 'would',
    'their', 'about', 'into', 'through', 'over', 'such', 'when', 'where'
  ]);
  
  return Object.entries(freq)
    .filter(([word]) => !stopWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, count);
}
