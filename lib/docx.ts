import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
} from 'docx';
import type { Resume, CoverLetter } from './types';

export async function generateResumeDOCX(resume: Resume): Promise<Blob> {
  const sections: Paragraph[] = [];
  
  // Header
  sections.push(
    new Paragraph({
      text: resume.personalInfo.fullName,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );
  
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `${resume.personalInfo.email} | ${resume.personalInfo.phone} | ${resume.personalInfo.location}`,
          size: 20,
        }),
      ],
    })
  );
  
  if (resume.personalInfo.linkedin || resume.personalInfo.portfolio) {
    const links = [resume.personalInfo.linkedin, resume.personalInfo.portfolio].filter(Boolean).join(' | ');
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({ text: links, size: 20, color: '0000FF', underline: {} }),
        ],
      })
    );
  }
  
  // Summary
  if (resume.summary) {
    sections.push(
      new Paragraph({
        text: 'SUMMARY',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        text: resume.summary,
        spacing: { after: 300 },
      })
    );
  }
  
  // Experience
  if (resume.experience.length > 0) {
    sections.push(
      new Paragraph({
        text: 'EXPERIENCE',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    
    resume.experience.forEach(exp => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 24 }),
          ],
          spacing: { after: 50 },
        })
      );
      
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company} | ${exp.location} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 100 },
        })
      );
      
      exp.description.forEach(desc => {
        sections.push(
          new Paragraph({
            text: desc,
            bullet: { level: 0 },
            spacing: { after: 50 },
          })
        );
      });
      
      sections.push(new Paragraph({ spacing: { after: 200 } }));
    });
  }
  
  // Skills
  if (resume.skills.length > 0) {
    sections.push(
      new Paragraph({
        text: 'SKILLS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    
    const skillsByCategory: { [key: string]: string[] } = {};
    resume.skills.forEach(skill => {
      const category = skill.category || 'General';
      if (!skillsByCategory[category]) skillsByCategory[category] = [];
      skillsByCategory[category].push(`${skill.name} (${skill.level}/5)`);
    });
    
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${category}: `, bold: true }),
            new TextRun({ text: skills.join(', ') }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }
  
  // Education
  if (resume.education.length > 0) {
    sections.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    
    resume.education.forEach(edu => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 24 }),
          ],
          spacing: { after: 50 },
        })
      );
      
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.institution} | ${edu.location} | ${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}`,
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }
  
  // Projects
  if (resume.projects.length > 0) {
    sections.push(
      new Paragraph({
        text: 'PROJECTS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    
    resume.projects.forEach(proj => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.title, bold: true, size: 24 }),
          ],
          spacing: { after: 50 },
        })
      );
      
      sections.push(
        new Paragraph({
          text: proj.description,
          spacing: { after: 50 },
        })
      );
      
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Technologies: ', bold: true }),
            new TextRun({ text: proj.technologies.join(', ') }),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }
  
  const doc = new Document({
    sections: [{ children: sections }],
  });
  
  const buffer = await Packer.toBlob(doc);
  return buffer;
}

export async function generateCoverLetterDOCX(
  letter: CoverLetter,
  personalInfo: { fullName: string; email: string; phone: string; location: string }
): Promise<Blob> {
  const sections: Paragraph[] = [];
  
  // Header
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: personalInfo.fullName, bold: true, size: 24 }),
      ],
      spacing: { after: 50 },
    })
  );
  
  sections.push(
    new Paragraph({
      text: personalInfo.email,
      spacing: { after: 50 },
    })
  );
  
  sections.push(
    new Paragraph({
      text: personalInfo.phone,
      spacing: { after: 50 },
    })
  );
  
  sections.push(
    new Paragraph({
      text: personalInfo.location,
      spacing: { after: 300 },
    })
  );
  
  // Date
  const date = new Date(letter.createdAt).toLocaleDateString('sw-TZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  sections.push(
    new Paragraph({
      text: date,
      spacing: { after: 300 },
    })
  );
  
  // Company
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: letter.company, bold: true }),
      ],
      spacing: { after: 300 },
    })
  );
  
  // Greeting
  sections.push(
    new Paragraph({
      text: letter.content.greeting,
      spacing: { after: 200 },
    })
  );
  
  // Intro
  sections.push(
    new Paragraph({
      text: letter.content.intro,
      spacing: { after: 200 },
    })
  );
  
  // Body paragraphs
  letter.content.body_paragraphs.forEach(paragraph => {
    sections.push(
      new Paragraph({
        text: paragraph,
        spacing: { after: 200 },
      })
    );
  });
  
  // Closing
  sections.push(
    new Paragraph({
      text: letter.content.closing,
      spacing: { after: 200 },
    })
  );
  
  // Signature
  sections.push(
    new Paragraph({
      text: letter.content.signature,
      spacing: { after: 100 },
    })
  );
  
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: personalInfo.fullName, bold: true }),
      ],
    })
  );
  
  const doc = new Document({
    sections: [{ children: sections }],
  });
  
  const buffer = await Packer.toBlob(doc);
  return buffer;
}

export function downloadDOCX(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
