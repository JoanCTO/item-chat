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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <button
            onClick={clearChat}
            className="flex items-center justify-center w-10 h-10 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105"
            title="New Chat"
          >
            <Bars3Icon className="size-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-light text-slate-700">ItemChat</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25">
            Get Plus
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="text-center mb-12 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-light mb-4 text-slate-700 leading-relaxed">
                All the basics,
              </h2>
              <p className="text-xl md:text-2xl text-slate-500 font-light">
                connected to something far smarter
              </p>
            </div>
          </div>
        ) : (
          // Messages
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm ${
                      message.isUser
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/20"
                        : "bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200/60 shadow-slate-200/40"
                    }`}
                  >
                    <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-500 font-light">
                        Thinking...
                      </span>
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
      <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200/60 p-6">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-3">
            {/* Tools Button */}
            <button
              type="button"
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105"
              title="Tools"
            >
              <PlusIcon className="size-5 text-slate-600" />
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
                className="w-full bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-5 py-4 pr-14 text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white transition-all duration-200 disabled:opacity-50 min-h-12 max-h-32 overflow-y-auto shadow-sm shadow-slate-200/50"
                rows={1}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-slate-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
              >
                <PaperAirplaneIcon className="size-5" />
              </button>
            </div>

            {/* Voice Button */}
            <button
              type="button"
              onClick={() => setIsListening(!isListening)}
              disabled={isLoading}
              className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
                isListening
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Microphone"
            >
              <MicrophoneIcon className="size-5" />
            </button>
          </div>
        </form>

        {/* Footer Text */}
        <p className="text-xs text-slate-400 text-center mt-4 font-light">
          ItemChat can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
