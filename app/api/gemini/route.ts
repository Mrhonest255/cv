import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiRequest, GeminiResponse } from '@/lib/types';

// Simple rate limiting (in-memory)
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  limit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Umefika kikomo cha maombi. Tafadhali subiri kidogo.' },
        { status: 429 }
      );
    }
    
    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Huduma haipo tayari. Tafadhali jaribu tena baadaye.' },
        { status: 500 }
      );
    }
    
    // Parse and validate request
    const body: GeminiRequest = await req.json();
    const { jobText, resumeSnapshot, tone = 'Friendly', lang = 'sw', model = 'gemini-2.0-flash-exp', keywords = [] } = body;
    
    // Validate input length
    if (!jobText || jobText.length > 10000) {
      return NextResponse.json(
        { error: 'Maelezo ya kazi ni marefu sana au hayajatolewa.' },
        { status: 400 }
      );
    }
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });
    
    // Define structured output schema
    const schema = {
      type: "object" as const,
      properties: {
        greeting: { type: "string" as const, description: "Professional greeting" },
        intro: { type: "string" as const, description: "Opening paragraph introducing yourself and expressing interest" },
        body_paragraphs: { 
          type: "array" as const, 
          items: { type: "string" as const },
          description: "2-3 body paragraphs highlighting relevant experience and skills"
        },
        closing: { type: "string" as const, description: "Closing paragraph with call to action" },
        signature: { type: "string" as const, description: "Professional sign-off" },
        tone: { type: "string" as const, description: "Tone used in the letter" },
        target_keywords: { 
          type: "array" as const, 
          items: { type: "string" as const },
          description: "Keywords emphasized in the letter"
        }
      },
      required: ["greeting", "intro", "body_paragraphs", "closing", "signature"]
    };
    
    // Build prompt
    const languageName = lang === 'sw' ? 'Kiswahili' : 'English';
    const toneDescription = {
      'Friendly': lang === 'sw' ? 'rafiki na wa karibu' : 'friendly and approachable',
      'Technical': lang === 'sw' ? 'kitaalamu na wenye usahihi' : 'technical and precise',
      'Leadership': lang === 'sw' ? 'wa uongozi na wenye kuhamasisha' : 'leadership-oriented and inspiring'
    }[tone];
    
    const systemPrompt = `You are an expert career writer and HR professional. Create a compelling, personalized cover letter in ${languageName}.

GUIDELINES:
- Write in ${languageName} language ONLY
- Tone: ${toneDescription}
- Length: 3-4 concise paragraphs (250-350 words total)
- Be specific about matching qualifications from the resume to job requirements
- Emphasize these keywords naturally: ${keywords.join(', ')}
- Show enthusiasm and cultural fit
- Include specific examples from experience when relevant
- Avoid generic phrases; be authentic and compelling
- Format as proper business letter structure
- Use professional ${languageName} business writing conventions

STRUCTURE:
1. Greeting: Use "Ndugu Mheshimiwa" for Swahili, "Dear Hiring Manager" for English (customize if company name provided)
2. Intro: Strong opening expressing interest and brief overview of your fit
3. Body (2-3 paragraphs): Match your experience/skills to job requirements with specific examples
4. Closing: Call to action, availability for interview, thank you
5. Signature: Professional sign-off appropriate for ${languageName}`;

    const userPrompt = `JOB POSTING:
${jobText}

CANDIDATE RESUME SUMMARY:
Name: ${resumeSnapshot.personalInfo?.fullName || 'Candidate'}
Summary: ${resumeSnapshot.summary || ''}
Key Skills: ${resumeSnapshot.skills?.map(s => s.name).join(', ') || ''}
Experience: ${resumeSnapshot.experience?.map(e => `${e.title} at ${e.company} (${e.startDate} - ${e.current ? 'Present' : e.endDate})`).join('; ') || ''}
Education: ${resumeSnapshot.education?.map(e => `${e.degree} from ${e.institution}`).join('; ') || ''}

Write a compelling cover letter that demonstrates why this candidate is perfect for this role.`;
    
    // Temperature based on tone
    const temperature = tone === 'Technical' ? 0.6 : tone === 'Leadership' ? 0.8 : 0.75;
    
    // Generate content with streaming
    const result = await geminiModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
        }
      ],
      generationConfig: {
        temperature,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });
    
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    let parsedResponse: GeminiResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json(
        { error: 'Hitilafu katika kusindika jibu. Tafadhali jaribu tena.' },
        { status: 500 }
      );
    }
    
    // Log success (without sensitive data)
    console.log(`Cover letter generated: ${model}, ${lang}, ${tone}`);
    
    return NextResponse.json(parsedResponse);
    
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Tatizo la ufunguo wa API. Tafadhali wasiliana na msimamizi.' },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return NextResponse.json(
        { error: 'Huduma imeshindwa kwa sasa. Tafadhali jaribu tena baadaye.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Hitilafu imetokea. Tafadhali jaribu tena.' },
      { status: 500 }
    );
  }
}
