import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';


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

// Generation config based on Flutter reference
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

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

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    // Initialize per request to ensure fresh key and avoid empty constructor
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use gemini-2.5-flash as per Flutter reference (fastest, cheapest)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig,
      safetySettings,
    });

    // Build chat history ensuring it starts with a user message
  const roles = Array.isArray(messages) ? messages.map((m: any) => m.role) : [];
    const firstUserIndex = roles.findIndex((r: string) => r === 'user');
  let historySource = firstUserIndex === -1 ? [] : messages.slice(firstUserIndex, -1);
  // limit history to last 12 turns to avoid overlong prompts
  if (historySource.length > 12) historySource = historySource.slice(-12);
    if (process.env.NODE_ENV === 'development') {
      console.log('[chat] incoming roles:', roles);
      console.log('[chat] firstUserIndex:', firstUserIndex);
      console.log('[chat] history roles:', historySource.map((m: any) => m.role));
    }

    const systemInstruction = `You are a professional CV/Resume building assistant. Your role is to help users create comprehensive, professional CVs through conversation.

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

Current CV context: ${context || 'Empty - starting fresh'}`;

    const chat = model.startChat({
      systemInstruction,
      history: historySource.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    // Send the last message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 });
    }
  const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ 
      message: text,
      role: 'assistant'
    });

  } catch (error: any) {
    console.error('Chat API error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    // More detailed error response
    const errorMessage = error?.message || 'Failed to process chat';
    const statusCode = typeof error?.status === 'number' ? error.status : 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: statusCode }
    );
  }
}
