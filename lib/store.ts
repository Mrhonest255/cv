import { create } from 'zustand';
import type { Resume, CoverLetter } from '@/lib/types';
import { saveResume, saveCoverLetter, getResume, getCoverLetter, getAllResumes, getAllCoverLetters } from '@/lib/storage';

interface AppState {
  // Resume state
  currentResume: Resume | null;
  resumes: Resume[];
  
  // Cover letter state
  currentLetter: CoverLetter | null;
  letters: CoverLetter[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentResume: (resume: Resume | null) => void;
  saveCurrentResume: () => Promise<void>;
  loadResume: (id: string) => Promise<void>;
  loadAllResumes: () => Promise<void>;
  createNewResume: () => void;
  
  setCurrentLetter: (letter: CoverLetter | null) => void;
  saveCurrentLetter: () => Promise<void>;
  loadLetter: (id: string) => Promise<void>;
  loadAllLetters: () => Promise<void>;
  createNewLetter: () => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const createEmptyResume = (): Resume => ({
  id: Date.now().toString(),
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  template: 'classic',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  interests: [],
  references: '',
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'],
});

const createEmptyLetter = (): CoverLetter => ({
  id: Date.now().toString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  jobTitle: '',
  company: '',
  jobDescription: '',
  tone: 'Friendly',
  language: 'sw',
  keywords: [],
  content: {
    greeting: '',
    intro: '',
    body_paragraphs: [],
    closing: '',
    signature: '',
    tone: '',
    target_keywords: [],
  },
});

export const useAppStore = create<AppState>((set, get) => ({
  currentResume: null,
  resumes: [],
  currentLetter: null,
  letters: [],
  isLoading: false,
  error: null,
  
  setCurrentResume: (resume) => set({ currentResume: resume }),
  
  saveCurrentResume: async () => {
    const { currentResume } = get();
    if (!currentResume) return;
    
    set({ isLoading: true, error: null });
    try {
      const updated = {
        ...currentResume,
        updatedAt: new Date().toISOString(),
        version: (currentResume.version || 0) + 1,
      };
      await saveResume(updated);
      set({ currentResume: updated, isLoading: false });
      await get().loadAllResumes();
    } catch (error) {
      set({ error: 'Failed to save resume', isLoading: false });
    }
  },
  
  loadResume: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const resume = await getResume(id);
      set({ currentResume: resume, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load resume', isLoading: false });
    }
  },
  
  loadAllResumes: async () => {
    set({ isLoading: true, error: null });
    try {
      const resumes = await getAllResumes();
      set({ resumes, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load resumes', isLoading: false });
    }
  },
  
  createNewResume: () => {
    const newResume = createEmptyResume();
    set({ currentResume: newResume });
  },
  
  setCurrentLetter: (letter) => set({ currentLetter: letter }),
  
  saveCurrentLetter: async () => {
    const { currentLetter } = get();
    if (!currentLetter) return;
    
    set({ isLoading: true, error: null });
    try {
      const updated = {
        ...currentLetter,
        updatedAt: new Date().toISOString(),
      };
      await saveCoverLetter(updated);
      set({ currentLetter: updated, isLoading: false });
      await get().loadAllLetters();
    } catch (error) {
      set({ error: 'Failed to save cover letter', isLoading: false });
    }
  },
  
  loadLetter: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const letter = await getCoverLetter(id);
      set({ currentLetter: letter, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load cover letter', isLoading: false });
    }
  },
  
  loadAllLetters: async () => {
    set({ isLoading: true, error: null });
    try {
      const letters = await getAllCoverLetters();
      set({ letters, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load cover letters', isLoading: false });
    }
  },
  
  createNewLetter: () => {
    const newLetter = createEmptyLetter();
    set({ currentLetter: newLetter });
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
