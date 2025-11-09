import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('sw-TZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function generateFilename(
  type: 'resume' | 'letter',
  name: string,
  format: 'pdf' | 'docx',
  jobTitle?: string
): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
  
  if (type === 'resume') {
    return `${cleanName}_CV_${date}.${format}`;
  } else {
    const cleanJob = jobTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'CoverLetter';
    return `CoverLetter_${cleanJob}_${date}.${format}`;
  }
}
