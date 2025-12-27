import { aiService } from "@/services/container";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validació bàsica
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Format de missatges incorrecte" }, { status: 400 });
    }

    // Separem l'últim missatge de l'històric
    const lastMessage = messages[messages.length - 1].content;
    const history = messages.slice(0, -1); // Tot menys l'últim

    // Cridem al servei
    const responseContent = await aiService.generateChatResponse(history, lastMessage);

    return NextResponse.json({ role: 'assistant', content: responseContent });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Error intern del servidor" }, { status: 500 });
  }
}