"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Bars3Icon } from "@heroicons/react/24/solid";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Derive loading state from status
  const isLoading = status === "streaming";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("itemchat-messages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error("Failed to load saved messages:", error);
        localStorage.removeItem("itemchat-messages");
      }
    }
    setIsInitialized(true);
  }, [setMessages]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      try {
        localStorage.setItem("itemchat-messages", JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save messages:", error);
      }
    }
  }, [messages, isInitialized]);

  // Clear chat function
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("itemchat-messages");
    setInput("");
  };

  // Animation variants
  const messageVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const loadingVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-slate-200/60"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="flex items-center justify-center w-10 h-10 hover:bg-slate-100 rounded-xl transition-all duration-200"
            title="Clear Chat"
          >
            <Bars3Icon className="size-5 text-slate-600" />
          </motion.button>
          <h1 className="text-xl font-light text-slate-700">ItemChat</h1>
          {messages.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
            >
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </motion.span>
          )}
          {status !== "ready" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-xs px-2 py-1 rounded-full ${
                status === "streaming"
                  ? "bg-blue-100 text-blue-700"
                  : status === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {status === "streaming"
                ? "Responding..."
                : status === "error"
                ? "Error"
                : status}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25">
            Get Plus
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center justify-center h-full px-6"
          >
            <div className="text-center mb-12 max-w-2xl">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-3xl md:text-4xl font-light mb-4 text-slate-700 leading-relaxed"
              >
                All the basics,
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-xl md:text-2xl text-slate-500 font-light"
              >
                connected to something far smarter
              </motion.p>

              {/* Error Message in Empty State */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-700 font-medium">
                          Connection Error
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {error.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          // Messages
          <div className="flex flex-col h-full">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/20"
                          : "bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200/60 shadow-slate-200/40"
                      }`}
                    >
                      <div className="text-sm md:text-base leading-relaxed">
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case "text":
                              return (
                                <motion.div
                                  key={`${message.id}-${i}`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="whitespace-pre-wrap"
                                >
                                  {part.text}
                                </motion.div>
                              );
                            default:
                              return null;
                          }
                        })}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    variants={loadingVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.2,
                            }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.4,
                            }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                        </div>
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="text-sm text-slate-500 font-light"
                        >
                          Thinking...
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {error && messages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 bg-red-50 border border-red-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-red-700 font-medium">
                            Message failed to send
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            {error.message}
                          </p>
                          <button
                            onClick={() => window.location.reload()}
                            className="text-xs text-red-600 hover:text-red-800 underline mt-2"
                          >
                            Try refreshing the page
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </motion.div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm border-t border-slate-200/60 p-6"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              sendMessage({ text: input });
              setInput("");
            }
          }}
          className="relative"
        >
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
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                value={input}
                placeholder="Ask me anything..."
                onChange={(e) => setInput(e.currentTarget.value)}
                disabled={status !== "ready"}
                className="w-full bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-5 py-4 pr-14 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white transition-all duration-200 shadow-sm shadow-slate-200/50 disabled:opacity-50"
              />

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim() || status !== "ready"}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-slate-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <PaperAirplaneIcon className="size-5" />
              </motion.button>
            </div>

            {/* Voice Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              disabled={status !== "ready"}
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 hover:bg-slate-100 text-slate-600 disabled:opacity-50"
              title="Microphone"
            >
              <MicrophoneIcon className="size-5" />
            </motion.button>
          </div>
        </form>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-slate-400 text-center mt-4 font-light"
        >
          ItemChat can make mistakes. Check important info.
        </motion.p>
      </motion.div>
    </div>
  );
}
