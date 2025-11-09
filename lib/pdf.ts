import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Resume, CoverLetter } from './types';

export async function generateResumePDF(
  resume: Resume,
  template: '1-column' | '2-column' = '1-column',
  includeWatermark: boolean = false
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  // Preload fonts
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page state helpers
  let page = pdfDoc.addPage([595.276, 841.890]); // A4
  let { width, height } = page.getSize();
  let y = height - 50;
  const margin = 50;
  const lineHeight = 14;
  const ensureSpace = (minSpace: number = 100) => {
    if (y < minSpace) {
      page = pdfDoc.addPage([595.276, 841.890]);
      ({ width, height } = page.getSize());
      y = height - 50;
      // draw carry-over header line if needed later
    }
  };
  
  // Helper function to draw text
  const drawText = (text: string, x: number, yPos: number, options: any = {}) => {
    page.drawText(text, {
      x,
      y: yPos,
      size: options.size || 11,
      font: options.bold ? helveticaBold : helvetica,
      color: options.color || rgb(0, 0, 0),
      maxWidth: options.maxWidth || (width - margin * 2),
    });
  };
  
  // Draw header
  drawText(resume.personalInfo.fullName, margin, y, { size: 20, bold: true });
  y -= 25;
  
  drawText(
    `${resume.personalInfo.email} | ${resume.personalInfo.phone} | ${resume.personalInfo.location}`,
    margin,
    y,
    { size: 9 }
  );
  y -= 20;
  
  if (resume.personalInfo.linkedin || resume.personalInfo.portfolio) {
    const links = [resume.personalInfo.linkedin, resume.personalInfo.portfolio].filter(Boolean).join(' | ');
    drawText(links, margin, y, { size: 9, color: rgb(0, 0, 0.8) });
    y -= 25;
  } else {
    y -= 15;
  }
  
  // Draw line
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 20;
  
  // Summary
  if (resume.summary) {
    drawText('SUMMARY', margin, y, { size: 12, bold: true });
    y -= lineHeight + 2;
    
    const summaryLines = wrapText(resume.summary, width - margin * 2, helvetica, 10);
    summaryLines.forEach(line => {
      drawText(line, margin, y, { size: 10 });
      y -= lineHeight;
    });
    y -= 10;
  }
  
  // Experience
  if (resume.experience.length > 0) {
    drawText('EXPERIENCE', margin, y, { size: 12, bold: true });
    y -= lineHeight + 4;
    
    for (const exp of resume.experience) {
      drawText(exp.title, margin, y, { size: 11, bold: true });
      y -= lineHeight;
      
      drawText(
        `${exp.company} | ${exp.location} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
        margin,
        y,
        { size: 9, color: rgb(0.3, 0.3, 0.3) }
      );
      y -= lineHeight + 2;
      
      exp.description.forEach(desc => {
        drawText(`• ${desc}`, margin + 10, y, { size: 10 });
        y -= lineHeight;
      });
      y -= 8;
      ensureSpace(120);
    }
  }
  
  // Skills
  if (resume.skills.length > 0) {
    ensureSpace(150);
    
    drawText('SKILLS', margin, y, { size: 12, bold: true });
    y -= lineHeight + 2;
    
    const skillsByCategory: { [key: string]: string[] } = {};
    resume.skills.forEach(skill => {
      const category = skill.category || 'General';
      if (!skillsByCategory[category]) skillsByCategory[category] = [];
      skillsByCategory[category].push(`${skill.name} (${skill.level}/5)`);
    });
    
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      drawText(`${category}: ${skills.join(', ')}`, margin, y, { size: 10 });
      y -= lineHeight;
    });
    y -= 10;
  }
  
  // Education
  if (resume.education.length > 0) {
    ensureSpace(120);
    
    drawText('EDUCATION', margin, y, { size: 12, bold: true });
    y -= lineHeight + 4;
    
    resume.education.forEach(edu => {
      drawText(edu.degree, margin, y, { size: 11, bold: true });
      y -= lineHeight;
      
      drawText(
        `${edu.institution} | ${edu.location} | ${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}`,
        margin,
        y,
        { size: 9, color: rgb(0.3, 0.3, 0.3) }
      );
      y -= lineHeight + 6;
    });
  }
  
  // Watermark
  if (includeWatermark) {
    const pages = pdfDoc.getPages();
    pages.forEach(pg => {
      pg.drawText('JobKit Pro', {
        x: 50,
        y: 30,
        size: 8,
        color: rgb(0.7, 0.7, 0.7),
      });
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  // Use ArrayBuffer to avoid TS BlobPart type issues
  // Force copy into standard ArrayBuffer to avoid SharedArrayBuffer type issues
  const arrayBuffer = new ArrayBuffer(pdfBytes.length);
  const view = new Uint8Array(arrayBuffer);
  view.set(pdfBytes);
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}

export async function generateCoverLetterPDF(
  letter: CoverLetter,
  personalInfo: { fullName: string; email: string; phone: string; location: string },
  includeWatermark: boolean = false
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const page = pdfDoc.addPage([595.276, 841.890]); // A4
  const { width, height } = page.getSize();
  
  let y = height - 50;
  const margin = 60;
  const lineHeight = 16;
  
  const drawText = (text: string, x: number, yPos: number, options: any = {}) => {
    page.drawText(text, {
      x,
      y: yPos,
      size: options.size || 11,
      font: options.bold ? helveticaBold : helvetica,
      color: rgb(0, 0, 0),
      maxWidth: options.maxWidth || (width - margin * 2),
    });
  };
  
  // Header block with separator
  drawText(personalInfo.fullName, margin, y, { size: 14, bold: true });
  y -= lineHeight;
  drawText(`${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}`, margin, y, { size: 9 });
  y -= lineHeight * 1.5;
  // Separator line under header (add missing y in end point)
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.75,0.75,0.75) });
  y -= lineHeight * 1.2;
  
  // Date
  const date = new Date(letter.createdAt).toLocaleDateString('sw-TZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  drawText(date, margin, y, { size: 10 });
  y -= lineHeight * 2;
  
  // Company info
  drawText(letter.company, margin, y, { size: 11, bold: true });
  y -= lineHeight * 2;
  
  // Greeting
  drawText(letter.content.greeting, margin, y, { size: 11 });
  y -= lineHeight * 2;
  
  // Intro
  const introLines = wrapText(letter.content.intro, width - margin * 2, helvetica, 11);
  introLines.forEach(line => {
    drawText(line, margin, y, { size: 11 });
    y -= lineHeight;
  });
  y -= lineHeight;
  
  // Body paragraphs
  letter.content.body_paragraphs.forEach(paragraph => {
    const lines = wrapText(paragraph, width - margin * 2, helvetica, 11);
    lines.forEach(line => {
      drawText(line, margin, y, { size: 11 });
      y -= lineHeight;
    });
    y -= lineHeight;
  });
  
  // Closing
  const closingLines = wrapText(letter.content.closing, width - margin * 2, helvetica, 11);
  closingLines.forEach(line => {
    drawText(line, margin, y, { size: 11 });
    y -= lineHeight;
  });
  y -= lineHeight * 2;
  
  // Signature
  drawText(letter.content.signature, margin, y, { size: 11 });
  y -= lineHeight;
  drawText(personalInfo.fullName, margin, y, { size: 11, bold: true });
  y -= lineHeight * 2;
  // Footer line and repeated contact info for easy reference
  // Footer separator (add missing y in end point)
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.75,0.75,0.75) });
  y -= lineHeight;
  drawText(`${personalInfo.email} | ${personalInfo.phone}`, margin, y, { size: 9, color: rgb(0.2,0.2,0.2) });
  
  // Watermark
  if (includeWatermark) {
    page.drawText('JobKit Pro', {
      x: 50,
      y: 30,
      size: 8,
      color: rgb(0.7, 0.7, 0.7),
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  const arrayBuffer = new ArrayBuffer(pdfBytes.length);
  const view = new Uint8Array(arrayBuffer);
  view.set(pdfBytes);
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
