// Type definitions for the application
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  nationality?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string; // Beginner, Intermediate, Advanced, Native
}

export interface Resume {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  template?: "classic" | "modern" | "compact" | "professional" | "ordered" | "elegant"; // UI template for preview/export
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  interests: string[];
  references: string;
  sectionOrder: string[];
}

export interface CoverLetter {
  id: string;
  createdAt: string;
  updatedAt: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  tone: "Friendly" | "Technical" | "Leadership";
  language: "sw" | "en";
  keywords: string[];
  content: {
    greeting: string;
    intro: string;
    body_paragraphs: string[];
    closing: string;
    signature: string;
    tone: string;
    target_keywords: string[];
  };
  resumeId?: string;
}

export interface JobMatch {
  score: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
}

export interface GeminiRequest {
  jobText: string;
  resumeSnapshot: Partial<Resume>;
  tone: "Friendly" | "Technical" | "Leadership";
  lang: "sw" | "en";
  model: "gemini-2.0-flash-exp" | "gemini-exp-1206";
  keywords: string[];
}

export interface GeminiResponse {
  greeting: string;
  intro: string;
  body_paragraphs: string[];
  closing: string;
  signature: string;
  tone: string;
  target_keywords: string[];
}
