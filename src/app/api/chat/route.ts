import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction:
    "You are a tutor for computer science students. Only answer questions related to computer science coursework, assignments, and academic topics (programming, data structures, algorithms, compilers, operating systems, networking, databases, AI, ML, computer architecture, discrete math, cybersecurity, software engineering, etc.). Politely decline anything off-topic — no entertainment, news, general advice, or personal chat. Keep answers concise and focused on helping the student learn.",
});

async function generateWithRetry(contents: any, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent({ contents });
      return result.response.text();
    } catch (err: any) {
      if ((err.message?.includes("429") || err.message?.includes("503")) && i < retries - 1) {
        await new Promise((r) => setTimeout(r, (i + 1) * 5000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") as string | null;
    const history = formData.get("history") as string | null;
    const file = formData.get("file") as File | null;

    const parsedHistory: { role: string; text: string }[] = history ? JSON.parse(history) : [];

    const contents: any[] = [];

    for (const msg of parsedHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      });
    }

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type;
      contents.push({
        role: "user",
        parts: [
          { inlineData: { mimeType, data: buffer.toString("base64") } },
          { text: message || "Analyze this document." },
        ],
      });
    } else if (message) {
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });
    } else {
      return NextResponse.json({ error: "Please provide a message or a file." }, { status: 400 });
    }

    const response = await generateWithRetry(contents);
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Gemini API error:", error);

    if (error.message?.includes("429")) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait and try again." },
        { status: 429 }
      );
    }

    if (error.message?.includes("503")) {
      return NextResponse.json(
        { error: "Model is overloaded. Try again." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
