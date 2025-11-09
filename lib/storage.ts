import { get, set, del, keys } from 'idb-keyval';
import type { Resume, CoverLetter } from './types';

const RESUME_PREFIX = 'resume_';
const LETTER_PREFIX = 'letter_';
const MAX_VERSIONS = 5;

// Resume storage
export async function saveResume(resume: Resume): Promise<void> {
  const key = `${RESUME_PREFIX}${resume.id}`;
  await set(key, resume);
  
  // Keep version history
  const versionKey = `${key}_v${resume.version}`;
  await set(versionKey, resume);
  
  // Clean old versions
  await cleanOldVersions(resume.id, resume.version);
}

export async function getResume(id: string): Promise<Resume | null> {
  const key = `${RESUME_PREFIX}${id}`;
  const resume = await get<Resume>(key);
  return resume || null;
}

export async function getAllResumes(): Promise<Resume[]> {
  const allKeys = await keys();
  const resumeKeys = allKeys.filter(k => 
    typeof k === 'string' && k.startsWith(RESUME_PREFIX) && !k.includes('_v')
  );
  
  const resumes = await Promise.all(
    resumeKeys.map(k => get<Resume>(k))
  );
  
  return resumes.filter((r): r is Resume => r !== undefined);
}

export async function deleteResume(id: string): Promise<void> {
  const key = `${RESUME_PREFIX}${id}`;
  await del(key);
  
  // Delete all versions
  const allKeys = await keys();
  const versionKeys = allKeys.filter(k => 
    typeof k === 'string' && k.startsWith(`${key}_v`)
  );
  
  await Promise.all(versionKeys.map(k => del(k)));
}

async function cleanOldVersions(id: string, currentVersion: number): Promise<void> {
  const baseKey = `${RESUME_PREFIX}${id}`;
  const allKeys = await keys();
  const versionKeys = allKeys.filter(k => 
    typeof k === 'string' && k.startsWith(`${baseKey}_v`)
  );
  
  if (versionKeys.length > MAX_VERSIONS) {
    // Sort and delete oldest
    const sortedKeys = versionKeys
      .map(k => ({
        key: k,
        version: parseInt((k as string).split('_v')[1])
      }))
      .sort((a, b) => b.version - a.version);
    
    const toDelete = sortedKeys.slice(MAX_VERSIONS);
    await Promise.all(toDelete.map(({ key }) => del(key)));
  }
}

// Cover Letter storage
export async function saveCoverLetter(letter: CoverLetter): Promise<void> {
  const key = `${LETTER_PREFIX}${letter.id}`;
  await set(key, letter);
}

export async function getCoverLetter(id: string): Promise<CoverLetter | null> {
  const key = `${LETTER_PREFIX}${id}`;
  const letter = await get<CoverLetter>(key);
  return letter || null;
}

export async function getAllCoverLetters(): Promise<CoverLetter[]> {
  const allKeys = await keys();
  const letterKeys = allKeys.filter(k => 
    typeof k === 'string' && k.startsWith(LETTER_PREFIX)
  );
  
  const letters = await Promise.all(
    letterKeys.map(k => get<CoverLetter>(k))
  );
  
  return letters.filter((l): l is CoverLetter => l !== undefined);
}

export async function deleteCoverLetter(id: string): Promise<void> {
  const key = `${LETTER_PREFIX}${id}`;
  await del(key);
}

// Import/Export JSON
export function exportToJSON(data: Resume | CoverLetter, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFromJSON(file: File): Promise<Resume | CoverLetter> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
