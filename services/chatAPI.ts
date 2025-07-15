interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatResponse {
  id: string;
  content: string;
  timestamp: string;
}

class ChatAPI {
  private baseUrl = "/api/chat";
  private sessionId = this.generateSessionId();

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(
    message: string,
    chatHistory: Message[]
  ): Promise<ChatResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-ID": this.sessionId,
      },
      body: JSON.stringify({
        message,
        chatHistory,
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(error.error || "Failed to send message");
    }

    return response.json();
  }

  async healthCheck(): Promise<{ message: string; timestamp: string }> {
    const response = await fetch(this.baseUrl, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Health check failed");
    }

    return response.json();
  }
}

export const chatAPI = new ChatAPI();
