"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  PlusIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { useDebounce } from "../hooks/useDebounce";
import { chatAPI } from "../services/chatAPI";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const STORAGE_KEY = "chat-history";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debounce input for potential auto-save or typing indicators
  const debouncedInputValue = useDebounce(inputValue, 500);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Call the chat API
      const response = await chatAPI.sendMessage(inputValue.trim(), messages);

      const aiMessage: Message = {
        id: response.id,
        content: response.content,
        isUser: false,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content:
          "Sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  // Handle debounced input (could be used for typing indicators)
  useEffect(() => {
    if (debouncedInputValue) {
      // Here you could implement typing indicators or auto-save draft
      console.log("Debounced input:", debouncedInputValue);
    }
  }, [debouncedInputValue]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={clearChat}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-800 rounded-lg transition-colors"
            title="New Chat"
          >
            <Bars3Icon className="size-5" />
          </button>
          <h1 className="text-lg font-semibold">ChatGPT</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
            Get Plus
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-light mb-2">
                What are you working on?
              </h2>
            </div>
          </div>
        ) : (
          // Messages
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    <p className="text-sm md:text-base whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 bg-gray-800 text-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2">
            {/* Tools Button */}
            <button
              type="button"
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 hover:bg-gray-800 rounded-lg transition-colors"
              title="Tools"
            >
              <PlusIcon className="size-5" />
            </button>

            {/* Input Container */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-12 max-h-32 overflow-y-auto disabled:opacity-50"
                rows={1}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="size-5" />
              </button>
            </div>

            {/* Voice Button */}
            <button
              type="button"
              onClick={() => setIsListening(!isListening)}
              disabled={isLoading}
              className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-colors disabled:opacity-50 ${
                isListening
                  ? "bg-red-600 hover:bg-red-700"
                  : "hover:bg-gray-800"
              }`}
              title="Microphone"
            >
              <MicrophoneIcon className="size-5" />
            </button>
          </div>
        </form>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 text-center mt-3">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
