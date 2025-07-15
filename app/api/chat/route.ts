import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatRequest {
  message: string;
  chatHistory: ChatMessage[];
}

interface ChatResponse {
  id: string;
  content: string;
  timestamp: string;
}

// In-memory storage for chat sessions (in production, use a database)
const chatSessions = new Map<string, ChatMessage[]>();

// Mock LLM response function
async function generateLLMResponse(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  // Mock responses based on message content
  const responses = [
    "That's an interesting question! Let me think about that for a moment.",
    "I understand what you're asking. Here's my perspective on that topic.",
    "Great point! This relates to several important concepts I'd like to explore.",
    "I can help you with that. Let me break this down step by step.",
    "That's a complex topic with multiple angles to consider.",
    "I appreciate you bringing this up. It's definitely worth discussing in detail.",
  ];

  // Simple keyword-based responses for demo
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How can I assist you today?";
  }
  if (lowerMessage.includes("help")) {
    return "I'd be happy to help you! What specific assistance do you need?";
  }
  if (lowerMessage.includes("code") || lowerMessage.includes("programming")) {
    return "I can definitely help with coding questions! What programming language or concept are you working with?";
  }

  // Return random response with some context
  return (
    responses[Math.floor(Math.random() * responses.length)] +
    ` You mentioned: "${message.slice(0, 50)}${
      message.length > 50 ? "..." : ""
    }"`
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, chatHistory } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Generate session ID from request headers or create new one
    const sessionId = request.headers.get("x-session-id") || "default";

    // Store or update chat history
    chatSessions.set(sessionId, chatHistory);

    // Generate LLM response
    const responseContent = await generateLLMResponse(message, chatHistory);

    const response: ChatResponse = {
      id: `ai-${Date.now()}`,
      content: responseContent,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Chat API is running",
    timestamp: new Date().toISOString(),
  });
}
