import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Resume, CoverLetter } from './types';

type ResumeTemplate = Resume['template'];

interface PDFTheme {
  headerBg?: ReturnType<typeof rgb>;
  headerTextColor: ReturnType<typeof rgb>;
  bodyColor: ReturnType<typeof rgb>;
  headingColor: ReturnType<typeof rgb>;
  subheadingColor: ReturnType<typeof rgb>;
  accentColor: ReturnType<typeof rgb>;
}

const templateThemes: Record<ResumeTemplate extends string ? ResumeTemplate : string, PDFTheme> = {
  classic: {
    headerTextColor: rgb(0, 0, 0),
    bodyColor: rgb(0.1, 0.1, 0.1),
    headingColor: rgb(0.05, 0.05, 0.4),
    subheadingColor: rgb(0.35, 0.35, 0.35),
    accentColor: rgb(0.1, 0.2, 0.5),
  },
  modern: {
    headerBg: rgb(0.09, 0.18, 0.36),
    headerTextColor: rgb(1, 1, 1),
    bodyColor: rgb(0.1, 0.1, 0.12),
    headingColor: rgb(0.24, 0.56, 0.98),
    subheadingColor: rgb(0.6, 0.6, 0.68),
    accentColor: rgb(0.24, 0.56, 0.98),
  },
  compact: {
    headerBg: rgb(0.12, 0.19, 0.32),
    headerTextColor: rgb(1, 1, 1),
    bodyColor: rgb(0.1, 0.1, 0.1),
    headingColor: rgb(0.18, 0.47, 0.87),
    subheadingColor: rgb(0.45, 0.45, 0.5),
    accentColor: rgb(0.18, 0.47, 0.87),
  },
  professional: {
    headerBg: rgb(0.13, 0.16, 0.24),
    headerTextColor: rgb(1, 1, 1),
    bodyColor: rgb(0.08, 0.08, 0.1),
    headingColor: rgb(0.9, 0.58, 0.1),
    subheadingColor: rgb(0.55, 0.55, 0.6),
    accentColor: rgb(0.9, 0.58, 0.1),
  },
  ordered: {
    headerTextColor: rgb(0, 0, 0),
    bodyColor: rgb(0.1, 0.1, 0.1),
    headingColor: rgb(0.2, 0.2, 0.6),
    subheadingColor: rgb(0.4, 0.4, 0.45),
    accentColor: rgb(0.2, 0.2, 0.6),
  },
  elegant: {
    headerBg: rgb(0.72, 0.23, 0.56),
    headerTextColor: rgb(1, 1, 1),
    bodyColor: rgb(0.08, 0.08, 0.09),
    headingColor: rgb(0.52, 0, 0.45),
    subheadingColor: rgb(0.35, 0.35, 0.42),
    accentColor: rgb(0.95, 0.55, 0.75),
  },
  glass: {
    headerBg: rgb(0.13, 0.24, 0.36),
    headerTextColor: rgb(1, 1, 1),
    bodyColor: rgb(0.08, 0.08, 0.1),
    headingColor: rgb(0.33, 0.68, 0.99),
    subheadingColor: rgb(0.5, 0.5, 0.55),
    accentColor: rgb(0.45, 0.77, 0.98),
  },
};

const defaultTheme: PDFTheme = {
  headerTextColor: rgb(0, 0, 0),
  bodyColor: rgb(0.1, 0.1, 0.1),
  headingColor: rgb(0.1, 0.1, 0.1),
  subheadingColor: rgb(0.35, 0.35, 0.35),
  accentColor: rgb(0.1, 0.1, 0.1),
};

export async function generateResumePDF(
  resume: Resume,
  options: { layout?: '1-column' | '2-column'; template?: ResumeTemplate; includeWatermark?: boolean } = {}
): Promise<Blob> {
  const { layout = '1-column', template = 'classic', includeWatermark = false } = options;
  const theme = templateThemes[template] ?? defaultTheme;

  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595.276, 841.890]);
  let { width, height } = page.getSize();
  const margin = 50;
  const lineHeight = 14;
  const bottomMargin = 60;

  const drawText = (text: string, x: number, yPos: number, options: any = {}) => {
    page.drawText(text, {
      x,
      y: yPos,
      size: options.size || 11,
      font: options.bold ? helveticaBold : helvetica,
      color: options.color || theme.bodyColor,
      maxWidth: options.maxWidth || (width - margin * 2),
    });
  };

  const drawBannerHeader = () => {
    let startY: number;
    if (theme.headerBg) {
      const headerHeight = 100;
      page.drawRectangle({
        x: 0,
        y: height - headerHeight,
        width,
        height: headerHeight,
        color: theme.headerBg,
      });
      drawText(resume.personalInfo.fullName || 'Unnamed Candidate', margin, height - 45, {
        size: 22,
        bold: true,
        color: theme.headerTextColor,
      });
      drawText(
        `${resume.personalInfo.email || ''} ${resume.personalInfo.email && resume.personalInfo.phone ? '|' : ''} ${resume.personalInfo.phone || ''}`.trim(),
        margin,
        height - 62,
        { size: 10, color: theme.headerTextColor }
      );
      drawText(
        [resume.personalInfo.location, resume.personalInfo.linkedin, resume.personalInfo.portfolio]
          .filter(Boolean)
          .join(' • '),
        margin,
        height - 78,
        { size: 10, color: theme.headerTextColor }
      );
      startY = height - headerHeight - 30;
    } else {
      startY = height - 50;
      drawText(resume.personalInfo.fullName || 'Unnamed Candidate', margin, startY, { size: 20, bold: true });
      startY -= 24;
      drawText(
        `${resume.personalInfo.email || ''} ${resume.personalInfo.email && resume.personalInfo.phone ? '|' : ''} ${resume.personalInfo.phone || ''}`.trim(),
        margin,
        startY,
        { size: 10 }
      );
      startY -= 18;
      const links = [resume.personalInfo.location, resume.personalInfo.linkedin, resume.personalInfo.portfolio]
        .filter(Boolean)
        .join(' • ');
      if (links) {
        drawText(links, margin, startY, { size: 10, color: theme.subheadingColor });
        startY -= 18;
      } else {
        startY -= 12;
      }
      page.drawLine({
        start: { x: margin, y: startY },
        end: { x: width - margin, y: startY },
        thickness: 1,
        color: theme.subheadingColor,
      });
      startY -= 20;
    }
    return startY;
  };

  const addNewPage = () => {
    page = pdfDoc.addPage([595.276, 841.890]);
    ({ width, height } = page.getSize());
    y = drawBannerHeader();
  };

  let y = drawBannerHeader();

  const ensureSpace = (needed: number) => {
    if (y - needed < bottomMargin) {
      addNewPage();
    }
  };

  const drawHeading = (title: string) => {
    drawText(title.toUpperCase(), margin, y, { size: 12, bold: true, color: theme.headingColor });
    y -= lineHeight + 2;
  };

  const drawExperience = () => {
    if (!resume.experience.length) return;
    drawHeading('Experience');
    for (const exp of resume.experience) {
      ensureSpace(90);
      drawText(exp.title || 'Cheo', margin, y, { size: 11, bold: true });
      y -= lineHeight;
      drawText(
        `${exp.company || ''} ${exp.company && exp.location ? '•' : ''} ${exp.location || ''} ${exp.startDate ? `• ${exp.startDate}` : ''} ${exp.endDate || exp.current ? `- ${exp.current ? 'Present' : exp.endDate}` : ''}`.trim(),
        margin,
        y,
        { size: 9, color: theme.subheadingColor }
      );
      y -= lineHeight;
      exp.description.filter(Boolean).forEach(desc => {
        drawText(`• ${desc}`, margin + 10, y, { size: 10 });
        y -= lineHeight;
      });
      y -= 6;
    }
  };

  const drawSummary = () => {
    if (!resume.summary) return;
    drawHeading('Summary');
    const lines = wrapText(resume.summary, width - margin * 2, helvetica, 10);
    lines.forEach(line => {
      drawText(line, margin, y, { size: 10 });
      y -= lineHeight;
    });
    y -= 6;
  };

  const drawSkills = () => {
    if (!resume.skills.length) return;
    ensureSpace(70);
    drawHeading('Skills');
    const skillsByCategory: Record<string, string[]> = {};
    resume.skills.forEach(skill => {
      const category = skill.category || 'General';
      if (!skillsByCategory[category]) skillsByCategory[category] = [];
      skillsByCategory[category].push(skill.name);
    });
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      drawText(`${category}: ${skills.join(', ')}`, margin, y, { size: 10, color: theme.bodyColor });
      y -= lineHeight;
    });
    y -= 6;
  };

  const drawEducation = () => {
    if (!resume.education.length) return;
    ensureSpace(80);
    drawHeading('Education');
    resume.education.forEach(edu => {
      drawText(`${edu.degree || 'Shahada'} • ${edu.institution || ''}`.trim(), margin, y, { size: 11, bold: true });
      y -= lineHeight;
      drawText(
        `${edu.location || ''} ${edu.startDate ? `• ${edu.startDate}` : ''} ${edu.current ? '- Present' : edu.endDate ? `- ${edu.endDate}` : ''}`.trim(),
        margin,
        y,
        { size: 9, color: theme.subheadingColor }
      );
      y -= lineHeight + 4;
    });
  };

  const drawCertifications = () => {
    if (!resume.certifications.length) return;
    ensureSpace(70);
    drawHeading('Certifications');
    resume.certifications.forEach(cert => {
      drawText(cert.name || 'Cheti', margin, y, { size: 10, bold: true });
      y -= lineHeight;
      drawText(`${cert.issuer || ''} ${cert.date ? `• ${cert.date}` : ''}`.trim(), margin, y, {
        size: 9,
        color: theme.subheadingColor,
      });
      y -= lineHeight;
    });
    y -= 6;
  };

  const drawLanguages = () => {
    if (!resume.languages.length) return;
    ensureSpace(60);
    drawHeading('Languages');
    resume.languages.forEach(lang => {
      drawText(`${lang.name || ''} ${lang.proficiency ? `• ${lang.proficiency}` : ''}`.trim(), margin, y, { size: 10 });
      y -= lineHeight;
    });
    y -= 6;
  };

  const drawInterests = () => {
    if (!resume.interests.length) return;
    ensureSpace(50);
    drawHeading('Interests');
    drawText(resume.interests.join(', '), margin, y, { size: 10 });
    y -= lineHeight + 6;
  };

  const drawReferences = () => {
    if (!resume.references) return;
    ensureSpace(40);
    drawHeading('References');
    drawText(resume.references, margin, y, { size: 10 });
    y -= lineHeight + 6;
  };

  if (layout === '2-column') {
    // Render compact summary/skills first to emulate template styling
    drawSummary();
    drawSkills();
    drawLanguages();
    drawCertifications();
    drawExperience();
    drawEducation();
    drawInterests();
    drawReferences();
  } else {
    drawSummary();
    drawExperience();
    drawEducation();
    drawSkills();
    drawCertifications();
    drawLanguages();
    drawInterests();
    drawReferences();
  }

  if (includeWatermark) {
    pdfDoc.getPages().forEach(pg => {
      pg.drawText('JobKit Pro', {
        x: 50,
        y: 30,
        size: 8,
        color: rgb(0.7, 0.7, 0.7),
      });
    });
  }

  const pdfBytes = await pdfDoc.save();
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
