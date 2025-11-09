import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per window
const WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: `You are a professional CV/Resume building assistant. Your role is to help users create comprehensive, professional CVs through conversation.

IMPORTANT GUIDELINES:
- Ask focused questions one at a time to extract CV information
- Be conversational and encouraging
- Extract: personal info, work experience (title, company, dates, achievements), education, skills, certifications, languages, interests
- When user provides info, acknowledge it and ask for the next relevant detail
- Suggest improvements: action verbs, quantifiable achievements, relevant keywords
- Keep responses concise (2-3 sentences max per turn)
- Use a mix of Swahili and English as appropriate
- DO NOT generate full CV text; focus on collecting and refining individual sections
- When a section is complete, confirm and move to the next

Current CV context: ${context || 'Empty - starting fresh'}`,
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ 
      message: text,
      role: 'assistant'
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process chat' },
      { status: 500 }
    );
  }
}
