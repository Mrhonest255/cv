import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Ensure you have your Gemini API key in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { text, prompt } = await req.json();

    if (!text || !prompt) {
      return NextResponse.json(
        { error: "Text and prompt are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `${prompt}:\n\n"${text}"`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const improvedText = response.text();

    return NextResponse.json({ improvedText });
  } catch (error) {
    console.error("Error improving text:", error);
    return NextResponse.json(
      { error: "Failed to improve text" },
      { status: 500 }
    );
  }
}
